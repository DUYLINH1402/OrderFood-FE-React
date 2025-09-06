// userWebSocketClient.js - Cấu hình tương tự StaffOrderWebSocketService
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

class UserWebSocketClient {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    this.userId = null;
    this.token = null;
  }

  /**
   * Kết nối đến WebSocket server
   * @param {string} userId - ID của user
   * @param {string} token - JWT token để xác thực
   */
  async connect(userId, token) {
    if (this.connected) {
      console.log("🔗 User WebSocket đã được kết nối rồi");
      return Promise.resolve();
    }

    this.userId = userId;
    this.token = token;

    const wsUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"}/ws`;

    return new Promise((resolve, reject) => {
      try {
        this.stompClient = new Client({
          webSocketFactory: () => {
            const sockJS = new SockJS(wsUrl);

            sockJS.onopen = () => console.log("🔌 SockJS connected");
            sockJS.onclose = () => console.log("🔌 SockJS disconnected");
            sockJS.onerror = (e) => console.error("SockJS error:", e);

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
          connectionTimeout: 10000,
        });

        // Xử lý khi kết nối thành công
        this.stompClient.onConnect = (frame) => {
          this.connected = true;
          this.reconnectAttempts = 0;

          // Đăng ký user ngay sau khi kết nối
          this.registerUser();

          // Subscribe vào các topics
          this.subscribeToUserTopics();

          resolve();
        };

        // Xử lý lỗi STOMP
        this.stompClient.onStompError = (frame) => {
          console.error("STOMP Error:", frame);
          this.connected = false;
          const errorMsg = frame.headers?.message || "Unknown STOMP error";
          reject(new Error(`STOMP Error: ${errorMsg}`));
        };

        // Xử lý lỗi WebSocket
        this.stompClient.onWebSocketError = (error) => {
          console.error("WebSocket Error:", error);
          this.connected = false;
          reject(error);
        };

        // Xử lý khi WebSocket đóng
        this.stompClient.onWebSocketClose = (event) => {
          this.connected = false;
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
            console.error(" Timeout khi kết nối User WebSocket");
            reject(new Error("Connection timeout after 15 seconds"));
          }
        }, 15000);
      } catch (error) {
        console.error("Lỗi khi khởi tạo User WebSocket:", error);
        this.connected = false;
        reject(error);
      }
    });
  }

  /**
   * Đăng ký user với server để nhận thông báo
   */
  registerUser() {
    if (!this.connected || !this.userId) {
      console.warn("Không thể đăng ký user: chưa kết nối hoặc thiếu userId");
      return;
    }

    try {
      this.stompClient.publish({
        destination: "/app/user/register",
        body: this.userId.toString(),
        headers: {
          "Content-Type": "text/plain",
        },
      });
    } catch (error) {
      console.error("Lỗi khi đăng ký user:", error);
    }
  }

  /**
   * Subscribe vào các topic để nhận thông báo
   */
  subscribeToUserTopics() {
    if (!this.connected || !this.userId) {
      console.warn("Không thể subscribe: chưa kết nối hoặc thiếu userId");
      return;
    }

    // Chỉ subscribe nhận thông báo cập nhật trạng thái đơn hàng dành riêng cho user này
    this.subscribe(`/user/${this.userId}/queue/order-updates`, "orderUpdate", (message) => {
      try {
        console.log("Raw order update message:", message.body);
        if (!message.body) {
          console.warn("Empty order update message body");
          return;
        }

        const data = JSON.parse(message.body);
        console.log(" Order update data:", data);
        this.notifyHandlers("orderUpdate", data);
      } catch (error) {
        console.error("Lỗi parse order update:", error);
        // Fallback: gửi raw message nếu không parse được JSON
        this.notifyHandlers("orderUpdate", { message: message.body, type: "raw" });
      }
    });

    console.log("✅ Đã subscribe vào topic order update cho user:", this.userId);
  }

  /**
   * Helper method để subscribe vào topic
   */
  subscribe(destination, key, callback) {
    if (this.subscriptions.has(key)) {
      console.log(`ℹ️ Đã subscribe vào ${key} rồi`);
      return;
    }

    try {
      const subscription = this.stompClient.subscribe(destination, callback);
      this.subscriptions.set(key, subscription);
      console.log(`📡 Đã subscribe vào: ${destination} với key: ${key}`);
    } catch (error) {
      console.error(`Lỗi khi subscribe vào ${destination}:`, error);
    }
  }

  /**
   * Đăng ký handler cho các loại message (alias cho addMessageHandler)
   */
  on(eventType, handler) {
    return this.addMessageHandler(eventType, handler);
  }

  /**
   * Đăng ký handler cho các loại message
   */
  addMessageHandler(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }
    this.messageHandlers.get(messageType).add(handler);
    console.log(`📝 Đã đăng ký handler cho: ${messageType}`);

    // Trả về hàm để unsubscribe
    return () => {
      const handlers = this.messageHandlers.get(messageType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(messageType);
        }
        console.log(`🗑️ Đã hủy handler cho: ${messageType}`);
      }
    };
  }

  /**
   * Thông báo đến các handlers
   */
  notifyHandlers(messageType, data) {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      console.log(`📢 Thông báo tới ${handlers.size} handlers cho: ${messageType}`);
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Lỗi trong handler ${messageType}:`, error);
        }
      });
    } else {
      console.log(`⚠️ Không có handler nào cho: ${messageType}`);
    }
  }

  /**
   * Gửi tin nhắn chat tới staff
   */
  chatToStaff(message) {
    if (!this.connected) {
      console.warn("⚠️ Chưa kết nối WebSocket");
      return false;
    }

    try {
      this.stompClient.publish({
        destination: "/app/user/chat-to-staff",
        body: message,
        headers: {
          "Content-Type": "text/plain",
        },
      });
      return true;
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn chat:", error);
      return false;
    }
  }

  /**
   * Gửi ping tới BE
   */
  ping() {
    if (!this.connected) {
      console.warn("⚠️ Chưa kết nối WebSocket");
      return false;
    }

    try {
      this.stompClient.publish({
        destination: "/app/user/ping",
        body: JSON.stringify({
          timestamp: Date.now(),
          userId: this.userId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("🏓 Đã gửi ping");
      return true;
    } catch (error) {
      console.error("Lỗi khi gửi ping:", error);
      return false;
    }
  }

  /**
   * Gửi message tùy ý
   */
  publish(destination, body, headers = { "Content-Type": "application/json" }) {
    if (!this.connected) {
      console.warn("⚠️ Chưa kết nối WebSocket");
      return false;
    }

    try {
      this.stompClient.publish({ destination, body, headers });
      console.log(`📤 Đã gửi message tới ${destination}`);
      return true;
    } catch (error) {
      console.error(`Lỗi khi gửi message tới ${destination}:`, error);
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

    console.log(`🔄 Sẽ thử reconnect lần ${this.reconnectAttempts} sau ${delay}ms`);

    setTimeout(() => {
      if (!this.connected && this.userId && this.token) {
        console.log(`🔄 Đang thử reconnect lần ${this.reconnectAttempts}`);
        this.connect(this.userId, this.token).catch((error) => {
          console.error("Reconnect thất bại:", error);
        });
      }
    }, delay);
  }

  /**
   * Xóa tất cả subscriptions
   */
  clearSubscriptions() {
    this.subscriptions.forEach((subscription, key) => {
      try {
        subscription.unsubscribe();
        console.log(`🗑️ Đã unsubscribe: ${key}`);
      } catch (error) {
        console.error(`Lỗi khi unsubscribe ${key}:`, error);
      }
    });
    this.subscriptions.clear();
  }

  /**
   * Ngắt kết nối WebSocket
   */
  disconnect() {
    if (this.stompClient) {
      console.log("🔌 Đang ngắt kết nối User WebSocket...");
      this.clearSubscriptions();
      this.stompClient.deactivate();
      this.connected = false;
      this.userId = null;
      this.token = null;
      this.reconnectAttempts = 0;
      this.messageHandlers.clear();
      console.log("✅ Đã ngắt kết nối User WebSocket");
    }
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Lấy thông tin trạng thái kết nối
   */
  getConnectionStatus() {
    return {
      isConnected: this.connected,
      isConnecting: this.stompClient?.connected === false && this.stompClient?.active === true,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: Array.from(this.subscriptions.keys()),
      handlers: Array.from(this.messageHandlers.keys()),
      userId: this.userId,
      lastError: null,
    };
  }

  /**
   * Lấy thông tin status chi tiết
   */
  getStatus() {
    return {
      connected: this.connected,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: Array.from(this.subscriptions.keys()),
      handlers: Array.from(this.messageHandlers.keys()),
      userId: this.userId,
    };
  }
}

// Tạo singleton instance
const userWebSocketClient = new UserWebSocketClient();

export default userWebSocketClient;
