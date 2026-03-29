import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import {
  createNotificationSound,
  playNotificationSoundByType,
  requestAudioPermission,
  isAudioSupported,
  isAudioEnabled,
} from "../utils/notificationSound";
import {
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  transformNotificationFromWebSocket,
  mergeNotifications,
} from "../services/service/notificationService";
import {
  isDuplicateNotification,
  removeDuplicateNotifications,
  analyzeNotificationDuplicates,
} from "../utils/notificationUtils";

const NOTIFICATION_STORAGE_KEY = "user_notifications";
const MAX_NOTIFICATIONS = 50;
const SHAKE_DURATION = 1200;

export const useUserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [wsNotifications, setWsNotifications] = useState([]); // Thông báo từ WebSocket (tạm thời)
  const [isShaking, setIsShaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ref để track auto-sync timeout
  const autoSyncTimeoutRef = useRef(null);

  // Lấy thông tin user từ Redux store
  const { isLoggedIn: isAuthenticated, user } = useSelector((state) => state.auth);

  // Load notifications từ API khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // User đã login → chỉ load từ API, clear localStorage WebSocket
      clearWebSocketFromLocalStorage();
      loadNotificationsFromAPI();
    } else {
      // Nếu chưa đăng nhập, chỉ load từ localStorage (WebSocket notifications)
      loadNotificationsFromLocalStorage();
    }

    // Check audio permission
    checkAudioPermission();
  }, [isAuthenticated, user?.id]);

  // Clear WebSocket notifications from localStorage when user logs in
  const clearWebSocketFromLocalStorage = () => {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored) {
      try {
        const parsedNotifications = JSON.parse(stored);
        // Filter out WebSocket notifications (có id bắt đầu bằng ws_)
        const nonWebSocketNotifications = parsedNotifications.filter(
          (n) => n.id && !n.id.toString().startsWith("ws_")
        );
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(nonWebSocketNotifications));
      } catch (error) {
        console.error("Error clearing WebSocket notifications:", error);
      }
    }
  };

  // Load notifications từ API backend
  const loadNotificationsFromAPI = async () => {
    setLoading(true);
    try {
      const result = await getUserNotifications();

      if (result.success) {
        if (isAuthenticated) {
          // Với authenticated users: Replace WebSocket notifications bằng API notifications
          setNotifications((currentNotifications) => {
            // Remove tất cả WebSocket notifications khỏi current state
            const nonWebSocketNotifications = currentNotifications.filter(
              (n) => !n.id.toString().startsWith("ws_")
            );

            // Replace bằng API notifications
            const mergedNotifications = mergeNotifications(result.data, nonWebSocketNotifications);
            const cleanedNotifications = removeDuplicateNotifications(mergedNotifications);
            saveNotifications(cleanedNotifications);
            return cleanedNotifications;
          });
        } else {
          // Với non-authenticated users: Merge như bình thường
          setNotifications((currentNotifications) => {
            const mergedNotifications = mergeNotifications(result.data, currentNotifications);
            const cleanedNotifications = removeDuplicateNotifications(mergedNotifications);
            saveNotifications(cleanedNotifications);
            return cleanedNotifications;
          });
        }
      } else {
        console.error("Failed to load notifications:", result.message);
        // Fallback to localStorage nếu API fail
        loadNotificationsFromLocalStorage();
      }
    } catch (error) {
      console.error("Error loading notifications from API:", error);
      // Fallback to localStorage nếu API fail
      loadNotificationsFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // Load notifications từ localStorage (backup)
  const loadNotificationsFromLocalStorage = () => {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored) {
      try {
        const parsedNotifications = JSON.parse(stored);
        // Validate structure và filter out invalid notifications
        const validNotifications = parsedNotifications.filter(
          (n) => n && typeof n === "object" && n.id && n.timestamp
        );

        // Loại bỏ duplicate notifications
        const cleanedNotifications = removeDuplicateNotifications(validNotifications);
        setNotifications(cleanedNotifications);
      } catch (error) {
        console.error("Error loading notifications from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
      }
    }
  };

  // Check if audio is allowed
  const checkAudioPermission = () => {
    const enabled = localStorage.getItem("notification_audio_enabled") === "true";
    const audioSupported = isAudioSupported();
    setAudioEnabled(enabled && audioSupported);
  };

  // Enable/disable audio notifications
  const toggleAudio = useCallback(async (enabled) => {
    if (enabled && isAudioSupported()) {
      // Request audio permission khi enable
      const hasPermission = await requestAudioPermission();
      if (hasPermission) {
        setAudioEnabled(true);
        localStorage.setItem("notification_audio_enabled", "true");
      } else {
        console.warn("Cannot enable audio - permission denied");
        setAudioEnabled(false);
        localStorage.setItem("notification_audio_enabled", "false");
      }
    } else {
      setAudioEnabled(false);
      localStorage.setItem("notification_audio_enabled", "false");
    }
  }, []);

  // Save notifications to localStorage
  const saveNotifications = useCallback(
    (newNotifications) => {
      try {
        if (isAuthenticated) {
          // Với authenticated users: Không lưu WebSocket notifications vào localStorage
          const nonWebSocketNotifications = newNotifications.filter(
            (n) => !n.id.toString().startsWith("ws_")
          );
          localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(nonWebSocketNotifications));
        } else {
          // Với non-authenticated users: Lưu tất cả như bình thường
          localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(newNotifications));
        }
      } catch (error) {
        console.error("Error saving notifications to localStorage:", error);
      }
    },
    [isAuthenticated]
  );

  // Play notification sound using Web Audio API
  const playNotificationSound = useCallback(
    async (notificationType = "ORDER_STATUS_UPDATE") => {
      if (!audioEnabled || !isAudioSupported()) return false;

      try {
        // Sử dụng âm thanh từ notificationSound.js
        let soundPlayed = false;
        if (notificationType === "NEW_ORDER") {
          soundPlayed = await playNotificationSoundByType("NEW_ORDER");
        } else if (
          notificationType === "ORDER_CONFIRMED" ||
          notificationType === "ORDER_IN_DELIVERY" ||
          notificationType === "ORDER_COMPLETED"
        ) {
          soundPlayed = await playNotificationSoundByType("ORDER_STATUS_UPDATE");
        } else if (notificationType === "SYSTEM_NOTIFICATION") {
          soundPlayed = await playNotificationSoundByType("STATS_UPDATE");
        } else {
          // Default notification sound
          soundPlayed = await createNotificationSound();
        }

        return soundPlayed;
      } catch (error) {
        console.error("Cannot play notification sound:", error);
        return false;
      }
    },
    [audioEnabled]
  );

  // Show browser notification
  const showBrowserNotification = useCallback(
    (title, message, options = {}) => {
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          const notification = new Notification(title, {
            body: message,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: "order-notification", // Prevent duplicate notifications
            requireInteraction: false,
            silent: !audioEnabled, // Để Web Audio API handle sound
            ...options,
          });

          // Auto close after 5 seconds
          setTimeout(() => {
            notification.close();
          }, 5000);

          return notification;
        } catch (error) {
          console.log("Browser notification failed:", error);
        }
      }
      return null;
    },
    [audioEnabled]
  );

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }, []);

  // Thêm thông báo mới từ WebSocket
  const addWebSocketNotification = useCallback(
    (wsNotificationData) => {
      console.log("[useUserNotifications] ====== addWebSocketNotification called ======");
      console.log("[useUserNotifications] Input data:", wsNotificationData);
      console.log("[useUserNotifications] isAuthenticated:", isAuthenticated);
      console.log("[useUserNotifications] user?.id:", user?.id);

      const transformedNotification = transformNotificationFromWebSocket(wsNotificationData);
      console.log("[useUserNotifications] Transformed notification:", transformedNotification);

      if (isAuthenticated && user?.id) {
        // ===== USER ĐÃ LOGIN: STRATEGY MỚI =====
        console.log("[useUserNotifications] User is authenticated, using new strategy");

        // 1. KHÔNG thêm vào main notifications
        // 2. CHỈ lưu vào wsNotifications để track
        // 3. CHỈ show UI effects
        // 4. Đợi API sync để update main notifications

        // Cập nhật WebSocket notifications list (cho tracking)
        setWsNotifications((prev) => {
          const updated = [transformedNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
          console.log("[useUserNotifications] Updated wsNotifications count:", updated.length);
          return updated;
        });

        // Show UI effects ngay lập tức
        setNotifications((prev) => {
          console.log("[useUserNotifications] Current notifications count:", prev.length);

          // Kiểm tra duplicate trước
          if (isDuplicateNotification(transformedNotification, prev)) {
            console.log(
              "[useUserNotifications] Duplicate notification detected, skipping UI update"
            );
            return prev;
          }

          // Thêm vào đầu list để show UI, KHÔNG save localStorage
          const updated = [transformedNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
          console.log("[useUserNotifications] New notifications count:", updated.length);
          return updated;
        });

        // Schedule API sync để replace WebSocket với API notification
        // Clear timeout cũ nếu có
        if (autoSyncTimeoutRef.current) {
          clearTimeout(autoSyncTimeoutRef.current);
        }

        autoSyncTimeoutRef.current = setTimeout(() => {
          console.log("[useUserNotifications] Auto-syncing with API...");
          loadNotificationsFromAPI();
          autoSyncTimeoutRef.current = null;
        }, 3000); // 3 giây cho backend xử lý
      } else {
        // ===== USER CHƯA LOGIN: STRATEGY CŨ =====
        console.log("[useUserNotifications] User NOT authenticated, using old strategy");

        setNotifications((prev) => {
          if (isDuplicateNotification(transformedNotification, prev)) {
            console.log("[useUserNotifications] Duplicate notification detected, skipping");
            return prev;
          }

          const updated = [transformedNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
          const cleanedUpdated = removeDuplicateNotifications(updated);

          // Save vào localStorage vì chưa có API
          saveNotifications(cleanedUpdated);
          return cleanedUpdated;
        });

        setWsNotifications((prev) => {
          const updated = [transformedNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
          return updated;
        });
      }

      // Trigger visual effects cho cả 2 cases
      console.log("[useUserNotifications] Triggering visual effects...");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), SHAKE_DURATION);

      // Play sound với type cụ thể
      playNotificationSound(transformedNotification.type);

      // Show browser notification
      showBrowserNotification(transformedNotification.title, transformedNotification.message, {
        data: { orderCode: transformedNotification.orderData?.orderCode },
        actions: transformedNotification.orderData
          ? [{ action: "view", title: "Xem đơn hàng" }]
          : undefined,
      });

      console.log("[useUserNotifications] ====== addWebSocketNotification completed ======");

      return transformedNotification;
    },
    [saveNotifications, playNotificationSound, showBrowserNotification, isAuthenticated, user?.id]
  );

  // Thêm thông báo mới (legacy function for backward compatibility)
  const addNotification = useCallback(
    (notification) => {
      console.log("[useUserNotifications] ====== addNotification called ======");
      console.log("[useUserNotifications] notification input:", notification);
      console.log("[useUserNotifications] isAuthenticated:", isAuthenticated, "userId:", user?.id);

      const newNotification = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: "medium",
        ...notification,
      };

      console.log("[useUserNotifications] newNotification created:", newNotification);

      setNotifications((prev) => {
        console.log("[useUserNotifications] setNotifications prev length:", prev.length);

        // Kiểm tra duplicate với utility function
        if (isDuplicateNotification(newNotification, prev)) {
          console.log(
            "[useUserNotifications] Duplicate notification detected, skipping:",
            newNotification.orderData?.orderCode || newNotification.id
          );
          return prev;
        }

        const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
        console.log("[useUserNotifications] updated notifications length:", updated.length);

        // Clean duplicates từ toàn bộ array
        const cleanedUpdated = removeDuplicateNotifications(updated);
        console.log("[useUserNotifications] cleanedUpdated length:", cleanedUpdated.length);

        saveNotifications(cleanedUpdated);
        return cleanedUpdated;
      });

      // Trigger visual effects
      console.log("[useUserNotifications] Setting isShaking to true");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), SHAKE_DURATION);

      // Play sound với type cụ thể
      playNotificationSound(notification.type);

      // Show browser notification
      showBrowserNotification(notification.title, notification.message, {
        data: { orderCode: notification.orderData?.orderCode },
        actions: notification.orderData ? [{ action: "view", title: "Xem đơn hàng" }] : undefined,
      });

      console.log("[useUserNotifications] ====== addNotification completed ======");
      return newNotification;
    },
    [saveNotifications, playNotificationSound, showBrowserNotification, isAuthenticated, user?.id]
  );

  // Các loại thông báo cụ thể cho đơn hàng
  const addOrderConfirmedNotification = useCallback(
    (orderData) => {
      console.log("[useUserNotifications] ====== addOrderConfirmedNotification called ======");
      console.log("[useUserNotifications] orderData:", orderData);
      const result = addNotification({
        type: "ORDER_CONFIRMED",
        title: orderData.title || "Đơn hàng đã được xác nhận",
        message:
          orderData.message ||
          `Đơn hàng #${
            orderData.orderCode || orderData.id
          } đã được xác nhận và đang được chuẩn bị.`,
        orderData,
        priority: "high",
        category: "order_update",
      });
      console.log("[useUserNotifications] addNotification result:", result);
      return result;
    },
    [addNotification]
  );

  const addOrderInDeliveryNotification = useCallback(
    (orderData) => {
      return addNotification({
        type: "ORDER_IN_DELIVERY",
        title: orderData.title || "Đơn hàng đã chuẩn bị xong",
        message:
          orderData.message ||
          `Đơn hàng #${
            orderData.orderCode || orderData.id
          } đã chuẩn bị xong! Vui lòng chờ nhận hàng.`,
        orderData,
        priority: "high",
        category: "order_update",
      });
    },
    [addNotification]
  );

  const addOrderCompletedNotification = useCallback(
    (orderData) => {
      return addNotification({
        type: "ORDER_COMPLETED",
        title: orderData.title || "Đơn hàng đã hoàn thành",
        message:
          orderData.message ||
          `Đơn hàng #${orderData.orderCode || orderData.id} đã được giao thành công. Cảm ơn bạn!`,
        orderData,
        priority: "medium",
        category: "order_update",
      });
    },
    [addNotification]
  );

  const addOrderCancelledNotification = useCallback(
    (orderData) => {
      return addNotification({
        type: "ORDER_CANCELLED",
        title: orderData.title || "Đơn hàng đã bị hủy",
        message:
          orderData.message ||
          `Đơn hàng #${orderData.orderCode || orderData.id} đã bị hủy. Xin lỗi vì sự bất tiện này.`,
        orderData,
        priority: "high",
        category: "order_update",
      });
    },
    [addNotification]
  );

  // Thông báo hệ thống
  const addSystemNotification = useCallback(
    (notificationData) => {
      return addNotification({
        type: "SYSTEM_NOTIFICATION",
        title: notificationData.title || "Thông báo hệ thống",
        message: notificationData.message || "Có thông báo mới từ hệ thống",
        priority: notificationData.priority || "low",
        category: "system",
      });
    },
    [addNotification]
  );

  // Đánh dấu một thông báo đã đọc
  const markAsRead = useCallback(
    async (notificationId) => {
      // Cập nhật UI ngay lập tức
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
        );
        saveNotifications(updated);
        return updated;
      });

      // Gọi API để sync với backend (nếu user đã đăng nhập)
      if (isAuthenticated && user?.id) {
        try {
          const result = await markNotificationAsRead(notificationId);
          if (!result.success) {
            console.error("Failed to mark notification as read on server:", result.message);
            // Revert UI nếu API thất bại
            setNotifications((prev) => {
              const reverted = prev.map((n) =>
                n.id === notificationId ? { ...n, read: false, readAt: null } : n
              );
              saveNotifications(reverted);
              return reverted;
            });
          } else if (result.data) {
            // Cập nhật state với data thực từ server để đảm bảo đồng bộ
            const serverRead =
              result.data.isRead === true ||
              result.data.is_read === true ||
              result.data.is_read === 1;
            setNotifications((prev) => {
              const updated = prev.map((n) =>
                n.id === notificationId
                  ? { ...n, read: serverRead, readAt: result.data.readAt || n.readAt }
                  : n
              );
              saveNotifications(updated);
              return updated;
            });
          }
        } catch (error) {
          console.error("Error marking notification as read:", error);
        }
      }
    },
    [isAuthenticated, user?.id, saveNotifications]
  );

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = useCallback(async () => {
    // Cập nhật UI ngay lập tức
    setNotifications((prev) => {
      const updated = prev.map((n) => ({
        ...n,
        read: true,
        readAt: n.readAt || new Date().toISOString(),
      }));
      saveNotifications(updated);
      return updated;
    });

    // Gọi API để sync với backend (nếu user đã đăng nhập)
    if (isAuthenticated && user?.id) {
      try {
        const result = await markAllNotificationsAsRead();
        if (!result.success) {
          console.error("Failed to mark all notifications as read on server:", result.message);
        }
        // Reload từ API để đảm bảo trạng thái đồng bộ với server
        await loadNotificationsFromAPI();
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
      }
    }
  }, [isAuthenticated, user?.id, saveNotifications]);

  // Xóa một thông báo
  const removeNotification = useCallback(
    async (notificationId) => {
      // Cập nhật UI ngay lập tức
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== notificationId);
        saveNotifications(updated);
        return updated;
      });

      // Gọi API để xóa trên server (nếu user đã đăng nhập)
      if (isAuthenticated && user?.id) {
        try {
          const result = await deleteNotification(notificationId);
          if (!result.success) {
            console.error("Failed to delete notification on server:", result.message);
          }
        } catch (error) {
          console.error("Error deleting notification:", error);
        }
      }
    },
    [isAuthenticated, user?.id, saveNotifications]
  );

  // Xóa tất cả thông báo
  const clearAll = useCallback(async () => {
    // Cập nhật UI ngay lập tức
    setNotifications([]);
    localStorage.removeItem(NOTIFICATION_STORAGE_KEY);

    // Gọi API để xóa trên server (nếu user đã đăng nhập)
    if (isAuthenticated && user?.id) {
      try {
        const result = await deleteAllNotifications();
        if (!result.success) {
          console.error("Failed to delete all notifications on server:", result.message);
        }
      } catch (error) {
        console.error("Error deleting all notifications:", error);
      }
    }
  }, [isAuthenticated, user?.id]);

  // Xóa thông báo đã đọc cũ (hơn 7 ngày)
  const cleanupOldNotifications = useCallback(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    setNotifications((prev) => {
      const updated = prev.filter((n) => {
        const notificationDate = new Date(n.timestamp);
        return !n.read || notificationDate > sevenDaysAgo;
      });

      if (updated.length !== prev.length) {
        saveNotifications(updated);
      }

      return updated;
    });
  }, [saveNotifications]);

  // Auto cleanup mỗi khi component mount
  useEffect(() => {
    cleanupOldNotifications();

    // Set up periodic cleanup (mỗi giờ)
    const cleanupInterval = setInterval(cleanupOldNotifications, 60 * 60 * 1000);

    return () => clearInterval(cleanupInterval);
  }, [cleanupOldNotifications]);

  // Computed values
  const unreadCount = notifications.filter((n) => !n.read).length;
  const highPriorityUnreadCount = notifications.filter(
    (n) => !n.read && n.priority === "high"
  ).length;

  // Get notifications by category
  const getNotificationsByCategory = useCallback(
    (category) => {
      return notifications.filter((n) => n.category === category);
    },
    [notifications]
  );

  // Get recent notifications (last 24 hours)
  const getRecentNotifications = useCallback(() => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return notifications.filter((n) => new Date(n.timestamp) > oneDayAgo);
  }, [notifications]);

  // Test audio function
  const testAudio = useCallback(async () => {
    if (audioEnabled) {
      await createNotificationSound();
    }
  }, [audioEnabled]);

  return {
    // State
    notifications,
    unreadCount,
    highPriorityUnreadCount,
    isShaking,
    audioEnabled,
    loading,

    // Actions
    addNotification, // Legacy function
    addWebSocketNotification, // New function for WebSocket
    addOrderConfirmedNotification,
    addOrderInDeliveryNotification,
    addOrderCompletedNotification,
    addOrderCancelledNotification,
    addSystemNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    cleanupOldNotifications,
    loadNotificationsFromAPI, // Manual reload from API

    // Utility functions
    getNotificationsByCategory,
    getRecentNotifications,
    requestNotificationPermission,
    toggleAudio,
    testAudio,

    // Manual shake trigger (for testing)
    triggerShake: () => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), SHAKE_DURATION);
    },

    // Audio status
    isAudioSupported: isAudioSupported(),
    isAudioActive: isAudioEnabled(),

    // Debug functions
    analyzeNotificationDuplicates: () => analyzeNotificationDuplicates(notifications),
    debugNotifications: () => {
      console.log("Current notifications:", notifications);
      console.log("WebSocket notifications:", wsNotifications);
      const analysis = analyzeNotificationDuplicates(notifications);
      console.log("Duplicate analysis:", analysis);
      return analysis;
    },

    // Force sync notifications after WebSocket event (when authenticated)
    syncNotificationsAfterWebSocket: async () => {
      if (isAuthenticated && user?.id) {
        console.log("🔄 Force syncing notifications after WebSocket event...");
        setTimeout(() => {
          loadNotificationsFromAPI();
        }, 2000); // Wait 2 seconds for backend to process
      }
    },
  };

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (autoSyncTimeoutRef.current) {
        clearTimeout(autoSyncTimeoutRef.current);
      }
    };
  }, []);
};
