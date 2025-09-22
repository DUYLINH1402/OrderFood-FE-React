const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";

import { sendMessageToChatbotApi, getChatHistoryApi } from "../api/chatbotApi";

/**
 * Service wrapper để gửi tin nhắn tới chatbot
 * @param {Object} chatData - Dữ liệu chat
 * @returns {Promise} Promise chứa phản hồi từ chatbot
 */
export const sendMessageToChatbot = async (chatData) => {
  // Hiện tại chỉ dùng API backend, có thể mở rộng Firebase sau
  return useFirebase ? null : await sendMessageToChatbotApi(chatData);
};

/**
 * Service wrapper để lấy lịch sử chat
 * @param {string} sessionId - Session ID của cuộc hội thoại
 * @returns {Promise} Promise chứa lịch sử chat
 */
export const getChatHistory = async (sessionId) => {
  return useFirebase ? [] : await getChatHistoryApi(sessionId);
};

/**
 * Tạo session ID mới cho cuộc hội thoại
 * @param {number} [userId] - ID người dùng (optional)
 * @returns {string} Session ID duy nhất
 */
export const generateSessionId = (userId = null) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return userId ? `${userId}_${timestamp}_${random}` : `guest_${timestamp}_${random}`;
};

/**
 * Lấy user context để gửi kèm tin nhắn (thông tin bổ sung về người dùng)
 * @returns {string} JSON string chứa thông tin context
 */
export const getUserContext = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const context = {
      isLoggedIn: !!user.id,
      userId: user.id || null,
      userName: user.fullName || user.name || null,
      userRole: user.role || "CUSTOMER",
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(context);
  } catch (error) {
    console.error("Lỗi khi lấy user context:", error);
    return JSON.stringify({
      isLoggedIn: false,
      userId: null,
      userName: null,
      userRole: "GUEST",
      timestamp: new Date().toISOString(),
    });
  }
};
