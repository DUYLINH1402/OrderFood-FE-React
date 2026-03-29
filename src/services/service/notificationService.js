import {
  getUserNotificationsApi,
  getUnreadNotificationsApi,
  getUnreadCountApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
  deleteNotificationApi,
  deleteAllNotificationsApi,
  // Staff APIs
  getStaffNotificationsApi,
  getStaffUnreadNotificationsApi,
  getStaffUnreadCountApi,
  markStaffNotificationAsReadApi,
  markAllStaffNotificationsAsReadApi,
  deleteStaffNotificationApi,
  deleteAllStaffNotificationsApi,
} from "../api/notificationApi";

/**
 * Service để quản lý thông báo người dùng
 * Kết hợp dữ liệu từ API backend và WebSocket real-time
 */

// Lấy tất cả thông báo của user từ database
export const getUserNotifications = async () => {
  try {
    const result = await getUserNotificationsApi();

    if (result.success) {
      // Xử lý dữ liệu từ BE - có thể là array trực tiếp hoặc object chứa array
      let notifications = result.data;

      // Kiểm tra nếu data là object có chứa array notifications
      if (notifications && typeof notifications === "object" && !Array.isArray(notifications)) {
        notifications =
          notifications.notifications || notifications.data || notifications.content || [];
      }

      // Đảm bảo là array
      if (!Array.isArray(notifications)) {
        notifications = [];
      }

      // Transform dữ liệu từ BE về format phù hợp với frontend
      const transformedNotifications = notifications.map(transformNotificationFromAPI);
      return {
        success: true,
        data: transformedNotifications,
      };
    }
    return result;
  } catch (error) {
    console.error("Error in getUserNotifications service:", error);
    return {
      success: false,
      message: "Không thể tải thông báo",
      data: [],
    };
  }
};

// Lấy thông báo chưa đọc từ database
export const getUnreadNotifications = async () => {
  try {
    const result = await getUnreadNotificationsApi();
    if (result.success) {
      // Xử lý dữ liệu từ BE - có thể là array trực tiếp hoặc object chứa array
      let notifications = result.data;

      // Kiểm tra nếu data là object có chứa array notifications
      if (notifications && typeof notifications === "object" && !Array.isArray(notifications)) {
        notifications =
          notifications.notifications || notifications.data || notifications.content || [];
      }

      // Đảm bảo là array
      if (!Array.isArray(notifications)) {
        console.warn("BE unread response không phải array:", notifications);
        notifications = [];
      }

      const transformedNotifications = notifications.map(transformNotificationFromAPI);
      return {
        success: true,
        data: transformedNotifications,
      };
    }
    return result;
  } catch (error) {
    console.error("Error in getUnreadNotifications service:", error);
    return {
      success: false,
      message: "Không thể tải thông báo chưa đọc",
      data: [],
    };
  }
};

// Lấy số lượng thông báo chưa đọc
export const getUnreadCount = async () => {
  try {
    const result = await getUnreadCountApi();
    return result;
  } catch (error) {
    console.error("Error in getUnreadCount service:", error);
    return {
      success: false,
      message: "Không thể tải số lượng thông báo",
      count: 0,
    };
  }
};

