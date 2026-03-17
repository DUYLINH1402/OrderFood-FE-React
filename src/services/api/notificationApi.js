import apiClient from "../apiClient";

// API lấy tất cả thông báo của user
export const getUserNotificationsApi = async () => {
  try {
    const response = await apiClient.get("/api/v1/client/notifications");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải thông báo",
      data: [],
    };
  }
};

// API lấy thông báo chưa đọc của user
export const getUnreadNotificationsApi = async () => {
  try {
    const response = await apiClient.get("/api/v1/client/notifications/unread");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải thông báo chưa đọc",
      data: [],
    };
  }
};

// API lấy số lượng thông báo chưa đọc
export const getUnreadCountApi = async () => {
  try {
    const response = await apiClient.get("/api/v1/client/notifications/unread/count");
    return {
      success: true,
      count: response.data,
    };
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải số lượng thông báo",
      count: 0,
    };
  }
};

// API đánh dấu thông báo đã đọc
export const markNotificationAsReadApi = async (notificationId) => {
  try {
    const response = await apiClient.put(`/api/v1/client/notifications/${notificationId}/read`);
    return {
      success: true,
      message: "Đã đánh dấu thông báo là đã đọc",
      data: response.data,
    };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể đánh dấu thông báo đã đọc",
    };
  }
};

// API đánh dấu tất cả thông báo đã đọc
export const markAllNotificationsAsReadApi = async () => {
  try {
    const response = await apiClient.put("/api/v1/client/notifications/read-all");
    return {
      success: true,
      message: "Đã đánh dấu tất cả thông báo là đã đọc",
      data: response.data,
    };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể đánh dấu tất cả thông báo đã đọc",
    };
  }
};

// API xóa thông báo
export const deleteNotificationApi = async (notificationId) => {
  try {
    const response = await apiClient.delete(`/api/v1/client/notifications/${notificationId}`);
    return {
      success: true,
      message: "Đã xóa thông báo",
      data: response.data,
    };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể xóa thông báo",
    };
  }
};

// API xóa tất cả thông báo
export const deleteAllNotificationsApi = async () => {
  try {
    const response = await apiClient.delete("/api/v1/client/notifications/all");
    return {
      success: true,
      message: "Đã xóa tất cả thông báo",
      data: response.data,
    };
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể xóa tất cả thông báo",
    };
  }
};

// ===== STAFF NOTIFICATION APIS =====

// API lấy tất cả thông báo của staff
export const getStaffNotificationsApi = async () => {
  try {
    const response = await apiClient.get("/api/v1/staff/notifications");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(" Error in getStaffNotificationsApi:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải thông báo",
      data: [],
    };
  }
};

// API lấy thông báo chưa đọc của staff - Cần token
export const getStaffUnreadNotificationsApi = async () => {
  try {
    const response = await apiClient.get("/api/v1/staff/notifications/unread");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching staff unread notifications:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải thông báo chưa đọc",
      data: [],
    };
  }
};

// API lấy số lượng thông báo chưa đọc của staff - Cần token
export const getStaffUnreadCountApi = async () => {
  try {
    const response = await apiClient.get("/api/v1/staff/notifications/unread/count");
    return {
      success: true,
      count: response.data,
    };
  } catch (error) {
    console.error("Error fetching staff unread count:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải số lượng thông báo",
      count: 0,
    };
  }
};

// API đánh dấu thông báo staff đã đọc - Cần token
export const markStaffNotificationAsReadApi = async (notificationId) => {
  try {
    const response = await apiClient.put(`/api/v1/staff/notifications/${notificationId}/read`);
    return {
      success: true,
      message: "Đã đánh dấu thông báo là đã đọc",
      data: response.data,
    };
  } catch (error) {
    console.error("Error in markStaffNotificationAsReadApi:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể đánh dấu thông báo đã đọc",
    };
  }
};

// API đánh dấu tất cả thông báo staff đã đọc - Cần token
export const markAllStaffNotificationsAsReadApi = async () => {
  try {
    const response = await apiClient.put("/api/v1/staff/notifications/read-all");
    return {
      success: true,
      message: "Đã đánh dấu tất cả thông báo là đã đọc",
      data: response.data,
    };
  } catch (error) {
    console.error("Error marking all staff notifications as read:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể đánh dấu tất cả thông báo đã đọc",
    };
  }
};

// API xóa thông báo staff - Cần token (nếu BE có hỗ trợ)
export const deleteStaffNotificationApi = async (notificationId) => {
  try {
    const response = await apiClient.delete(`/api/v1/staff/notifications/${notificationId}`);
    return {
      success: true,
      message: "Đã xóa thông báo",
      data: response.data,
    };
  } catch (error) {
    console.error("Error in deleteStaffNotificationApi:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể xóa thông báo",
    };
  }
};

// API xóa tất cả thông báo staff - Cần token (nếu BE có hỗ trợ)
export const deleteAllStaffNotificationsApi = async () => {
  try {
    const response = await apiClient.delete("/api/v1/staff/notifications/all");
    return {
      success: true,
      message: "Đã xóa tất cả thông báo",
      data: response.data,
    };
  } catch (error) {
    console.error("Error deleting all staff notifications:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể xóa tất cả thông báo",
    };
  }
};
