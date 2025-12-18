import { chatApi } from "../api/chatApi";

/**
 * Service để xử lý chức năng chat của user
 * Wrapper cho chatApi để thống nhất với cấu trúc service của dự án
 */
export const chatService = {
  /**
   * Lấy lịch sử chat của user hiện tại
   * @param {number} page - Trang cần tải (0 = mới nhất)
   * @param {number} size - Số lượng tin nhắn mỗi trang
   * @returns {Promise<Object>} Object chứa messages và pagination info
   */
  getChatHistory: async (page = 0, size = 20) => {
    try {
      const response = await chatApi.getChatHistory(page, size);

      // Xử lý dữ liệu theo cấu trúc pagination từ backend
      let messages = [];

      if (response?.messages && Array.isArray(response.messages)) {
        // Response trực tiếp là object pagination
        messages = response.messages;
      } else if (response?.data?.messages && Array.isArray(response.data.messages)) {
        // Response wrapped trong data
        messages = response.data.messages;
      } else if (Array.isArray(response?.data)) {
        // Response.data là array trực tiếp
        messages = response.data;
      } else if (Array.isArray(response)) {
        // Response là array trực tiếp
        messages = response;
      }

      // Sort theo timestamp (tin nhắn cũ trước, mới sau)
      const sortedMessages = messages.sort((a, b) => {
        const timeA = new Date(a.timestamp || a.sentAt || a.createdAt || 0);
        const timeB = new Date(b.timestamp || b.sentAt || b.createdAt || 0);
        return timeA - timeB;
      });

      // Trả về object chứa cả messages và pagination info
      return {
        messages: sortedMessages,
        currentPage: response?.currentPage || page,
        totalPages: response?.totalPages || 1,
        totalElements: response?.totalElements || sortedMessages.length,
        hasNext: response?.hasNext || false,
        hasPrevious: response?.hasPrevious || false,
        isFirst: response?.currentPage === 0,
        isLast: response?.hasNext === false,
      };
    } catch (error) {
      console.error("Lỗi trong chatService.getChatHistory:", error);

      // Trả về object rỗng thay vì throw error để tránh crash UI
      return {
        messages: [],
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        hasNext: false,
        hasPrevious: false,
        isFirst: true,
        isLast: true,
      };
    }
  },

  /**
   * Lấy số lượng tin nhắn chưa đọc
   * @returns {Promise<number>} Số lượng tin nhắn chưa đọc
   */
  getUnreadCount: async () => {
    try {
      const unreadMessages = await chatService.getUnreadMessages();
      return Array.isArray(unreadMessages) ? unreadMessages.length : 0;
    } catch (error) {
      console.error("Lỗi trong chatService.getUnreadCount:", error);
      return 0;
    }
  },

  /**
   * Lấy danh sách tin nhắn chưa đọc
   * @returns {Promise<Array>} Danh sách tin nhắn chưa đọc
   */
  getUnreadMessages: async () => {
    try {
      const response = await chatApi.getUnreadMessages();

      // Xử lý tương tự như getChatHistory
      let messages = [];

      if (response?.messages && Array.isArray(response.messages)) {
        messages = response.messages;
      } else if (response?.data?.messages && Array.isArray(response.data.messages)) {
        messages = response.data.messages;
      } else if (Array.isArray(response?.data)) {
        messages = response.data;
      } else if (Array.isArray(response)) {
        messages = response;
      }

      // Sort tin nhắn mới nhất trước
      const sortedMessages = messages.sort((a, b) => {
        const timeA = new Date(a.timestamp || a.createdAt || 0);
        const timeB = new Date(b.timestamp || b.createdAt || 0);
        return timeB - timeA;
      });

      return sortedMessages;
    } catch (error) {
      console.error("Lỗi trong chatService.getUnreadMessages:", error);
      return [];
    }
  },

  /**
   * Đánh dấu tin nhắn đã đọc
   * @param {number} messageId - ID của tin nhắn
   * @returns {Promise<boolean>} Kết quả thành công/thất bại
   */
  markAsRead: async (messageId) => {
    try {
      if (!messageId) {
        console.warn("messageId không hợp lệ");
        return false;
      }

      await chatApi.markMessageAsRead(messageId);
      console.log(`Đã đánh dấu tin nhắn ${messageId} là đã đọc`);
      return true;
    } catch (error) {
      console.error(`Lỗi trong chatService.markAsRead(${messageId}):`, error);
      return false;
    }
  },

  /**
   * Đánh dấu tất cả tin nhắn đã đọc
   * @returns {Promise<{success: boolean, count: number}>} Kết quả và số lượng tin nhắn đã đánh dấu
   */
  markAllAsRead: async () => {
    try {
      const result = await chatApi.markAllMessagesAsRead();
      console.log(`Đã đánh dấu ${result.markedCount} tin nhắn là đã đọc`);

      return {
        success: result.success,
        count: result.markedCount,
      };
    } catch (error) {
      console.error("Lỗi trong chatService.markAllAsRead:", error);
      return { success: false, count: 0 };
    }
  },

  /**
   * Kiểm tra xem có tin nhắn mới không
   * @returns {Promise<boolean>} True nếu có tin nhắn chưa đọc
   */
  hasUnreadMessages: async () => {
    try {
      const count = await chatService.getUnreadCount();
      return count > 0;
    } catch (error) {
      console.error("Lỗi trong chatService.hasUnreadMessages:", error);
      return false;
    }
  },
};
