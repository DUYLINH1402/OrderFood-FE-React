/**
 * Utility functions để xử lý thông báo từ WebSocket với OrderStatus enum từ BE
 */

/**
 * Chuyển đổi dữ liệu WebSocket thành notification object
 * @param {Object} socketData - Dữ liệu từ WebSocket
 * @returns {Object} - Notification object
 */
export const createNotificationFromSocket = (socketData) => {
  const {
    messageType,
    orderId,
    orderCode,
    orderStatus,
    previousStatus,
    customerName,
    customerPhone,
    totalAmount,
    timestamp,
    message,
    customerId,
    userId,
  } = socketData;

  // Xác định loại thông báo và độ ưu tiên dựa trên OrderStatus enum từ BE
  const getNotificationConfig = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return {
          type: "ORDER_PENDING",
          priority: "medium",
          title: "Đơn hàng chờ thanh toán",
        };
      case "PROCESSING":
        return {
          type: "ORDER_PROCESSING",
          priority: "medium",
          title: "Đơn hàng đang được xử lý",
        };
      case "CONFIRMED":
        return {
          type: "ORDER_CONFIRMED",
          priority: "high",
          title: "Đơn hàng đã được xác nhận",
        };
      case "DELIVERING":
        return {
          type: "ORDER_DELIVERING",
          priority: "high",
          title: "Đơn hàng đang được giao",
        };
      case "COMPLETED":
        return {
          type: "ORDER_COMPLETED",
          priority: "medium",
          title: "Đơn hàng đã hoàn thành",
        };
      case "CANCELLED":
        return {
          type: "ORDER_CANCELLED",
          priority: "high",
          title: "Đơn hàng đã bị hủy",
        };
      default:
        return {
          type: "CUSTOMER_ORDER_UPDATE",
          priority: "low",
          title: "Cập nhật đơn hàng",
        };
    }
  };

  const config = getNotificationConfig(orderStatus);

  return {
    id: `${messageType}_${orderId}_${timestamp}`,
    type: config.type,
    title: config.title,
    message: message || `Đơn hàng ${orderCode} đã chuyển sang trạng thái ${orderStatus}`,
    timestamp: timestamp,
    read: false,
    priority: config.priority,
    orderData: {
      id: orderId,
      orderCode: orderCode,
      orderStatus: orderStatus,
      previousStatus: previousStatus,
      totalPrice: totalAmount,
      customerName: customerName,
      customerPhone: customerPhone,
      customerId: customerId,
    },
    // Thêm thông tin bổ sung
    messageType: messageType,
    userId: userId,
    actionUrl: `/ho-so?tab=orders&order=${orderCode}`,
  };
};

/**
 * Xác định xem thông báo có phải là ưu tiên cao không
 * @param {string} orderStatus - Trạng thái đơn hàng từ BE enum
 * @returns {boolean}
 */
export const isHighPriorityNotification = (orderStatus) => {
  const highPriorityStatuses = ["CONFIRMED", "DELIVERING", "CANCELLED"];
  return highPriorityStatuses.includes(orderStatus?.toUpperCase());
};

/**
 * Tạo âm thanh thông báo dựa trên loại đơn hàng
 * @param {string} orderStatus - Trạng thái đơn hàng từ BE enum
 * @returns {string} - Tên file âm thanh
 */
// export const getNotificationSound = (orderStatus) => {
//   switch (orderStatus?.toUpperCase()) {
//     case "PENDING":
//       return "pending.mp3";
//     case "PROCESSING":
//       return "processing.mp3";
//     case "CONFIRMED":
//       return "confirmation.mp3";
//     case "DELIVERING":
//       return "priority.mp3";
//     case "COMPLETED":
//       return "success.mp3";
//     case "CANCELLED":
//       return "alert.mp3";
//     default:
//       return "default.mp3";
//   }
// };

/**
 * Lọc thông báo theo trạng thái
 * @param {Array} notifications - Danh sách thông báo
 * @param {string} status - Trạng thái cần lọc (từ BE enum)
 * @returns {Array} - Danh sách thông báo đã lọc
 */
