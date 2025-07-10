import apiClient, { publicClient } from "../apiClient";

// LẤY TẤT CẢ FEEDBACK - API công khai
export const getAllFeedbacksFromSQL = async () => {
  try {
    const response = await publicClient.get("/api/feedback-media");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách feedback:", error?.response?.data || error.message);
    return [];
  }
};

// LẤY FEEDBACK THEO ID - API công khai
export const getFeedbackByIdFromSQL = async (id) => {
  try {
    const response = await publicClient.get(`/api/feedback-media/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy feedback (${id}):`, error?.response?.data || error.message);
    return null;
  }
};

// TẠO FEEDBACK MỚI - Cần token
export const createFeedbackInSQL = async (data) => {
  try {
    const response = await apiClient.post("/api/feedback-media", data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo feedback:", error?.response?.data || error.message);
    return null;
  }
};

// CẬP NHẬT FEEDBACK - Cần token
export const updateFeedbackInSQL = async (id, data) => {
  try {
    const response = await apiClient.put(`/api/feedback-media/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật feedback (${id}):`, error?.response?.data || error.message);
    return null;
  }
};

// XOÁ FEEDBACK - Cần token
export const deleteFeedbackInSQL = async (id) => {
  try {
    await apiClient.delete(`/api/feedback-media/${id}`);
    return true;
  } catch (error) {
    console.error(`Lỗi khi xoá feedback (${id}):`, error?.response?.data || error.message);
    return false;
  }
};
