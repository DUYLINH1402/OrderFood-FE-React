import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

class StaffChatWebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    this.staffId = null;
    this.token = null;
  }

  async connect(staffId, token) {
    if (this.connected) {
      return Promise.resolve();
    }

    this.staffId = staffId;
    this.token = token;

    const wsUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"}/ws`;

    return new Promise((resolve, reject) => {
      try {
        this.stompClient = new Client({
          webSocketFactory: () => {
            const sockJS = new SockJS(wsUrl);
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

        this.stompClient.onConnect = (frame) => {
          this.connected = true;
          this.reconnectAttempts = 0;
          this.registerStaff();
          this.subscribeToStaffChat();
          this.notifyHandlers("connectionStatus", { connected: true });
          resolve();
        };

        this.stompClient.onStompError = (frame) => {
          this.connected = false;
          const errorMsg = frame.headers?.message || "Unknown STOMP error";
          this.notifyHandlers("connectionStatus", { connected: false, error: errorMsg });
          reject(new Error(`STOMP Error: ${errorMsg}`));
        };

        this.stompClient.onWebSocketError = (error) => {
          this.connected = false;
          reject(error);
        };

        this.stompClient.onWebSocketClose = (event) => {
          this.connected = false;
          this.notifyHandlers("connectionStatus", { connected: false });
        };

        this.stompClient.onDisconnect = () => {
          this.connected = false;
          this.clearSubscriptions();
          this.notifyHandlers("connectionStatus", { connected: false });
        };

        this.stompClient.activate();

        setTimeout(() => {
          if (!this.connected) {
            console.error("TIMEOUT: Staff Chat WebSocket không kết nối được sau 15 giây");
            reject(new Error("Connection timeout after 15 seconds"));
          }
        }, 15000);
      } catch (error) {
        console.error("Lỗi khi khởi tạo Staff Chat WebSocket:", error);
        this.connected = false;
        reject(error);
      }
    });
  }

  registerStaff() {
    if (!this.connected || !this.token) {
      console.warn("Không thể đăng ký staff: chưa kết nối hoặc thiếu token");
      return;
    }

    try {
      this.stompClient.publish({
        destination: "/app/chat/staff/register",
        body: this.token,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    } catch (error) {
      console.error("Lỗi khi đăng ký staff cho chat:", error);
    }
  }

  subscribeToStaffChat() {
    if (!this.connected) {
      console.warn("Chưa kết nối WebSocket");
      return;
    }

    this.subscribe("/topic/staff-chat", "staffChat", (message) => {
      try {
        if (!message.body || typeof message.body !== "string") {
          console.warn("Tin nhắn staff chat không hợp lệ:", message);
          return;
        }
        const chatData = JSON.parse(message.body.trim());
        this.handleStaffChatMessage(chatData);
      } catch (error) {
        console.error("Lỗi khi xử lý tin nhắn staff chat:", error);
      }
    });

    this.subscribe("/user/queue/chat-messages", "userChatMessages", (message) => {
      try {
        if (!message.body || typeof message.body !== "string") {
          console.warn("Tin nhắn user không hợp lệ:", message);
          return;
        }
        const messageData = JSON.parse(message.body.trim());
        this.notifyHandlers("customerMessage", messageData);
      } catch (error) {
        console.error("Lỗi khi xử lý tin nhắn từ user:", error);
      }
    });
  }

  handleStaffChatMessage(data) {
    const messageType = data.type;
    switch (messageType) {
      case "STAFF_WELCOME":
        this.notifyHandlers("staffWelcome", data);
        break;
      case "STAFF_REPLY":
        this.notifyHandlers("staffReply", data);
        break;
      case "REPLY_SENT":
        this.notifyHandlers("replySent", data);
        break;
      case "USER_CHAT":
        this.notifyHandlers("userChatMessage", data);
        break;
      case "USER_CHAT_REALTIME":
        this.notifyHandlers("userChatMessage", data);
        break;
      case "ERROR":
        this.notifyHandlers("chatError", data);
        break;
      case "ONLINE_STAFF_LIST":
        this.notifyHandlers("onlineStaffList", data);
        break;
      case "STAFF_OFFLINE":
        this.notifyHandlers("staffOffline", data);
        break;
      default:
        this.notifyHandlers("unknownMessage", data);
        break;
    }
  }

  /**
   * Gửi tin nhắn từ Staff đến User (Endpoint /chat/staff-reply)
   * Hỗ trợ cả 2 trường hợp:
   * 1. Gửi tin nhắn bình thường (không có replyToMessageId)
   * 2. Phản hồi tin nhắn cụ thể (có replyToMessageId)
   *
   * @param {Object} options - Các tùy chọn gửi tin nhắn
   * @param {string} options.userId - ID của user nhận tin nhắn (bắt buộc)
   * @param {string} options.message - Nội dung tin nhắn (bắt buộc)
   * @param {string} [options.replyToMessageId] - ID tin nhắn đang reply (tùy chọn)
   * @param {Object} [options.replyContext] - Context của tin nhắn được reply (tùy chọn)
   * @returns {boolean} True nếu gửi thành công
   */
  sendMessageToUser({ userId, message, replyToMessageId = null, replyContext = null }) {
    // Validate điều kiện cơ bản
    if (!this.connected) {
      console.warn("sendMessageToUser: Chưa kết nối WebSocket");
      return false;
    }

    if (!userId) {
      console.warn("sendMessageToUser: Thiếu userId (recipientUserId)");
      return false;
    }

    if (!message || !message.trim()) {
      console.warn("sendMessageToUser: Thiếu nội dung tin nhắn");
      return false;
    }

    if (!this.token) {
      console.warn("sendMessageToUser: Thiếu token xác thực");
      return false;
    }

    try {
      // Xây dựng payload theo format của BE
      const messageData = {
        message: message.trim(),
        timestamp: new Date().toISOString(),
        staffId: this.staffId,
        recipientUserId: userId, // BE dùng recipientUserId
        userId: userId, // Giữ cả userId để tương thích
      };

      // Thêm replyToMessageId nếu đang reply tin nhắn cụ thể
      if (replyToMessageId) {
        messageData.replyToMessageId = replyToMessageId;
      }

      // Thêm thông tin context của tin nhắn được reply để hiển thị
      if (replyContext) {
        messageData.replyContext = {
          originalText: replyContext.text || replyContext.content || replyContext.message || "",
          originalSender: replyContext.senderName || replyContext.customerName || "Khách hàng",
          originalTimestamp: replyContext.timestamp,
        };
      }

      this.stompClient.publish({
        destination: "/app/chat/staff-reply",
        body: JSON.stringify(messageData),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
      });

      // // Log chi tiết
      // if (replyToMessageId) {
      //   console.log(`Đã gửi phản hồi tin nhắn ${replyToMessageId} đến user ${userId}:`, message);
      // } else {
      //   console.log(`Đã gửi tin nhắn đến user ${userId}:`, message);
      // }

      return true;
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn đến user:", error);
      return false;
    }
  }

  /**
   * @deprecated Sử dụng sendMessageToUser() thay thế
   * Giữ lại để tương thích ngược
   */
  sendMessageToCustomer(userId, message) {
    console.warn("sendMessageToCustomer() đã deprecated, hãy dùng sendMessageToUser()");
    return this.sendMessageToUser({ userId, message });
  }

  /**
   * @deprecated Sử dụng sendMessageToUser() thay thế
   * Giữ lại để tương thích ngược
   */
  sendReplyToMessage(replyToMessageId, message, userId = null, replyContext = null) {
    console.warn("sendReplyToMessage() đã deprecated, hãy dùng sendMessageToUser()");
    return this.sendMessageToUser({
      userId,
      message,
      replyToMessageId,
      replyContext,
    });
  }

  getOnlineStaff() {
    if (!this.connected || !this.token) {
      return false;
    }

    try {
      this.stompClient.publish({
        destination: "/app/staff/get-online-staff",
        body: "",
        headers: {
          "Content-Type": "text/plain",
          Authorization: `Bearer ${this.token}`,
        },
      });
      return true;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách staff online:", error);
      return false;
    }
  }

  subscribe(destination, key, callback) {
    if (this.subscriptions.has(key)) {
      console.warn(`Đã subscribe vào ${destination} rồi`);
      return;
    }

    try {
      const subscription = this.stompClient.subscribe(destination, callback);
      this.subscriptions.set(key, subscription);
    } catch (error) {
      console.error(`Lỗi khi subscribe vào ${destination}:`, error);
    }
  }

  addMessageHandler(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }
    this.messageHandlers.get(messageType).add(handler);

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

  clearSubscriptions() {
    this.subscriptions.forEach((subscription, key) => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.error(`Lỗi khi unsubscribe khỏi ${key}:`, error);
      }
    });
    this.subscriptions.clear();
  }

  disconnect() {
    if (this.stompClient) {
      this.clearSubscriptions();
      this.stompClient.deactivate();
      this.connected = false;
      this.staffId = null;
      this.token = null;
      this.reconnectAttempts = 0;
      this.messageHandlers.clear();
    }
  }

  isConnected() {
    return this.connected;
  }

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

const staffChatWebSocketService = new StaffChatWebSocketService();

export default staffChatWebSocketService;