// Đánh dấu thông báo đã đọc
export const markNotificationAsRead = async (notificationId) => {
  try {
    const result = await markNotificationAsReadApi(notificationId);
    return result;
  } catch (error) {
    console.error("Error in markNotificationAsRead service:", error);
    return {
      success: false,
      message: "Không thể đánh dấu thông báo đã đọc",
    };
  }
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllNotificationsAsRead = async () => {
  try {
    const result = await markAllNotificationsAsReadApi();
    return result;
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead service:", error);
    return {
      success: false,
      message: "Không thể đánh dấu tất cả thông báo đã đọc",
    };
  }
};

// Xóa thông báo
export const deleteNotification = async (notificationId) => {
  try {
    const result = await deleteNotificationApi(notificationId);
    return result;
  } catch (error) {
    console.error("Error in deleteNotification service:", error);
    return {
      success: false,
      message: "Không thể xóa thông báo",
    };
  }
};

// Xóa tất cả thông báo
export const deleteAllNotifications = async () => {
  try {
    const result = await deleteAllNotificationsApi();
    return result;
  } catch (error) {
    console.error("Error in deleteAllNotifications service:", error);
    return {
      success: false,
      message: "Không thể xóa tất cả thông báo",
    };
  }
};

/**
 * Transform dữ liệu notification từ API backend về format frontend
 * @param {Object} apiNotification - Notification từ API
 * @returns {Object} - Notification format cho frontend
 */
const transformNotificationFromAPI = (apiNotification) => {
  return {
    id: apiNotification.id,
    type: apiNotification.type || "SYSTEM_NOTIFICATION",
    title: apiNotification.title,
    message: apiNotification.message,
    read:
      apiNotification.is_read === 1 ||
      apiNotification.is_read === true ||
      apiNotification.isRead === true,
    timestamp: apiNotification.created_at || apiNotification.createdAt,
    readAt: apiNotification.read_at || apiNotification.readAt,

    // Thông tin về đơn hàng (nếu có)
    orderData: apiNotification.orderId || apiNotification.order_id
      ? {
          id: apiNotification.orderId || apiNotification.order_id,
          orderCode: apiNotification.orderCode || apiNotification.order_code,
        }
      : null,

    // Priority và category (nếu BE có)
    priority: apiNotification.priority || "medium",
    category: apiNotification.category || "general",

    // Thông tin người nhận
    recipientId: apiNotification.recipientId || apiNotification.recipient_id,
    recipientType: apiNotification.recipientType || apiNotification.recipient_type,

    // Action URL nếu có
    actionUrl: apiNotification.actionUrl || apiNotification.action_url,
  };
};

/**
 * Transform dữ liệu từ WebSocket về format frontend
 * @param {Object} wsNotification - Notification từ WebSocket
 * @returns {Object} - Notification format cho frontend
 */
export const transformNotificationFromWebSocket = (wsNotification) => {
  return {
    id: wsNotification.id || `ws_${Date.now()}_${Math.random()}`,
    type: wsNotification.type || wsNotification.eventType || "SYSTEM_NOTIFICATION",
    title: wsNotification.title,
    message: wsNotification.message,
    read: false, // WebSocket notification luôn là chưa đọc
    timestamp: wsNotification.timestamp || new Date().toISOString(),

    // Thông tin đơn hàng từ WebSocket
    orderData:
      wsNotification.orderData ||
      (wsNotification.orderId
        ? {
            id: wsNotification.orderId,
            orderCode: wsNotification.orderCode,
            orderStatus: wsNotification.orderStatus,
            totalPrice: wsNotification.totalPrice,
            receiverName: wsNotification.receiverName,
            receiverPhone: wsNotification.receiverPhone,
          }
        : null),

    priority: wsNotification.priority || "medium",
    category: wsNotification.category || "order_update",
  };
};

/**
 * Merge notifications từ API và WebSocket, loại bỏ duplicate
 * @param {Array} apiNotifications - Notifications từ API
 * @param {Array} wsNotifications - Notifications từ WebSocket
 * @returns {Array} - Merged notifications
 */
export const mergeNotifications = (apiNotifications = [], wsNotifications = []) => {
  const allNotifications = [...apiNotifications, ...wsNotifications];

  // Loại bỏ duplicate với logic cải thiện - KHÔNG so sánh type vì API và WebSocket có type khác nhau
  const uniqueNotifications = allNotifications.filter((notification, index, self) => {
    return (
      index ===
      self.findIndex((n) => {
        // So sánh theo id nếu có (ưu tiên cao nhất)
        if (notification.id && n.id && notification.id === n.id) {
          return true;
        }

        // So sánh theo orderCode KHÔNG quan tâm type (vì API và WebSocket có type khác)
        if (notification.orderData?.orderCode && n.orderData?.orderCode) {
          const isSameOrder = notification.orderData.orderCode === n.orderData.orderCode;
          const isWithinTimeRange =
            Math.abs(new Date(notification.timestamp) - new Date(n.timestamp)) < 300000; // 5 phút

          // Log để debug
          if (isSameOrder && isWithinTimeRange) {
            console.log("🔍 Detected duplicate by orderCode:", {
              notification1: {
                id: notification.id,
                type: notification.type,
                orderCode: notification.orderData.orderCode,
              },
              notification2: { id: n.id, type: n.type, orderCode: n.orderData.orderCode },
              timeDiff:
                Math.abs(new Date(notification.timestamp) - new Date(n.timestamp)) / 1000 +
                " seconds",
            });
          }

          return isSameOrder && isWithinTimeRange;
        }

        // So sánh theo title và message (fallback) - KHÔNG so sánh type
        const isSameContent = notification.title === n.title && notification.message === n.message;
        const isWithinTimeRange =
          Math.abs(new Date(notification.timestamp) - new Date(n.timestamp)) < 60000; // 1 phút

        if (isSameContent && isWithinTimeRange) {
          console.log("🔍 Detected duplicate by content:", {
            notification1: {
              id: notification.id,
              type: notification.type,
              title: notification.title,
            },
            notification2: { id: n.id, type: n.type, title: n.title },
            timeDiff:
              Math.abs(new Date(notification.timestamp) - new Date(n.timestamp)) / 1000 +
              " seconds",
          });
        }

        return isSameContent && isWithinTimeRange;
      })
    );
  });

  // Ưu tiên API notification hơn WebSocket notification (vì API có id từ DB)
  const prioritizedNotifications = uniqueNotifications.sort((a, b) => {
    // Nếu cùng orderCode, ưu tiên API (có id numeric)
    if (
      a.orderData?.orderCode &&
      b.orderData?.orderCode &&
      a.orderData.orderCode === b.orderData.orderCode
    ) {
      const aIsAPI = a.id && !a.id.toString().startsWith("ws_");
      const bIsAPI = b.id && !b.id.toString().startsWith("ws_");

      if (aIsAPI && !bIsAPI) return -1; // a (API) lên trước
      if (!aIsAPI && bIsAPI) return 1; // b (API) lên trước
    }

    // Sắp xếp theo thời gian mới nhất
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return prioritizedNotifications;
};

// ===== STAFF NOTIFICATION SERVICES =====

// Lấy tất cả thông báo của staff từ database
export const getStaffNotifications = async () => {
  try {
    const result = await getStaffNotificationsApi();

    if (result.success) {
      // Xử lý dữ liệu từ BE - có thể là array trực tiếp hoặc object chứa array
      let notifications = result.data;

      // Kiểm tra nếu data là object có chứa array notifications
      if (notifications && typeof notifications === "object" && !Array.isArray(notifications)) {
        notifications =
          notifications.notifications || notifications.data || notifications.content || [];
      }

      // Đảm bảo là array
      if (!Array.isArray(notifications)) {
        notifications = [];
      }

      // Transform dữ liệu từ BE về format phù hợp với frontend
      const transformedNotifications = notifications.map(transformNotificationFromAPI);
      return {
        success: true,
        data: transformedNotifications,
      };
    }
    return result;
  } catch (error) {
    console.error("🔧 Error in getStaffNotifications service:", error);
    return {
      success: false,
      message: "Không thể tải thông báo nhân viên",
      data: [],
    };
  }
};

// Lấy thông báo chưa đọc của staff từ database
export const getStaffUnreadNotifications = async () => {
  try {
    const result = await getStaffUnreadNotificationsApi();
    if (result.success) {
      // Xử lý dữ liệu từ BE - có thể là array trực tiếp hoặc object chứa array
      let notifications = result.data;

      // Kiểm tra nếu data là object có chứa array notifications
      if (notifications && typeof notifications === "object" && !Array.isArray(notifications)) {
        notifications =
          notifications.notifications || notifications.data || notifications.content || [];
      }

      // Đảm bảo là array
      if (!Array.isArray(notifications)) {
        notifications = [];
      }

      const transformedNotifications = notifications.map(transformNotificationFromAPI);
      return {
        success: true,
        data: transformedNotifications,
      };
    }
    return result;
  } catch (error) {
    console.error("Error in getStaffUnreadNotifications service:", error);
    return {
      success: false,
      message: "Không thể tải thông báo chưa đọc của nhân viên",
      data: [],
    };
  }
};

// Lấy số lượng thông báo chưa đọc của staff
export const getStaffUnreadCount = async () => {
  try {
    const result = await getStaffUnreadCountApi();
    return result;
  } catch (error) {
    console.error("Error in getStaffUnreadCount service:", error);
    return {
      success: false,
      message: "Không thể tải số lượng thông báo nhân viên",
      count: 0,
    };
  }
};

// Đánh dấu thông báo staff đã đọc
export const markStaffNotificationAsRead = async (notificationId) => {
  try {
    const result = await markStaffNotificationAsReadApi(notificationId);
    return result;
  } catch (error) {
    console.error(" Error in markStaffNotificationAsRead service:", error);
    return {
      success: false,
      message: "Không thể đánh dấu thông báo nhân viên đã đọc",
    };
  }
};

// Đánh dấu tất cả thông báo staff đã đọc
export const markAllStaffNotificationsAsRead = async () => {
  try {
    const result = await markAllStaffNotificationsAsReadApi();
    return result;
  } catch (error) {
    console.error("Error in markAllStaffNotificationsAsRead service:", error);
    return {
      success: false,
      message: "Không thể đánh dấu tất cả thông báo nhân viên đã đọc",
    };
  }
};

// Xóa thông báo staff
export const deleteStaffNotification = async (notificationId) => {
  try {
    const result = await deleteStaffNotificationApi(notificationId);
    return result;
  } catch (error) {
    console.error(" Error in deleteStaffNotification service:", error);
    return {
      success: false,
      message: "Không thể xóa thông báo nhân viên",
    };
  }
};

// Xóa tất cả thông báo staff
export const deleteAllStaffNotifications = async () => {
  try {
    const result = await deleteAllStaffNotificationsApi();
    return result;
  } catch (error) {
    console.error("Error in deleteAllStaffNotifications service:", error);
    return {
      success: false,
      message: "Không thể xóa tất cả thông báo nhân viên",
    };
  }
};