export const filterNotificationsByStatus = (notifications, status) => {
  if (!status) return notifications;

  return notifications.filter(
    (notification) => notification.orderData?.orderStatus?.toUpperCase() === status.toUpperCase()
  );
};

/**
 * Sắp xếp thông báo theo độ ưu tiên và thời gian
 * @param {Array} notifications - Danh sách thông báo
 * @returns {Array} - Danh sách thông báo đã sắp xếp
 */
export const sortNotificationsByPriority = (notifications) => {
  const priorityOrder = { high: 3, medium: 2, low: 1 };

  return [...notifications].sort((a, b) => {
    // Sắp xếp theo độ ưu tiên trước
    const priorityDiff = (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
    if (priorityDiff !== 0) return priorityDiff;

    // Sau đó sắp xếp theo thời gian (mới nhất trước)
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
};

/**
 * Nhóm thông báo theo đơn hàng
 * @param {Array} notifications - Danh sách thông báo
 * @returns {Object} - Object chứa thông báo được nhóm theo orderCode
 */
export const groupNotificationsByOrder = (notifications) => {
  return notifications.reduce((groups, notification) => {
    const orderCode = notification.orderData?.orderCode;
    if (!orderCode) return groups;

    if (!groups[orderCode]) {
      groups[orderCode] = [];
    }
    groups[orderCode].push(notification);

    return groups;
  }, {});
};

/**
 * Lấy icon config cho notification dựa trên type và orderStatus
 * Dùng chung cho NotificationBell và NotificationsTab
 * @param {string} type - Type của notification từ backend
 * @param {string} orderStatus - Status của order (nếu có)
 * @returns {Object} Object chứa icon config
 */
export const getNotificationIconConfig = (type, orderStatus) => {
  // Mapping cho notification icons
  const iconConfigs = {
    // Order notifications
    NEW_ORDER: {
      iconType: "ShoppingCart",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      gradientBg: "bg-gradient-to-br from-green-400 to-green-600",
    },
    ORDER_CONFIRMED: {
      iconType: "CheckCircle",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      gradientBg: "bg-gradient-to-br from-green-400 to-green-600",
    },
    ORDER_PREPARING: {
      iconType: "ChefHat",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      gradientBg: "bg-gradient-to-br from-orange-400 to-orange-600",
    },
    ORDER_READY: {
      iconType: "Package",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
      gradientBg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    },
    ORDER_DELIVERING: {
      iconType: "Truck",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      gradientBg: "bg-gradient-to-br from-indigo-400 to-indigo-600",
    },
    ORDER_DELIVERED: {
      iconType: "CheckCircle",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      gradientBg: "bg-gradient-to-br from-green-400 to-green-600",
    },
    ORDER_COMPLETED: {
      iconType: "Package",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      gradientBg: "bg-gradient-to-br from-purple-400 to-purple-600",
    },
    ORDER_CANCELLED: {
      iconType: "XCircle",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      gradientBg: "bg-gradient-to-br from-red-400 to-red-600",
    },
    ORDER_REJECTED: {
      iconType: "AlertTriangle",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      gradientBg: "bg-gradient-to-br from-red-400 to-red-600",
    },

    // Payment notifications
    PAYMENT_SUCCESS: {
      iconType: "CheckCircle",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      gradientBg: "bg-gradient-to-br from-green-400 to-green-600",
    },
    PAYMENT_FAILED: {
      iconType: "XCircle",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      gradientBg: "bg-gradient-to-br from-red-400 to-red-600",
    },

    // Promotion notifications
    PROMOTION: {
      iconType: "ShoppingCart",
      bgColor: "bg-pink-100",
      textColor: "text-pink-600",
      gradientBg: "bg-gradient-to-br from-pink-400 to-pink-600",
    },

    // System notifications
    SYSTEM: {
      iconType: "Bell",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      gradientBg: "bg-gradient-to-br from-blue-400 to-blue-600",
    },
    SYSTEM_NOTIFICATION: {
      iconType: "Bell",
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
      gradientBg: "bg-gradient-to-br from-gray-400 to-gray-600",
    },

    // Legacy support - mapping by orderStatus
    CONFIRMED: {
      iconType: "CheckCircle",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      gradientBg: "bg-gradient-to-br from-green-400 to-green-600",
    },
    PREPARING: {
      iconType: "ChefHat",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      gradientBg: "bg-gradient-to-br from-orange-400 to-orange-600",
    },
    DELIVERING: {
      iconType: "Truck",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      gradientBg: "bg-gradient-to-br from-indigo-400 to-indigo-600",
    },
    COMPLETED: {
      iconType: "Package",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      gradientBg: "bg-gradient-to-br from-purple-400 to-purple-600",
    },
    CANCELLED: {
      iconType: "XCircle",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      gradientBg: "bg-gradient-to-br from-red-400 to-red-600",
    },
  };

  // Ưu tiên type trước, fallback về orderStatus
  return (
    iconConfigs[type] || iconConfigs[orderStatus?.toUpperCase()] || iconConfigs.SYSTEM_NOTIFICATION
  );
};

/**
 * Lấy màu priority cho notification
 * @param {string} priority - Priority level (high, medium, low)
 * @returns {string} CSS class cho màu text
 */
export const getPriorityColor = (priority) => {
  const priorityColors = {
    high: "text-red-600",
    medium: "text-orange-600",
    low: "text-green-600",
  };

  return priorityColors[priority] || "text-gray-600";
};

/**
 * Format thời gian hiển thị "time ago"
 * @param {string|Date} timestamp - Timestamp của notification
 * @returns {string} Formatted time string
 */
export const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return time.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Filter notifications theo type
 * @param {Array} notifications - Danh sách notifications
 * @param {string} filter - Filter type (all, unread, orders, system)
 * @returns {Array} Filtered notifications
 */
export const filterNotifications = (notifications, filter) => {
  if (!Array.isArray(notifications)) return [];

  switch (filter) {
    case "unread":
      return notifications.filter((n) => !n.read);

    case "orders":
      return notifications.filter(
        (n) =>
          n.type?.toLowerCase().includes("order") ||
          n.type === "ORDER_CONFIRMED" ||
          n.type === "ORDER_PREPARING" ||
          n.type === "ORDER_READY" ||
          n.type === "ORDER_DELIVERING" ||
          n.type === "ORDER_DELIVERED" ||
          n.type === "ORDER_IN_DELIVERY" ||
          n.type === "ORDER_COMPLETED" ||
          n.type === "ORDER_CANCELLED" ||
          n.type === "ORDER_REJECTED" ||
          n.type === "PAYMENT_SUCCESS" ||
          n.type === "PAYMENT_FAILED"
      );

    case "system":
      return notifications.filter(
        (n) => n.type === "SYSTEM_NOTIFICATION" || n.type === "SYSTEM" || n.type === "PROMOTION"
      );

    case "all":
    default:
      return notifications;
  }
};

/**
 * Xác định navigation path dựa trên notification
 * @param {Object} notification - Notification object
 * @returns {string} Navigation path
 */
export const getNotificationNavigationPath = (notification) => {
  // Nếu có orderData, chuyển đến tab orders
  if (notification.orderData) {
    const orderCode = notification.orderData.orderCode || notification.orderData.id;
    return `/ho-so?tab=orders${orderCode ? `&order=${orderCode}` : ""}`;
  }

  // Nếu là system notification và có actionUrl
  if (
    (notification.type === "SYSTEM_NOTIFICATION" || notification.type === "SYSTEM") &&
    notification.actionUrl
  ) {
    return notification.actionUrl;
  }

  // Default: về tab orders
  return "/ho-so?tab=orders";
};

/**
 * Validate notification object
 * @param {Object} notification - Notification to validate
 * @returns {boolean} True if valid notification
 */
export const isValidNotification = (notification) => {
  return (
    notification &&
    typeof notification === "object" &&
    notification.id &&
    notification.title &&
    notification.message &&
    notification.timestamp
  );
};

/**
 * Sort notifications by timestamp (newest first)
 * @param {Array} notifications - Array of notifications
 * @returns {Array} Sorted notifications
 */
export const sortNotificationsByTime = (notifications) => {
  if (!Array.isArray(notifications)) return [];

  return [...notifications].sort((a, b) => {
    const timeA = new Date(a.timestamp);
    const timeB = new Date(b.timestamp);
    return timeB - timeA; // Newest first
  });
};

/**
 * Get notification summary info
 * @param {Array} notifications - Array of notifications
 * @returns {Object} Summary object
 */
export const getNotificationSummary = (notifications) => {
  if (!Array.isArray(notifications)) {
    return {
      total: 0,
      unread: 0,
      highPriority: 0,
      orders: 0,
      system: 0,
    };
  }

  return {
    total: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    highPriority: notifications.filter((n) => !n.read && n.priority === "high").length,
    orders: filterNotifications(notifications, "orders").length,
    system: filterNotifications(notifications, "system").length,
  };
};

/**
 * Check if notification is duplicate
 * @param {Object} newNotification - New notification to check
 * @param {Array} existingNotifications - Array of existing notifications
 * @returns {boolean} True if duplicate found
 */
export const isDuplicateNotification = (newNotification, existingNotifications) => {
  if (!Array.isArray(existingNotifications) || !newNotification) {
    return false;
  }

  return existingNotifications.some((existing) => {
    // So sánh theo id nếu có (ưu tiên cao nhất)
    if (newNotification.id && existing.id && newNotification.id === existing.id) {
      return true;
    }

    // So sánh theo orderCode VÀ orderStatus (để phân biệt các update khác nhau của cùng order)
    if (newNotification.orderData?.orderCode && existing.orderData?.orderCode) {
      const isSameOrder = newNotification.orderData.orderCode === existing.orderData.orderCode;
      // Phải cùng orderStatus mới được coi là duplicate
      const isSameStatus =
        newNotification.orderData?.orderStatus === existing.orderData?.orderStatus;
      const isWithinTimeRange =
        Math.abs(new Date(newNotification.timestamp) - new Date(existing.timestamp)) < 60000; // Giảm xuống 1 phút

      if (isSameOrder && isSameStatus && isWithinTimeRange) {
        return true;
      }
      // Nếu cùng orderCode nhưng khác status, KHÔNG phải duplicate
      if (isSameOrder && !isSameStatus) {
        return false;
      }

      return false;
    }

    // So sánh theo title và message KHÔNG quan tâm type (fallback)
    const isSameContent =
      newNotification.title === existing.title && newNotification.message === existing.message;
    const isWithinTimeRange =
      Math.abs(new Date(newNotification.timestamp) - new Date(existing.timestamp)) < 30000; // Giảm xuống 30 giây

    return isSameContent && isWithinTimeRange;
  });
};

/**
 * Remove duplicate notifications from array
 * @param {Array} notifications - Array of notifications
 * @returns {Array} Array without duplicates
 */
export const removeDuplicateNotifications = (notifications) => {
  if (!Array.isArray(notifications)) {
    return [];
  }

  const uniqueNotifications = [];

  for (const notification of notifications) {
    if (!isDuplicateNotification(notification, uniqueNotifications)) {
      uniqueNotifications.push(notification);
    }
  }

  return uniqueNotifications;
};

/**
 * Debug function to analyze duplicate notifications
 * @param {Array} notifications - Array of notifications
 * @returns {Object} Analysis result
 */
export const analyzeNotificationDuplicates = (notifications) => {
  if (!Array.isArray(notifications)) {
    return { duplicates: [], analysis: "Invalid input" };
  }

  const duplicateGroups = [];
  const processed = new Set();

  for (let i = 0; i < notifications.length; i++) {
    if (processed.has(i)) continue;

    const current = notifications[i];
    const group = [{ index: i, notification: current }];

    for (let j = i + 1; j < notifications.length; j++) {
      if (processed.has(j)) continue;

      const other = notifications[j];

      // Check if duplicate
      if (isDuplicateNotification(current, [other])) {
        group.push({ index: j, notification: other });
        processed.add(j);
      }
    }

    if (group.length > 1) {
      duplicateGroups.push({
        key: current.orderData?.orderCode || current.id || `${current.type}_${current.title}`,
        count: group.length,
        notifications: group,
      });
    }

    processed.add(i);
  }

  return {
    total: notifications.length,
    duplicateGroups: duplicateGroups.length,
    duplicates: duplicateGroups,
    analysis: `Found ${duplicateGroups.length} groups of duplicates out of ${notifications.length} total notifications`,
  };
};
