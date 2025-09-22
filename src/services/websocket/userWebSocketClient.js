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
    this.debug = true; // Bật debug mode để giám sát WebSocket
  }

  /**
   * Kết nối đến WebSocket server
   * @param {string} userId - ID của user
   * @param {string} token - JWT token để xác thực
   */
  async connect(userId, token) {
    if (this.connected && this.userId === userId) {
      return Promise.resolve();
    }

    // Ngắt kết nối cũ nếu đang kết nối với user khác
    if (this.connected && this.userId !== userId) {
      this.disconnect();
    }

    this.userId = userId;
    this.token = token;

    const wsUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"}/ws`;

    return new Promise((resolve, reject) => {
      try {
        this.stompClient = new Client({
          webSocketFactory: () => {
            const sockJS = new SockJS(wsUrl);
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
          setTimeout(() => {
            this.subscribeToUserTopics();
          }, 500);

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
      return;
    }

    // Subscribe vào queue riêng của user
    // Backend gửi tới: /user/{userId}/queue/order-updates
    const orderUpdatesDestination = `/user/${this.userId}/queue/order-updates`;

    this.subscribe(orderUpdatesDestination, "orderUpdate", (message) => {
      try {
        console.log("Nhận được thông báo order update:", {
          destination: orderUpdatesDestination,
          body: message.body,
          headers: message.headers,
        });

        if (!message.body) {
          console.warn("Empty order update message body");
          return;
        }

        // Xử lý dữ liệu
        let data;

        // Kiểm tra xem body có phải là JSON không
        if (message.body.trim().startsWith("{")) {
          // Đây là JSON
          data = JSON.parse(message.body);
        } else {
          // Đây có thể là định dạng key=value
          data = this.parseKeyValueFormat(message.body);
        }

        this.notifyHandlers("orderUpdate", data);
      } catch (error) {
        console.error(" Lỗi parse order update:", error);
        // Fallback: gửi raw message nếu không parse được JSON
        this.notifyHandlers("orderUpdate", { message: message.body, type: "raw" });
      }
    });
    console.log(" Đã subscribe vào tất cả topics cho user:", this.userId);
  }

  /**
   * Parse dữ liệu định dạng key=value từ BE
   * Ví dụ: messageType=ORDER_STATUS_CHANGED, orderId=150, orderCode=DGX882337122...
   */
  parseKeyValueFormat(messageBody) {
    try {
      if (!messageBody || typeof messageBody !== "string") {
        return { error: "Invalid message body" };
      }

      // Tách các cặp key=value bởi dấu phẩy
      // Xử lý trường hợp có dấu phẩy trong giá trị chuỗi bằng cách tìm mẫu key=value
      const keyValueRegex = /([^,=]+)=([^,]*?)(?:,|$)/g;
      const result = {};

      let match;
      while ((match = keyValueRegex.exec(messageBody)) !== null) {
        const key = match[1].trim();
        const value = match[2].trim();

        // Chuyển đổi giá trị số nếu có thể
        if (value === "null" || value === "") {
          // Giá trị null hoặc rỗng
          result[key] = null;
        } else if (!isNaN(value) && value !== "") {
          // Số nguyên hoặc số thực
          result[key] = Number(value);
        } else if (value.toLowerCase() === "true") {
          // Boolean true
          result[key] = true;
        } else if (value.toLowerCase() === "false") {
          // Boolean false
          result[key] = false;
        } else {
          // Giá trị chuỗi
          result[key] = value;
        }
      }

      // Backup method if regex doesn't work well
      if (Object.keys(result).length === 0) {
        const pairs = messageBody.split(",");

        pairs.forEach((pair) => {
          const trimmedPair = pair.trim();
          const equalPos = trimmedPair.indexOf("=");

          if (equalPos !== -1) {
            const key = trimmedPair.substring(0, equalPos).trim();
            const value = trimmedPair.substring(equalPos + 1).trim();

            if (value === "null") {
              result[key] = null;
            } else if (!isNaN(value) && value !== "") {
              result[key] = Number(value);
            } else {
              result[key] = value;
            }
          }
        });
      }

      return result;
    } catch (error) {
      console.error("Message body:", messageBody);
      return { error: "Parse error", rawMessage: messageBody };
    }
  }

  /**
   * Helper method để subscribe vào topic
   */
  subscribe(destination, key, callback) {
    if (this.subscriptions.has(key)) {
      return this.subscriptions.get(key);
    }

    if (!this.connected || !this.stompClient) {
      console.error(`Không thể subscribe vào ${destination} vì chưa kết nối`);
      return null;
    }

    try {
      const subscription = this.stompClient.subscribe(destination, (message) => {
        console.log(`Nhận message từ ${destination}:`, {
          body: message.body,
          headers: message.headers,
          timestamp: new Date().toISOString(),
        });

        // Gọi callback được truyền vào
        if (typeof callback === "function") {
          callback(message);
        } else {
          console.warn(`Callback không phải function cho ${destination}`);
        }
      });
      this.subscriptions.set(key, subscription);
      console.warn(`THÀNH CÔNG subscribe vào: ${destination}`);
      return subscription;
    } catch (error) {
      console.error(`Lỗi khi subscribe vào ${destination}:`, error);
      return null;
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
    // Kiểm tra xem đã có handler này chưa để tránh duplicate
    if (this.messageHandlers.has(messageType)) {
      const existingHandlers = this.messageHandlers.get(messageType);
      if (existingHandlers.has(handler)) {
        console.log(`Handler cho ${messageType} đã tồn tại, bỏ qua...`);
        return () => {}; // Return empty cleanup function
      }
    }

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
    } else {
      console.log(`Không có handler nào cho: ${messageType}`);
    }
  }

  /**
   * Gửi tin nhắn chat tới staff
   */
  chatToStaff(message) {
    if (!this.connected) {
      console.warn("Chưa kết nối WebSocket");
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
      if (!this.connected && this.userId && this.token) {
        console.log(`Đang thử reconnect lần ${this.reconnectAttempts}`);
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
        console.log(`Đã unsubscribe: ${key}`);
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
      this.clearSubscriptions();
      this.stompClient.deactivate();
      this.connected = false;
      this.userId = null;
      this.token = null;
      this.reconnectAttempts = 0;
      this.messageHandlers.clear();
      console.log("Đã ngắt kết nối User WebSocket");
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
