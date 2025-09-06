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
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.subscriptions = new Map(); // Lưu trữ các subscription đang hoạt động
    this.messageHandlers = new Map(); // Lưu trữ các handler cho từng loại message
    this.staffId = null;
    this.token = null;
  }

  /**
   * Kết nối đến WebSocket server
   * @param {string} staffId - ID của nhân viên
   * @param {string} token - JWT token để xác thực
   */
  async connect(staffId, token) {
    if (this.connected) {
      // console.log("🔗 WebSocket đã được kết nối rồi");
      return Promise.resolve();
    }

    this.staffId = staffId;
    this.token = token;

    // Sử dụng HTTP URL thay vì WebSocket URL vì SockJS sẽ handle protocol
    const wsUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"}/ws`;

    return new Promise((resolve, reject) => {
      try {
        // Tạo STOMP client với SockJS fallback
        this.stompClient = new Client({
          webSocketFactory: () => {
            const sockJS = new SockJS(wsUrl);

            sockJS.onopen = () =>
              (sockJS.onclose = () => (sockJS.onerror = (e) => console.error("SockJS error:", e)));

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
          // Thêm timeout để tránh kết nối treo
          connectionTimeout: 10000,
        });

        // Xử lý khi kết nối thành công
        this.stompClient.onConnect = (frame) => {
          this.connected = true;
          this.reconnectAttempts = 0;

          // Đăng ký staff ngay sau khi kết nối
          this.registerStaff();

          resolve();
        };

        // Xử lý lỗi STOMP
        this.stompClient.onStompError = (frame) => {
          this.connected = false;

          const errorMsg = frame.headers?.message || "Unknown STOMP error";
          reject(new Error(`STOMP Error: ${errorMsg}`));
        };

        // Xử lý lỗi WebSocket
        this.stompClient.onWebSocketError = (error) => {
          this.connected = false;
          reject(error);
        };

        // Xử lý khi WebSocket đóng
        this.stompClient.onWebSocketClose = (event) => {
          this.connected = false;
          // Tự động reconnect nếu không phải do người dùng đóng
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        // Xử lý khi ngắt kết nối
        this.stompClient.onDisconnect = () => {
          this.connected = false;
          this.clearSubscriptions();
        };
        // Kích hoạt kết nối
        this.stompClient.activate();

        // Đặt timeout cho kết nối
        setTimeout(() => {
          if (!this.connected) {
            console.error("⏰ Timeout khi kết nối WebSocket");
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
    if (!this.connected || !this.staffId) {
      console.warn(" Không thể đăng ký staff: chưa kết nối hoặc thiếu staffId");
      return;
    }

    try {
      this.stompClient.publish({
        destination: "/app/staff/register",
        body: this.staffId,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    } catch (error) {
      console.error("Lỗi khi đăng ký staff:", error);
    }
  }

  /**
   * Subscribe vào các topic để nhận thông báo
   */
  subscribeToOrderUpdates() {
    if (!this.connected) {
      console.warn(" Chưa kết nối WebSocket");
      return;
    }

    // Subscribe nhận đơn hàng mới
    this.subscribe("/topic/new-orders", "newOrder", (message) => {
      try {
        if (!message.body || typeof message.body !== "string") {
          return;
        }
        const orderData = JSON.parse(message.body.trim());
        this.notifyHandlers("newOrder", orderData);
      } catch (error) {
        console.error(" Message body:", message.body);
      }
    });

    // Subscribe nhận cập nhật trạng thái đơn hàng
    this.subscribe("/topic/order-updates", "orderStatusUpdate", (message) => {
      try {
        if (!message.body || typeof message.body !== "string") {
          console.warn("Invalid message body for order update:", message.body);
          return;
        }
        const updateData = JSON.parse(message.body.trim());
        this.notifyHandlers("orderStatusUpdate", updateData);
      } catch (error) {
        console.error("Lỗi parse cập nhật trạng thái:", error);
        console.error("Message body:", message.body);
      }
    });

    // Subscribe nhận thống kê real-time
    this.subscribe("/topic/stats", "statsUpdate", (message) => {
      try {
        if (!message.body || typeof message.body !== "string") {
          console.warn("⚠️ Invalid message body for stats:", message.body);
          return;
        }
        const statsData = JSON.parse(message.body.trim());
        // console.log("📊 Cập nhật thống kê:", statsData);
        this.notifyHandlers("statsUpdate", statsData);
      } catch (error) {
        console.error("Lỗi parse thống kê:", error);
        console.error("Message body:", message.body);
      }
    });

    // Subscribe nhận response chi tiết đơn hàng
    this.subscribe("/topic/order-details", "orderDetails", (message) => {
      try {
        console.log("📦 Raw message body:", message.body);

        if (!message.body) {
          console.warn("⚠️ Message body is empty");
          return;
        }

        if (typeof message.body !== "string") {
          console.warn("⚠️ Message body is not a string:", message.body);
          return;
        }

        const cleanBody = message.body.trim();

        // Kiểm tra xem có phải JSON không bằng cách xem ký tự đầu
        if (cleanBody.startsWith("{") || cleanBody.startsWith("[")) {
          // Là JSON object/array
          try {
            const detailsData = JSON.parse(cleanBody);
            console.log("📋 Chi tiết đơn hàng (JSON):", detailsData);
            this.notifyHandlers("orderDetails", detailsData);
          } catch (parseError) {
            console.error("Lỗi parse JSON:", parseError);
            console.error("JSON body:", cleanBody);
          }
        } else {
          // Là plain text message - có thể là thông báo hoặc response message
          console.log("� Text message từ server:", cleanBody);

          // Có thể server đang gửi thông báo thay vì data
          // Tạm thời bỏ qua hoặc handle như một notification
          this.notifyHandlers("orderDetailsMessage", {
            message: cleanBody,
            type: "text",
          });
        }
      } catch (error) {
        console.error("Lỗi tổng quát trong orderDetails handler:", error);
        console.error("Raw message:", message);
      }
    });

    // Subscribe pong response
    this.subscribe("/topic/pong", "pong", (message) => {
      // console.log("🏓 Pong nhận được:", message.body);
      this.notifyHandlers("pong", message.body);
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
    this.messageHandlers.get(messageType).add(handler);

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
   */
  notifyHandlers(messageType, data) {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Lỗi trong handler ${messageType}:`, error);
        }
      });
    }
  }

  /**
   * Xác nhận đã nhận được đơn hàng
   */
  acknowledgeOrder(orderId) {
    if (!this.connected) {
      console.warn("⚠️ Chưa kết nối WebSocket");
      return false;
    }

    try {
      this.stompClient.publish({
        destination: "/app/staff/acknowledge-order",
        body: orderId.toString(),
        headers: {
          "Content-Type": "text/plain",
        },
      });
      // console.log("✅ Đã xác nhận đơn hàng:", orderId);
      return true;
    } catch (error) {
      console.error("Lỗi khi xác nhận đơn hàng:", error);
      return false;
    }
  }

  /**
   * Yêu cầu chi tiết đơn hàng
   */
  requestOrderDetails(orderId) {
    if (!this.connected) {
      console.warn("⚠️ Chưa kết nối WebSocket");
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
      // console.log("📋 Đã yêu cầu chi tiết đơn hàng:", orderId);
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
      console.warn("⚠️ Chưa kết nối WebSocket");
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
      console.error("❌ Đã hết số lần thử reconnect");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    setTimeout(() => {
      if (!this.connected && this.staffId && this.token) {
        // console.log(`🔄 Đang thử reconnect lần ${this.reconnectAttempts}`);
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
      // console.log("🔌 Đang ngắt kết nối WebSocket...");
      this.clearSubscriptions();
      this.stompClient.deactivate();
      this.connected = false;
      this.staffId = null;
      this.token = null;
      this.reconnectAttempts = 0;
      this.messageHandlers.clear();
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
