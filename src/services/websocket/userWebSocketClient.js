// userWebSocketClient.js - Cấu hình tương tự StaffOrderWebSocketService
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

class UserWebSocketClient {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.connecting = false; // Cờ để tránh duplicate connection
    this.registered = false; // Cờ để tránh duplicate registration
    this.subscribed = false; // Cờ để tránh duplicate subscription
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    this.userId = null;
    this.token = null;
    this.debug = true; // Bật debug mode để giám sát WebSocket

    // Message queue để buffer messages khi chưa có handler
    this.messageQueue = new Map(); // Map<messageType, Array<data>>
    this.maxQueueSize = 50; // Giới hạn số message trong queue
    this.queueRetentionTime = 30000; // Thời gian giữ message trong queue (30 giây)

    // Queue processor interval
    this.queueProcessorInterval = null;
    this.startQueueProcessor();

    // Event listeners để broadcast messages ra bên ngoài
    this.eventListeners = new Map();
  }

  /**
   * Đăng ký event listener (giống addEventListener)
   * Dùng để component có thể subscribe vào events mà không cần timing chính xác
   */
  addEventListener(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType).add(callback);

    console.log(`[UserWebSocket] Event listener added for: ${eventType}`);

    return () => {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Emit event để broadcast ra tất cả listeners
   */
  emitEvent(eventType, data) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners && listeners.size > 0) {
      console.log(`[UserWebSocket] Emitting event ${eventType} to ${listeners.size} listeners`);
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[UserWebSocket] Error in event listener for ${eventType}:`, error);
        }
      });
    }
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

    console.log(`[UserWebSocket] Queue processor checking ${this.messageQueue.size} queues...`);

    // Lặp qua tất cả messageTypes trong queue
    for (const [messageType, queue] of this.messageQueue.entries()) {
      if (queue.length > 0 && this.messageHandlers.has(messageType)) {
        console.log(
          `[UserWebSocket] Queue processor found handlers for ${messageType}, processing...`
        );
        this.processQueuedMessages(messageType);
      }
    }
  }

  /**
   * Kết nối đến WebSocket server
   * @param {string} userId - ID của user
   * @param {string} token - JWT token để xác thực
   */
  async connect(userId, token) {
    // Kiểm tra nếu đã kết nối với cùng user
    if (this.connected && this.userId === userId) {
      console.log("[UserWebSocket] Already connected with userId:", userId);
      return Promise.resolve();
    }

    // Kiểm tra nếu đang trong quá trình kết nối
    if (this.connecting) {
      console.log("[UserWebSocket] Connection already in progress, skipping...");
      return Promise.resolve();
    }

    // Ngắt kết nối cũ nếu đang kết nối với user khác
    if (this.connected && this.userId !== userId) {
      console.log("[UserWebSocket] Disconnecting from previous user:", this.userId);
      this.disconnect();
    }

    this.connecting = true; // Đánh dấu đang kết nối
    this.userId = userId;
    this.token = token;

    // Sử dụng VITE_API_BASE_URL giống như StaffChatWebSocketService
    // SockJS cần HTTP/HTTPS URL để thực hiện handshake
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").trim();
    const wsUrl = `${baseUrl}/ws`;

    // Log chi tiết để debug production
    console.log("[UserWebSocket] ====== CONNECTION DEBUG ======");
    console.log("[UserWebSocket] Environment:", import.meta.env.MODE);
    console.log("[UserWebSocket] API Base URL:", baseUrl);
    console.log("[UserWebSocket] WebSocket URL:", wsUrl);
    console.log("[UserWebSocket] User ID:", userId);
    console.log("[UserWebSocket] Token exists:", !!token);
    console.log("[UserWebSocket] Token length:", token ? token.length : 0);
    console.log("[UserWebSocket] ===============================");

    return new Promise((resolve, reject) => {
      try {
        this.stompClient = new Client({
          webSocketFactory: () => {
            console.log("[UserWebSocket] Creating SockJS connection to:", wsUrl);
            const sockJS = new SockJS(wsUrl, null, {
              // Thêm options cho SockJS để debug
              transports: ["websocket", "xhr-streaming", "xhr-polling"],
              timeout: 10000,
            });

            // Thêm listeners để debug SockJS
            sockJS.onopen = () => {
              console.log("[UserWebSocket] SockJS connection opened");
            };
            sockJS.onerror = (e) => {
              console.error("[UserWebSocket] SockJS error:", e);
              console.error("[UserWebSocket] SockJS error details:", {
                readyState: sockJS.readyState,
                protocol: sockJS.protocol,
                url: sockJS.url,
              });
            };
            sockJS.onclose = (e) => {
              console.log("[UserWebSocket] SockJS connection closed:", {
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
          connectionTimeout: 15000, // Tăng timeout cho production

          // Thêm debug cho STOMP
          debug: (str) => {
            if (this.debug) {
              console.log("[UserWebSocket] STOMP Debug:", str);
            }
          },
        });

        // Xử lý khi kết nối thành công
        this.stompClient.onConnect = (frame) => {
          console.log("[UserWebSocket] STOMP connected successfully");
          console.log("[UserWebSocket] Connection frame:", frame);
          this.connected = true;
          this.connecting = false; // Reset cờ connecting
          this.reconnectAttempts = 0;

          // Đợi để đảm bảo connection ổn định trước khi đăng ký
          setTimeout(() => {
            // Kiểm tra kỹ hơn - cả stompClient.connected và stompClient.active
            if (this.stompClient && this.stompClient.connected && this.stompClient.active) {
              // Chỉ đăng ký nếu chưa đăng ký
              if (!this.registered) {
                console.log("[UserWebSocket] Registering user after stable connection");
                this.registerUser();
              }

              // Chỉ subscribe nếu chưa subscribe
              if (!this.subscribed) {
                setTimeout(() => {
                  if (this.stompClient && this.stompClient.connected) {
                    console.log("[UserWebSocket] Subscribing to user topics");
                    this.subscribeToUserTopics();
                  } else {
                    console.warn("[UserWebSocket] Connection lost before subscribing to topics");
                  }
                }, 300);
              }
            } else {
              console.warn("[UserWebSocket] Connection lost before registration", {
                stompClient: !!this.stompClient,
                connected: this.stompClient?.connected,
                active: this.stompClient?.active,
              });
            }
          }, 300);

          resolve();
        };

        // Xử lý lỗi STOMP
        this.stompClient.onStompError = (frame) => {
          console.error("[UserWebSocket] STOMP Error:", frame);
          console.error("[UserWebSocket] STOMP Error headers:", frame.headers);
          console.error("[UserWebSocket] STOMP Error body:", frame.body);
          this.connected = false;
          this.connecting = false;
          const errorMsg = frame.headers?.message || "Unknown STOMP error";
          reject(new Error(`STOMP Error: ${errorMsg}`));
        };

        // Xử lý lỗi WebSocket
        this.stompClient.onWebSocketError = (error) => {
          console.error("[UserWebSocket] WebSocket Error:", error);
          console.error("[UserWebSocket] WebSocket Error type:", error?.type);
          console.error("[UserWebSocket] WebSocket Error target:", error?.target);
          this.connected = false;
          this.connecting = false;
          reject(error);
        };

        // Xử lý khi WebSocket đóng
        this.stompClient.onWebSocketClose = (event) => {
          console.log("[UserWebSocket] WebSocket closed:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
          this.connected = false;
          this.connecting = false;
          this.registered = false; // Reset để có thể đăng ký lại khi reconnect
          this.subscribed = false; // Reset để có thể subscribe lại khi reconnect
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            console.log(
              "[UserWebSocket] Scheduling reconnect, attempt:",
              this.reconnectAttempts + 1
            );
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
    // Kiểm tra nếu đã đăng ký rồi
    if (this.registered) {
      console.log("[UserWebSocket] User already registered, skipping...");
      return;
    }

    // Kiểm tra kỹ hơn - cả connected, active và stompClient tồn tại
    if (!this.stompClient) {
      console.warn("[UserWebSocket] Không thể đăng ký user: STOMP client không tồn tại");
      return;
    }

    if (!this.stompClient.connected || !this.stompClient.active) {
      console.warn("[UserWebSocket] Không thể đăng ký user: STOMP client chưa sẵn sàng", {
        connected: this.stompClient.connected,
        active: this.stompClient.active,
      });
      return;
    }

    if (!this.userId) {
      console.warn("[UserWebSocket] Không thể đăng ký user: thiếu userId");
      return;
    }

    try {
      console.log("[UserWebSocket] Đang đăng ký user:", this.userId);
      this.stompClient.publish({
        destination: "/app/user/register",
        body: this.userId.toString(),
        headers: {
          "Content-Type": "text/plain",
        },
      });
      this.registered = true; // Đánh dấu đã đăng ký
      console.log("[UserWebSocket] Đăng ký user thành công");
    } catch (error) {
      console.error("[UserWebSocket] Lỗi khi đăng ký user:", error);
    }
  }

  /**
   * Subscribe vào các topic để nhận thông báo
   */
  subscribeToUserTopics() {
    // Kiểm tra nếu đã subscribe rồi
    if (this.subscribed) {
      console.log("[UserWebSocket] Already subscribed to topics, skipping...");
      return;
    }

    if (!this.stompClient || !this.stompClient.connected) {
      console.warn("[UserWebSocket] Không thể subscribe: STOMP client chưa sẵn sàng");
      return;
    }

    if (!this.userId) {
      console.warn("[UserWebSocket] Không thể subscribe: thiếu userId");
      return;
    }

    // Đánh dấu đã subscribe
    this.subscribed = true;

    // Subscribe vào queue riêng của user cho order updates
    // Backend gửi tới: /user/{userId}/queue/order-updates
    const orderUpdatesDestination = `/user/${this.userId}/queue/order-updates`;
    console.log("[UserWebSocket] Subscribing to:", orderUpdatesDestination);

    this.subscribe(orderUpdatesDestination, "orderUpdate", (message) => {
      console.log("[UserWebSocket] ====== RECEIVED ORDER UPDATE ======");
      console.log("[UserWebSocket] Raw message:", message);
      console.log("[UserWebSocket] Message body:", message.body);

      try {
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
          console.log("[UserWebSocket] Parsed JSON data:", data);
        } else {
          // Đây có thể là định dạng key=value
          data = this.parseKeyValueFormat(message.body);
          console.log("[UserWebSocket] Parsed key=value data:", data);
        }

        this.notifyHandlers("orderUpdate", data);
      } catch (error) {
        console.error("[UserWebSocket] Lỗi parse order update:", error);
        // Fallback: gửi raw message nếu không parse được JSON
        this.notifyHandlers("orderUpdate", { message: message.body, type: "raw" });
      }
    });

    // Subscribe vào chat messages từ staff
    this.subscribeToChatMessages();
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
      console.log(`[UserWebSocket] Already subscribed to ${destination} with key ${key}`);
      return this.subscriptions.get(key);
    }

    if (!this.stompClient || !this.stompClient.connected) {
      console.error(
        `[UserWebSocket] Không thể subscribe vào ${destination}: STOMP client chưa sẵn sàng`
      );
      return null;
    }

    try {
      console.log(`[UserWebSocket] Subscribing to ${destination}...`);
      const subscription = this.stompClient.subscribe(destination, (message) => {
        console.log(`[UserWebSocket] Message received on ${destination}:`, message);
        // Gọi callback được truyền vào
        if (typeof callback === "function") {
          callback(message);
        } else {
          console.warn(`Callback không phải function cho ${destination}`);
        }
      });
      this.subscriptions.set(key, subscription);
      console.log(
        `[UserWebSocket] Successfully subscribed to ${destination} with id: ${subscription.id}`
      );
      return subscription;
    } catch (error) {
      console.error(`[UserWebSocket] Lỗi khi subscribe vào ${destination}:`, error);
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

    console.log(
      `[UserWebSocket] Handler registered for ${messageType}. Total handlers:`,
      Array.from(this.messageHandlers.keys())
    );

    // Xử lý các messages đã queue cho messageType này
    // Delay một chút để đảm bảo handler đã được đăng ký hoàn toàn
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
   * Đồng thời emit event để các component có thể subscribe
   */
  notifyHandlers(messageType, data) {
    console.log(`[UserWebSocket] notifyHandlers called for: ${messageType}`, data);
    console.log(`[UserWebSocket] Current handlers:`, Array.from(this.messageHandlers.keys()));

    // Luôn emit event để broadcast ra tất cả listeners
    this.emitEvent(messageType, data);

    const handlers = this.messageHandlers.get(messageType);
    if (handlers && handlers.size > 0) {
      console.log(`[UserWebSocket] Found ${handlers.size} handlers for ${messageType}`);
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Lỗi trong handler ${messageType}:`, error);
        }
      });
    } else {
      // Queue message để xử lý sau khi có handler đăng ký
      console.log(`[UserWebSocket] No handlers for ${messageType}, queueing message...`);
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

    console.log(`[UserWebSocket] Message queued for ${messageType}. Queue size: ${queue.length}`);
  }

  /**
   * Xử lý các messages đã queue cho một messageType
   */
  processQueuedMessages(messageType) {
    const queue = this.messageQueue.get(messageType);
    if (!queue || queue.length === 0) {
      return;
    }

    console.log(`[UserWebSocket] Processing ${queue.length} queued messages for ${messageType}`);

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
          console.log(
            `[UserWebSocket] Processing queued message for ${messageType}:`,
            queuedMessage.data
          );
          handler(queuedMessage.data);
        } catch (error) {
          console.error(`Lỗi khi xử lý queued message ${messageType}:`, error);
        }
      });
    });

    // Xóa queue sau khi xử lý
    this.messageQueue.delete(messageType);
    console.log(`[UserWebSocket] Cleared queue for ${messageType}`);
  }

  /**
   * Gửi tin nhắn chat tới staff
   * @param {string|object} messageOrOptions - Nội dung tin nhắn hoặc object options chứa message và thông tin reply
   * @returns {boolean} True nếu gửi thành công
   */
  chatToStaff(messageOrOptions) {
    if (!this.connected) {
      return false;
    }

    if (!this.token || !this.userId) {
      console.warn("Thiếu thông tin xác thực để gửi chat");
      return false;
    }

    // Xử lý cả 2 trường hợp: string message hoặc object options
    let message, replyToMessageId, replyContext;

    if (typeof messageOrOptions === "string") {
      message = messageOrOptions;
    } else if (typeof messageOrOptions === "object") {
      message = messageOrOptions.message;
      replyToMessageId = messageOrOptions.replyToMessageId;
      replyContext = messageOrOptions.replyContext;
    }

    if (!message || message.trim().length === 0) {
      console.warn("Tin nhắn không được để trống");
      return false;
    }

    try {
      // Tạo payload gồm tin nhắn, userId và token
      const chatPayload = {
        message: message.trim(),
        userId: this.userId,
        token: this.token,
        timestamp: new Date().toISOString(),
        type: "USER_TO_STAFF",
      };

      // Thêm thông tin reply nếu có
      if (replyToMessageId) {
        chatPayload.replyToMessageId = replyToMessageId;
      }

      if (replyContext) {
        chatPayload.replyContext = {
          originalText: replyContext.text || replyContext.originalText,
          originalSender: replyContext.senderName || replyContext.originalSender || "Nhân viên",
          originalTimestamp: replyContext.timestamp || replyContext.originalTimestamp,
        };
      }

      this.stompClient.publish({
        destination: "/app/chat/user-to-staff",
        body: JSON.stringify(chatPayload),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
      });

      return true;
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn chat:", error);
      return false;
    }
  }

  /**
   * Subscribe vào chat messages từ staff
   */
  subscribeToChatMessages() {
    if (!this.connected || !this.userId) {
      return;
    }

    const chatDestination = `/user/${this.userId}/queue/chat-messages`;

    this.subscribe(chatDestination, "chatMessage", (message) => {
      try {
        if (!message.body) {
          console.warn("Empty chat message body");
          return;
        }

        let data;
        if (message.body.trim().startsWith("{")) {
          data = JSON.parse(message.body);
        } else {
          data = { message: message.body, type: "raw" };
        }

        // Thêm timestamp nếu chưa có
        if (!data.timestamp) {
          data.timestamp = new Date().toISOString();
        }

        this.notifyHandlers("chatMessage", data);
      } catch (error) {
        console.error("Lỗi parse chat message:", error);
        this.notifyHandlers("chatMessage", {
          message: message.body,
          type: "raw",
          error: error.message,
        });
      }
    });
  }
  /**
   * Lên lịch reconnect
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    setTimeout(() => {
      if (!this.connected && this.userId && this.token) {
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
    console.log("[UserWebSocket] Disconnecting...");
    if (this.stompClient) {
      this.clearSubscriptions();
      this.stompClient.deactivate();
      this.connected = false;
      this.connecting = false; // Reset flag connecting
      this.registered = false; // Reset flag registered
      this.subscribed = false; // Reset flag subscribed
      this.userId = null;
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
