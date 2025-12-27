// src/services/websocket/StaffOrderWebSocketService.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

/**
 * WebSocket Service chuyên dụng cho Staff Orders
 * Kết nối với backend Spring Boot WebSocket để nhận thông báo real-time
 */
class StaffOrderWebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.connecting = false; // Cờ để tránh duplicate connection
    this.registered = false; // Cờ để tránh duplicate registration
    this.subscribed = false; // Cờ để tránh duplicate subscription
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.subscriptions = new Map(); // Lưu trữ các subscription đang hoạt động
    this.messageHandlers = new Map(); // Lưu trữ các handler cho từng loại message
    this.staffId = null;
    this.token = null;
    this.debug = true; // Bật debug mode để giám sát WebSocket

    // Message queue để buffer messages khi chưa có handler
    this.messageQueue = new Map(); // Map<messageType, Array<data>>
    this.maxQueueSize = 50; // Giới hạn số message trong queue
    this.queueRetentionTime = 30000; // Thời gian giữ message trong queue (30 giây)

    // Queue processor interval
    this.queueProcessorInterval = null;
    this.startQueueProcessor();
  }

  /**
   * Bắt đầu queue processor để retry xử lý messages định kỳ
   */
  startQueueProcessor() {
    // Dừng interval cũ nếu có
    if (this.queueProcessorInterval) {
      clearInterval(this.queueProcessorInterval);
    }

    // Kiểm tra và xử lý queue mỗi 2 giây
    this.queueProcessorInterval = setInterval(() => {
      this.processAllQueuedMessages();
    }, 2000);
  }

  /**
   * Xử lý tất cả messages trong queue cho tất cả messageTypes
   */
  processAllQueuedMessages() {
    if (this.messageQueue.size === 0) {
      return;
    }

    // Lặp qua tất cả messageTypes trong queue
    for (const [messageType, queue] of this.messageQueue.entries()) {
      if (queue.length > 0 && this.messageHandlers.has(messageType)) {
        this.processQueuedMessages(messageType);
      }
    }
  }

  /**
   * Kết nối đến WebSocket server
   * @param {string} staffId - ID của nhân viên
   * @param {string} token - JWT token để xác thực
   */
  async connect(staffId, token) {
    if (this.connected) {
      return Promise.resolve();
    }

    // Kiểm tra nếu đang trong quá trình kết nối
    if (this.connecting) {
      return Promise.resolve();
    }

    this.connecting = true; // Đánh dấu đang kết nối
    this.staffId = staffId;
    this.token = token;

    // Sử dụng HTTP URL thay vì WebSocket URL vì SockJS sẽ handle protocol
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").trim();
    const wsUrl = `${baseUrl}/ws`;

    return new Promise((resolve, reject) => {
      try {
        // Tạo STOMP client với SockJS fallback
        this.stompClient = new Client({
          webSocketFactory: () => {
            const sockJS = new SockJS(wsUrl, null, {
              // Thêm options cho SockJS để hỗ trợ production với HTTPS
              transports: ["websocket", "xhr-streaming", "xhr-polling"],
              timeout: 10000,
            });

            // Thêm listeners để debug SockJS
            sockJS.onopen = () => {
              console.log("[StaffOrderWS] SockJS connection opened");
            };
            sockJS.onerror = (e) => {
              console.error("[StaffOrderWS] SockJS error:", e);
              console.error("[StaffOrderWS] SockJS error details:", {
                readyState: sockJS.readyState,
                protocol: sockJS.protocol,
                url: sockJS.url,
              });
            };
            sockJS.onclose = (e) => {
              console.log("[StaffOrderWS] SockJS connection closed:", {
                code: e.code,
                reason: e.reason,
                wasClean: e.wasClean,
              });
            };

            return sockJS;
          },
          connectHeaders: token
            ? {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              }
            : {},

          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          // Tăng timeout cho production
          connectionTimeout: 15000,
        });

        // Xử lý khi kết nối thành công
        this.stompClient.onConnect = (frame) => {
          this.connected = true;
          this.connecting = false; // Reset cờ connecting
          this.reconnectAttempts = 0;

          // Đợi để đảm bảo connection ổn định trước khi đăng ký
          setTimeout(() => {
            if (this.stompClient && this.stompClient.connected && this.stompClient.active) {
              // Chỉ đăng ký nếu chưa đăng ký
              if (!this.registered) {
                this.registerStaff();
              }
            } else {
              console.warn("[StaffOrderWS] Connection lost before registration");
            }
          }, 300);

          resolve();
        };

        // Xử lý lỗi STOMP
        this.stompClient.onStompError = (frame) => {
          this.connected = false;
          this.connecting = false;

          const errorMsg = frame.headers?.message || "Unknown STOMP error";
          reject(new Error(`STOMP Error: ${errorMsg}`));
        };

        // Xử lý lỗi WebSocket
        this.stompClient.onWebSocketError = (error) => {
          this.connected = false;
          this.connecting = false;
          reject(error);
        };

        // Xử lý khi WebSocket đóng
        this.stompClient.onWebSocketClose = (event) => {
          this.connected = false;
          this.connecting = false;
          this.registered = false; // Reset để có thể đăng ký lại khi reconnect
          this.subscribed = false; // Reset để có thể subscribe lại khi reconnect
          // Tự động reconnect nếu không phải do người dùng đóng
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        // Xử lý khi ngắt kết nối
        this.stompClient.onDisconnect = () => {
          this.connected = false;
          this.connecting = false;
          this.registered = false;
          this.subscribed = false;
          this.clearSubscriptions();
        };
        // Kích hoạt kết nối
        this.stompClient.activate();

        // Đặt timeout cho kết nối
        setTimeout(() => {
          if (!this.connected) {
            console.error(" Timeout khi kết nối WebSocket");
            reject(new Error("Connection timeout after 15 seconds"));
          }
        }, 15000);
      } catch (error) {
        console.error("Lỗi khi khởi tạo WebSocket:", error);
        this.connected = false;
        reject(error);
      }
    });
  }

  /**
   * Đăng ký staff với server để nhận thông báo
   */
  registerStaff() {
    // Kiểm tra nếu đã đăng ký rồi
    if (this.registered) {
      return;
    }

    if (!this.stompClient) {
      return;
    }

    if (!this.stompClient.connected || !this.stompClient.active) {
      return;
    }

    if (!this.staffId) {
      console.warn("[StaffOrderWS] Không thể đăng ký staff: thiếu staffId");
      return;
    }

    try {
      this.stompClient.publish({
        destination: "/app/staff/register",
        body: this.staffId.toString(),
        headers: {
          "Content-Type": "text/plain",
        },
      });
      this.registered = true; // Đánh dấu đã đăng ký
    } catch (error) {
      console.error("[StaffOrderWS] Lỗi khi đăng ký staff:", error);
    }
  }

  /**
   * Subscribe vào các topic để nhận thông báo
   */
  subscribeToOrderUpdates() {
    // Kiểm tra nếu đã subscribe rồi
    if (this.subscribed) {
      return;
    }

    if (!this.stompClient || !this.stompClient.connected) {
      return;
    }

    // Đánh dấu đã subscribe
    this.subscribed = true;

    // Subscribe nhận đơn hàng mới
    this.subscribe("/topic/new-orders", "newOrder", (message) => {
      try {
        if (!message.body || typeof message.body !== "string") {
          return;
        }
        const orderData = JSON.parse(message.body.trim());
        this.notifyHandlers("newOrder", orderData);
      } catch (error) {
        console.error("[StaffOrderWS] Message body:", message.body);
      }
    });
  }

  /**
   * Helper method để subscribe vào topic
   */
  subscribe(destination, key, callback) {
    if (this.subscriptions.has(key)) {
      return;
    }

    const subscription = this.stompClient.subscribe(destination, callback);
    this.subscriptions.set(key, subscription);
  }

  /**
   * Đăng ký handler cho các loại message
   */
  addMessageHandler(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }

    const existingHandlers = this.messageHandlers.get(messageType);

    // Nếu đã có handler, xóa handler cũ trước khi thêm mới
    // Điều này giúp tránh duplicate handlers khi component re-render
    if (existingHandlers.size > 0) {
      existingHandlers.clear();
    }
    existingHandlers.add(handler);

    // Xử lý các messages đã queue cho messageType này
    setTimeout(() => {
      this.processQueuedMessages(messageType);
    }, 100);

    // Trả về hàm để unsubscribe
    return () => {
      const handlers = this.messageHandlers.get(messageType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(messageType);
        }
      }
    };
  }

  /**
   * Thông báo đến các handlers
   * Nếu không có handler, message sẽ được queue lại để xử lý sau
   */
  notifyHandlers(messageType, data) {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers && handlers.size > 0) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[StaffOrderWS] Lỗi trong handler ${messageType}:`, error);
        }
      });
    } else {
      // Queue message để xử lý sau khi có handler đăng ký
      this.queueMessage(messageType, data);
    }
  }

  /**
   * Queue message để xử lý sau khi có handler
   */
  queueMessage(messageType, data) {
    if (!this.messageQueue.has(messageType)) {
      this.messageQueue.set(messageType, []);
    }

    const queue = this.messageQueue.get(messageType);

    // Thêm timestamp để có thể xóa message cũ
    const queuedMessage = {
      data,
      timestamp: Date.now(),
    };

    queue.push(queuedMessage);

    // Giới hạn kích thước queue
    if (queue.length > this.maxQueueSize) {
      queue.shift(); // Xóa message cũ nhất
    }
  }

  /**
   * Xử lý các messages đã queue cho một messageType
   */
  processQueuedMessages(messageType) {
    const queue = this.messageQueue.get(messageType);
    if (!queue || queue.length === 0) {
      return;
    }

    const now = Date.now();
    const handlers = this.messageHandlers.get(messageType);

    if (!handlers || handlers.size === 0) {
      return;
    }

    // Xử lý tất cả messages trong queue còn hợp lệ (chưa hết hạn)
    const validMessages = queue.filter((msg) => now - msg.timestamp < this.queueRetentionTime);

    validMessages.forEach((queuedMessage) => {
      handlers.forEach((handler) => {
        try {
          handler(queuedMessage.data);
        } catch (error) {
          console.error(`Lỗi khi xử lý queued message ${messageType}:`, error);
        }
      });
    });

    // Xóa queue sau khi xử lý
    this.messageQueue.delete(messageType);
  }

  /**
   * Yêu cầu chi tiết đơn hàng
   */
  requestOrderDetails(orderId) {
    if (!this.connected) {
      console.warn(" Chưa kết nối WebSocket");
      return false;
    }

    try {
      this.stompClient.publish({
        destination: "/app/staff/get-order-details",
        body: orderId.toString(),
        headers: {
          "Content-Type": "text/plain",
        },
      });
      return true;
    } catch (error) {
      console.error("Lỗi khi yêu cầu chi tiết đơn hàng:", error);
      return false;
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  updateOrderStatus(orderId, orderCode, newStatus, previousStatus = null) {
    if (!this.connected) {
      console.warn("Chưa kết nối WebSocket");
      return false;
    }

    const updateData = {
      orderId,
      orderCode,
      orderStatus: newStatus,
      previousStatus,
      messageType: "ORDER_STATUS_CHANGED",
      timestamp: Date.now(),
    };

    try {
      this.stompClient.publish({
        destination: "/app/staff/update-order-status",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return true;
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      return false;
    }
  }

  /**
   * Lên lịch reconnect
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Đã hết số lần thử reconnect");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    setTimeout(() => {
      if (!this.connected && this.staffId && this.token) {
        this.connect(this.staffId, this.token).catch((error) => {
          console.error("Reconnect thất bại:", error);
        });
      }
    }, delay);
  }

  /**
   * Xóa tất cả subscriptions
   */
  clearSubscriptions() {
    this.subscriptions.forEach((subscription) => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.error("Lỗi khi unsubscribe:", error);
      }
    });
    this.subscriptions.clear();
  }

  /**
   * Ngắt kết nối WebSocket
   */
  disconnect() {
    if (this.stompClient) {
      this.clearSubscriptions();
      this.stompClient.deactivate();
      this.connected = false;
      this.connecting = false; // Reset flag connecting
      this.registered = false; // Reset flag registered
      this.subscribed = false; // Reset flag subscribed
      this.staffId = null;
      this.token = null;
      this.reconnectAttempts = 0;
      this.messageHandlers.clear();
      this.messageQueue.clear(); // Clear message queue
    }
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Lấy thông tin trạng thái
   */
  getStatus() {
    return {
      connected: this.connected,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: Array.from(this.subscriptions.keys()),
      handlers: Array.from(this.messageHandlers.keys()),
      staffId: this.staffId,
    };
  }
}

// Tạo singleton instance
const staffOrderWebSocketService = new StaffOrderWebSocketService();

export default staffOrderWebSocketService;
