import { publicClient } from "../apiClient";

/**
 * Gửi tin nhắn tới chatbot qua API
 * @param {Object} chatData - Dữ liệu tin nhắn
 * @param {string} chatData.message - Tin nhắn người dùng
 * @param {string} chatData.sessionId - Session ID để duy trì ngữ cảnh cuộc hội thoại
 * @param {number} [chatData.userId] - ID người dùng (có thể null cho khách vãng lai)
 * @param {string} [chatData.userContext] - Thông tin bổ sung về người dùng
 * @returns {Promise} Promise chứa phản hồi từ API
 */
export const sendMessageToChatbotApi = async (chatData) => {
  try {
    const response = await publicClient.post("/api/chatbot/chat", chatData);

    return {
      success: true,
      data: response.data,
      message: "Gửi tin nhắn thành công",
    };
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn tới chatbot:", error);

    return {
      success: false,
      message: error.response?.data?.message || "Không thể gửi tin nhắn tới chatbot",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Lấy lịch sử chat qua API
 * @param {string} sessionId - Session ID của cuộc hội thoại
 * @returns {Promise} Promise chứa lịch sử chat
 */
export const getChatHistoryApi = async (sessionId) => {
  try {
    const response = await publicClient.get(`/api/chatbot/history/${sessionId}`);

    return {
      success: true,
      data: response.data,
      message: "Lấy lịch sử chat thành công",
    };
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử chat:", error);

    return {
      success: false,
      message: error.response?.data?.message || "Không thể lấy lịch sử chat",
      error: error.response?.data || error.message,
    };
  }
};
