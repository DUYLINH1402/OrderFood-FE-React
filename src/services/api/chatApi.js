import { apiClient } from "../apiClient";

/**
 * API service cho chức năng chat của user
 */
export const chatApi = {
  /**
   * Lấy lịch sử chat của user hiện tại
   * @param {number} page - Trang cần tải
   * @param {number} size - Số lượng tin nhắn mỗi trang
   * @returns {Promise} Promise chứa danh sách tin nhắn chat
   */
  getChatHistory: async (page = 0, size = 5) => {
    try {
      const response = await apiClient.get("/api/chat/history", {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử chat:", error);
      throw error;
    }
  },

  /**
   * Lấy tin nhắn chưa đọc của user hiện tại
   * @returns {Promise} Promise chứa danh sách tin nhắn chưa đọc
   */
  getUnreadMessages: async () => {
    try {
      const response = await apiClient.get("/api/chat/unread");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn chưa đọc:", error);
      throw error;
    }
  },

  /**
   * Đánh dấu tin nhắn đã đọc
   * @param {number} messageId - ID của tin nhắn cần đánh dấu đã đọc
   * @returns {Promise} Promise xác nhận đã đánh dấu tin nhắn
   */
  markMessageAsRead: async (messageId) => {
    try {
      const response = await apiClient.put(`/api/chat/mark-read/${messageId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi đánh dấu tin nhắn ${messageId} đã đọc:`, error);
      throw error;
    }
  },

  /**
   * Đánh dấu tất cả tin nhắn đã đọc
   * @returns {Promise} Promise xác nhận đã đánh dấu tất cả tin nhắn
   */
  markAllMessagesAsRead: async () => {
    try {
      // Lấy danh sách tin nhắn chưa đọc trước
      const unreadMessages = await chatApi.getUnreadMessages();

      // Đánh dấu từng tin nhắn đã đọc
      const markReadPromises = unreadMessages.unreadMessages.map((message) =>
        chatApi.markMessageAsRead(message.messageId || message.id)
      );

      await Promise.all(markReadPromises);
      return { success: true, markedCount: unreadMessages.unreadMessages.length };
    } catch (error) {
      console.error("Lỗi khi đánh dấu tất cả tin nhắn đã đọc:", error);
      throw error;
    }
  },

  /**
   * Đánh dấu nhiều tin nhắn đã đọc cùng lúc (batch)
   * @param {number[]} messageIds - Mảng ID của các tin nhắn cần đánh dấu
   * @returns {Promise} Promise xác nhận đã đánh dấu tin nhắn
   */
  markMessagesAsReadBatch: async (messageIds) => {
    try {
      if (!messageIds || messageIds.length === 0) {
        return { success: true, markedCount: 0 };
      }

      // Lọc các ID hợp lệ (không phải temporary ID)
      const validIds = messageIds.filter((id) => id && !id.toString().startsWith("msg_"));

      if (validIds.length === 0) {
        return { success: true, markedCount: 0 };
      }

      // Gọi API song song cho tất cả tin nhắn
      const markReadPromises = validIds.map((messageId) =>
        chatApi.markMessageAsRead(messageId).catch((err) => {
          console.warn(`Không thể đánh dấu tin nhắn ${messageId}:`, err);
          return null; // Không throw để các tin nhắn khác vẫn được đánh dấu
        })
      );

      await Promise.all(markReadPromises);
      return { success: true, markedCount: validIds.length };
    } catch (error) {
      console.error("Lỗi khi đánh dấu batch tin nhắn đã đọc:", error);
      throw error;
    }
  },

  /**
   * Đánh dấu tất cả tin nhắn của một user đã đọc (cho STAFF)
   * Sử dụng batch API để gọi song song, tối ưu performance
   * @param {number} userId - ID của user
   * @returns {Promise} Promise xác nhận đã đánh dấu tin nhắn
   */
  markUserMessagesAsRead: async (userId) => {
    try {
      // Lấy tin nhắn của user và đánh dấu các tin chưa đọc
      const data = await chatApi.getUserMessages(userId, 0, 100);

      if (data.messages && data.messages.length > 0) {
        // Lọc tin nhắn chưa đọc từ user gửi đến staff
        const unreadMessageIds = data.messages
          .filter((msg) => !msg.isRead && msg.messageType === "USER_TO_STAFF")
          .map((msg) => msg.messageId || msg.id);

        if (unreadMessageIds.length > 0) {
          // Sử dụng batch API để đánh dấu song song
          return await chatApi.markMessagesAsReadBatch(unreadMessageIds);
        }
      }

      return { success: true, markedCount: 0 };
    } catch (error) {
      console.error(`Lỗi khi đánh dấu tin nhắn user ${userId} đã đọc:`, error);
      throw error;
    }
  },

  // ========== STAFF APIs ==========

  /**
   * Lấy tất cả tin nhắn từ user gửi cho staff (cho STAFF/ADMIN)
   * @param {number} page - Trang cần tải
   * @param {number} size - Số lượng tin nhắn mỗi trang
   * @returns {Promise} Promise chứa danh sách tin nhắn
   */
  getAllUserToStaffMessages: async (page = 0, size = 20) => {
    try {
      const response = await apiClient.get("/api/chat/staff/all-messages", {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn từ user:", error);
      throw error;
    }
  },

  /**
   * Lấy tin nhắn từ user cụ thể (cho STAFF/ADMIN)
   * @param {number} userId - ID của user
   * @param {number} page - Trang cần tải
   * @param {number} size - Số lượng tin nhắn mỗi trang
   * @returns {Promise} Promise chứa tin nhắn của user
   */
  getUserMessages: async (userId, page = 0, size = 20) => {
    try {
      const response = await apiClient.get(`/api/chat/staff/user/${userId}/messages`, {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn từ user:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách user đã chat với staff (cho STAFF/ADMIN)
   * @returns {Promise} Promise chứa danh sách user
   */
  getUsersChatWithStaff: async () => {
    try {
      const response = await apiClient.get("/api/chat/staff/users");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách user đã chat:", error);
      throw error;
    }
  },

  /**
   * Lấy số tin nhắn chưa đọc từ tất cả user (cho STAFF/ADMIN)
   * @returns {Promise<number>} Promise chứa số tin nhắn chưa đọc
   */
  getStaffUnreadCount: async () => {
    try {
      const response = await apiClient.get("/api/chat/staff/unread-count");
      const unreadCount = response.data.unreadCount || 0;
      console.log(
        "📊 [getStaffUnreadCount] Server total unread:",
        unreadCount,
        "- Raw response:",
        response.data
      );
      return unreadCount;
    } catch (error) {
      console.error("Lỗi khi lấy số tin nhắn chưa đọc:", error);
      return 0; // Return 0 thay vì throw để không break UI
    }
  },

  /**
   * Kiểm tra trạng thái đọc tin nhắn của một user cụ thể (cho STAFF/ADMIN)
   * @param {number} userId - ID của user cần kiểm tra
   * @returns {Promise<{allMessagesRead: boolean, unreadMessages: number}>} Promise chứa trạng thái đọc
   */
  getUserReadStatus: async (userId) => {
    try {
      const response = await apiClient.get(`/api/chat/staff/user/${userId}/read-status`);

      // Xử lý dữ liệu từ backend
      const data = response.data;

      // Log chi tiết response từ API để debug
      console.log(`📊 [getUserReadStatus] User ${userId} - API response:`, {
        hasUnreadMessages: data.hasUnreadMessages,
        unreadCount: data.unreadCount,
        rawData: data,
      });

      return {
        allMessagesRead: data.hasUnreadMessages === false, // hasUnreadMessages: false nghĩa là đã đọc hết
        unreadMessages: data.unreadCount || 0, // Sử dụng unreadCount từ backend
        userId: userId,
        userName: data.userName || "",
        userEmail: data.userEmail || "",
        hasUnreadMessages: data.hasUnreadMessages || false, // Giữ lại trường gốc từ backend
      };
    } catch (error) {
      console.error(`Lỗi khi kiểm tra trạng thái đọc tin nhắn user ${userId}:`, error);
      return {
        allMessagesRead: true, // Fallback: giả sử đã đọc hết để không hiển thị badge sai
        unreadMessages: 0,
        userId: userId,
        hasUnreadMessages: false,
      };
    }
  },

  /**
   * Kiểm tra trạng thái đọc tin nhắn cho multiple users (batch check)
   * @param {number[]} userIds - Mảng ID của các user cần kiểm tra
   * @returns {Promise<Array>} Promise chứa mảng trạng thái đọc của từng user
   */
  getBatchUserReadStatus: async (userIds) => {
    try {
      if (!userIds || userIds.length === 0) {
        return [];
      }

      // Gọi API kiểm tra từng user song song để tối ưu performance
      const promises = userIds.map((userId) => chatApi.getUserReadStatus(userId));
      const results = await Promise.allSettled(promises);

      return results.map((result, index) => {
        if (result.status === "fulfilled") {
          return result.value;
        } else {
          console.error(`Lỗi khi kiểm tra user ${userIds[index]}:`, result.reason);
          return {
            allMessagesRead: true,
            unreadMessages: 0,
            userId: userIds[index],
            hasUnreadMessages: false,
          };
        }
      });
    } catch (error) {
      console.error("Lỗi khi kiểm tra batch read status:", error);
      return userIds.map((userId) => ({
        allMessagesRead: true,
        unreadMessages: 0,
        userId: userId,
        hasUnreadMessages: false,
      }));
    }
  },

  // ========== ADMIN APIs ==========

  /**
   * Lấy thống kê chat trong khoảng thời gian (cho ADMIN)
   * @param {Date} startDate - Ngày bắt đầu
   * @param {Date} endDate - Ngày kết thúc
   * @returns {Promise} Promise chứa thống kê chat
   */
  getChatStatistics: async (startDate, endDate) => {
    try {
      const response = await apiClient.get("/api/chat/admin/statistics", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thống kê chat:", error);
      throw error;
    }
  },

  // ========== Helper Functions ==========

  /**
   * Parse timestamp từ nhiều định dạng khác nhau thành Date object
   * Hỗ trợ: Date object, ISO string, timestamp number, "DD/MM/YYYY HH:mm", array [year, month, day, hour, minute, second]
   * @param {any} timestamp - Timestamp cần parse
   * @returns {Date|null} Date object hoặc null nếu không parse được
   */
  parseTimestamp: (timestamp) => {
    if (!timestamp) return null;

    // Nếu đã là Date object
    if (timestamp instanceof Date) {
      return isNaN(timestamp.getTime()) ? null : timestamp;
    }

    // Nếu là number (timestamp milliseconds hoặc seconds)
    if (typeof timestamp === "number") {
      // Nếu timestamp < 10^12, có thể là seconds thay vì milliseconds
      const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
      const date = new Date(ms);
      return isNaN(date.getTime()) ? null : date;
    }

    // Nếu là array [year, month, day, hour, minute, second, nano] (Java LocalDateTime format)
    if (Array.isArray(timestamp) && timestamp.length >= 3) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = timestamp;
      const date = new Date(year, month - 1, day, hour, minute, second);
      return isNaN(date.getTime()) ? null : date;
    }

    // Nếu là string
    if (typeof timestamp === "string") {
      // Thử parse định dạng "DD/MM/YYYY HH:mm" hoặc "DD/MM/YYYY, HH:mm"
      const ddmmyyyyMatch = timestamp.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})[,\s]+(\d{1,2}):(\d{2})$/
      );
      if (ddmmyyyyMatch) {
        const [, day, month, year, hour, minute] = ddmmyyyyMatch;
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour),
          parseInt(minute)
        );
        return isNaN(date.getTime()) ? null : date;
      }

      // Thử parse định dạng "YYYY-MM-DD HH:mm:ss" (MySQL format)
      const mysqlMatch = timestamp.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):?(\d{2})?/);
      if (mysqlMatch) {
        const [, year, month, day, hour, minute, second = "0"] = mysqlMatch;
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          parseInt(second)
        );
        return isNaN(date.getTime()) ? null : date;
      }

      // Thử parse ISO string hoặc các format khác
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }

    // Nếu là object có các trường như Java LocalDateTime
    if (typeof timestamp === "object" && timestamp !== null) {
      if (timestamp.year && timestamp.monthValue && timestamp.dayOfMonth) {
        const date = new Date(
          timestamp.year,
          timestamp.monthValue - 1,
          timestamp.dayOfMonth,
          timestamp.hour || 0,
          timestamp.minute || 0,
          timestamp.second || 0
        );
        return isNaN(date.getTime()) ? null : date;
      }
    }

    return null;
  },

  /**
   * Format tin nhắn để hiển thị trong UI
   * @param {Object} message - Tin nhắn từ API
   * @returns {Object} Tin nhắn đã được format
   */
  formatMessageForDisplay: (message) => {
    const senderType = message.messageType === "USER_TO_STAFF" ? "user" : "staff";

    // Lấy timestamp từ nhiều trường có thể có
    const rawTimestamp = message.timestamp || message.createdAt || message.sentAt || message.time;

    // Debug log để kiểm tra timestamp từ API
    if (!rawTimestamp) {
      console.warn("Tin nhắn không có timestamp:", message);
    }

    const parsedTimestamp = chatApi.parseTimestamp(rawTimestamp);

    // Nếu không parse được, log warning nhưng vẫn giữ rawTimestamp để debug
    if (!parsedTimestamp && rawTimestamp) {
      console.warn(
        "Không thể parse timestamp:",
        rawTimestamp,
        "từ tin nhắn:",
        message.id || message.messageId
      );
    }

    // Xử lý thông tin reply nếu có từ backend
    let replyTo = null;
    if (message.replyToMessageId) {
      replyTo = {
        id: message.replyToMessageId,
        text: message.replyToText || message.replyContext?.originalText || "Tin nhắn đã bị xóa",
        sender: message.replyToSender || (message.replyContext ? "staff" : "user"),
        senderName:
          message.replyToSenderName || message.replyContext?.originalSender || "Người dùng",
        timestamp: chatApi.parseTimestamp(
          message.replyToTimestamp || message.replyContext?.originalTimestamp
        ),
      };
    }

    return {
      id: message.messageId || message.id,
      text: message.message || message.content,
      content: message.message || message.content, // Giữ cả hai để tương thích
      timestamp: parsedTimestamp, // Trả về Date object hoặc null, KHÔNG fallback new Date()
      messageType: message.messageType,
      isRead: message.isRead || false,
      status: message.status || (message.isRead ? "READ" : "DELIVERED"), // Thêm trạng thái tin nhắn
      sender: senderType, // String để tương thích với ChatMessageItem
      senderInfo: {
        // Object chứa thông tin chi tiết
        id: message.senderId || message.userId,
        name: message.senderName || message.userName,
        email: message.senderEmail || message.userEmail,
        phone: message.senderPhone || message.userPhone,
        type: senderType,
      },
      customerName: message.senderName || message.userName, // Để tương thích
      receiverInfo: {
        id: message.receiverId,
        name: message.receiverName,
        type: message.messageType === "STAFF_TO_USER" ? "user" : "staff",
      },
      replyTo: replyTo, // Thêm thông tin reply
    };
  },

  /**
   * Lấy danh sách conversation cho staff (kết hợp API)
   * @returns {Promise} Promise chứa danh sách conversation
   */
  getStaffConversations: async () => {
    try {
      const usersData = await chatApi.getUsersChatWithStaff();

      // Lấy read status cho tất cả users để có unread count chính xác
      const userIds = usersData.users.map((user) => user.id);
      const readStatusResults = await chatApi.getBatchUserReadStatus(userIds);

      const conversations = usersData.users.map((user) => {
        // Tìm read status tương ứng cho user này
        const readStatus = readStatusResults.find((r) => r.userId === user.id);
        // Ưu tiên unreadCount từ read-status API (chính xác hơn)
        const unreadCount = readStatus?.unreadMessages ?? user.unreadCount ?? 0;

        return {
          userId: user.id,
          user: {
            id: user.id,
            name: user.name || user.fullName || user.email || `Khách hàng ${user.id}`,
            email: user.email,
            phone: user.phone,
            type: "user",
          },
          messages: [],
          unreadCount: unreadCount,
          lastMessage: null,
          lastMessageTime: user.lastMessageTime || new Date().toISOString(),
        };
      });

      return {
        conversations,
        totalUsers: usersData.totalUsers,
      };
    } catch (error) {
      console.error("Lỗi khi lấy danh sách conversation:", error);
      return {
        conversations: [],
        totalUsers: 0,
      };
    }
  },
};
