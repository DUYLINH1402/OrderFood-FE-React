import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  createNotificationSound,
  playNotificationSoundByType,
  requestAudioPermission,
  isAudioSupported,
  isAudioEnabled,
} from "../utils/notificationSound";
import {
  getStaffNotifications,
  getStaffUnreadCount,
  markStaffNotificationAsRead,
  markAllStaffNotificationsAsRead,
  deleteStaffNotification,
  deleteAllStaffNotifications,
  transformNotificationFromWebSocket,
  mergeNotifications,
} from "../services/service/notificationService";

const STAFF_NOTIFICATION_STORAGE_KEY = "staff_notifications";
const MAX_NOTIFICATIONS = 50;
const SHAKE_DURATION = 1200;

export const useStaffNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [wsNotifications, setWsNotifications] = useState([]); // Thông báo từ WebSocket (tạm thời)
  const [isShaking, setIsShaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render trigger

  // Ref để track auto-sync timeout
  const autoSyncTimeoutRef = useRef(null);

  // Lấy thông tin staff từ Redux store
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Clear WebSocket notifications từ localStorage khi staff đăng nhập
  const clearWebSocketFromLocalStorage = () => {
    const stored = localStorage.getItem(STAFF_NOTIFICATION_STORAGE_KEY);
    if (stored) {
      try {
        const parsedNotifications = JSON.parse(stored);
        // Chỉ giữ lại các notification không phải từ WebSocket
        const nonWebSocketNotifications = parsedNotifications.filter(
          (n) =>
            n &&
            typeof n === "object" &&
            n.id &&
            !n.id.toString().startsWith("staff_") &&
            !n.id.toString().startsWith("ws_")
        );
        localStorage.setItem(
          STAFF_NOTIFICATION_STORAGE_KEY,
          JSON.stringify(nonWebSocketNotifications)
        );
      } catch (error) {
        console.error("Error clearing WebSocket notifications from localStorage:", error);
      }
    }
  };

  // Load notifications từ API khi staff đăng nhập
  useEffect(() => {
    // Lấy thông tin từ localStorage thay vì chỉ dựa vào Redux
    const token = localStorage.getItem("accessToken");
    const userString = localStorage.getItem("user");
    let userData = null;
    try {
      userData = userString ? JSON.parse(userString) : null;
    } catch (e) {
      console.error("Error parsing user data:", e);
    }

    const hasValidAuth =
      token &&
      userData &&
      (userData.roleCode === "ROLE_STAFF" || userData.roleCodes?.includes("ROLE_STAFF"));

    if (hasValidAuth) {
      // Staff đã login → chỉ load từ API, clear localStorage WebSocket
      clearWebSocketFromLocalStorage();
      loadNotificationsFromAPI();
    } else {
      // Nếu chưa đăng nhập hoặc không phải staff, chỉ load từ localStorage (WebSocket notifications)
      loadNotificationsFromLocalStorage();
    }

    // Check audio permission
    checkAudioPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Save notifications to localStorage
  const saveNotifications = useCallback((newNotifications) => {
    try {
      // Lấy thông tin staff từ localStorage
      const token = localStorage.getItem("accessToken");
      const userString = localStorage.getItem("user");
      let userData = null;
      try {
        userData = userString ? JSON.parse(userString) : null;
      } catch (e) {
        console.error("Error parsing user data:", e);
      }

      const hasValidAuth =
        token &&
        userData &&
        (userData.roleCode === "ROLE_STAFF" || userData.roleCodes?.includes("ROLE_STAFF"));

      if (hasValidAuth) {
        // Staff đã đăng nhập: chỉ lưu API notifications, không lưu WebSocket notifications
        const nonWebSocketNotifications = newNotifications.filter(
          (n) =>
            n &&
            typeof n === "object" &&
            n.id &&
            !n.id.toString().startsWith("staff_") &&
            !n.id.toString().startsWith("ws_")
        );
        localStorage.setItem(
          STAFF_NOTIFICATION_STORAGE_KEY,
          JSON.stringify(nonWebSocketNotifications)
        );
      } else {
        // Staff chưa đăng nhập: lưu tất cả (bao gồm WebSocket notifications)
        localStorage.setItem(STAFF_NOTIFICATION_STORAGE_KEY, JSON.stringify(newNotifications));
      }
    } catch (error) {
      console.error("Error saving staff notifications to localStorage:", error);
    }
  }, []);

  // Load notifications từ localStorage (backup)
  const loadNotificationsFromLocalStorage = useCallback(() => {
    const stored = localStorage.getItem(STAFF_NOTIFICATION_STORAGE_KEY);
    if (stored) {
      try {
        const parsedNotifications = JSON.parse(stored);
        // Validate structure và filter out invalid notifications
        const validNotifications = parsedNotifications.filter(
          (n) => n && typeof n === "object" && n.id && n.timestamp
        );
        setNotifications(validNotifications);
      } catch (error) {
        console.error("Error loading staff notifications from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem(STAFF_NOTIFICATION_STORAGE_KEY);
      }
    }
  }, []);

  // Load notifications từ API backend
  const loadNotificationsFromAPI = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getStaffNotifications();

      if (result.success) {
        const apiNotifications = result.data || [];
        console.log("📡 API Notifications loaded:", apiNotifications.length);

        // MERGE với WebSocket notifications thay vì replace
        setNotifications((currentNotifications) => {
          // Lọc ra WebSocket notifications hiện tại
          const currentWebSocketNotifications = currentNotifications.filter(
            (n) =>
              n.id && (n.id.toString().startsWith("staff_") || n.id.toString().startsWith("ws_"))
          );

          console.log("� Merging API with current WebSocket notifications:", {
            apiCount: apiNotifications.length,
            wsCount: currentWebSocketNotifications.length,
            totalCurrent: currentNotifications.length,
          });

          // Merge: WebSocket notifications ở trên, API notifications ở dưới
          const mergedNotifications = [...currentWebSocketNotifications, ...apiNotifications].slice(
            0,
            MAX_NOTIFICATIONS
          );

          console.log("✅ Merged notifications:", {
            totalCount: mergedNotifications.length,
            firstIsWebSocket:
              mergedNotifications[0]?.id?.toString().startsWith("ws_") ||
              mergedNotifications[0]?.id?.toString().startsWith("staff_"),
          });

          return mergedNotifications;
        });

        // Lưu vào localStorage (chỉ API notifications)
        const nonWebSocketNotifications = apiNotifications.filter(
          (n) =>
            n &&
            typeof n === "object" &&
            n.id &&
            !n.id.toString().startsWith("staff_") &&
            !n.id.toString().startsWith("ws_")
        );
        saveNotifications(nonWebSocketNotifications);
      } else {
        console.error("Failed to load staff notifications:", result.message);
        // Fallback to localStorage nếu API fail
        loadNotificationsFromLocalStorage();
      }
    } catch (error) {
      console.error("Error loading staff notifications from API:", error);
      // Fallback to localStorage nếu API fail
      loadNotificationsFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, [saveNotifications, loadNotificationsFromLocalStorage]); // Check if audio is allowed
  const checkAudioPermission = () => {
    const enabled = localStorage.getItem("staff_notification_audio_enabled") === "true";
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
        localStorage.setItem("staff_notification_audio_enabled", "true");
      } else {
        console.warn("Cannot enable audio - permission denied");
        setAudioEnabled(false);
        localStorage.setItem("staff_notification_audio_enabled", "false");
      }
    } else {
      setAudioEnabled(false);
      localStorage.setItem("staff_notification_audio_enabled", "false");
    }
  }, []); // Play notification sound using Web Audio API
  const playNotificationSound = useCallback(
    async (notificationType = "NEW_ORDER") => {
      if (!audioEnabled || !isAudioSupported()) return false;

      try {
        // Sử dụng âm thanh từ notificationSound.js cho staff
        let soundPlayed = false;
        if (notificationType === "NEW_ORDER" || notificationType === "ORDER_PENDING") {
          soundPlayed = await playNotificationSoundByType("NEW_ORDER");
        } else if (
          notificationType === "ORDER_CONFIRMED" ||
          notificationType === "ORDER_PROCESSING" ||
          notificationType === "ORDER_DELIVERING" ||
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
        console.error("Cannot play staff notification sound:", error);
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
            tag: "staff-order-notification", // Prevent duplicate notifications
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
      const transformedNotification = transformNotificationFromWebSocket(wsNotificationData);

      // Lấy thông tin staff từ localStorage để kiểm tra authentication
      const token = localStorage.getItem("accessToken");
      const userString = localStorage.getItem("user");
      let userData = null;
      try {
        userData = userString ? JSON.parse(userString) : null;
      } catch (e) {
        console.error("Error parsing user data:", e);
      }

      const hasValidAuth =
        token &&
        userData &&
        (userData.roleCode === "ROLE_STAFF" || userData.roleCodes?.includes("ROLE_STAFF"));

      console.log("🔐 Auth check:", { hasValidAuth, userRole: userData?.roleCode });

      if (hasValidAuth) {
        // ===== STAFF ĐÃ LOGIN: STRATEGY MỚI =====
        // 1. Cập nhật WebSocket notifications list (cho tracking)
        setWsNotifications((prev) => {
          const updated = [transformedNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
          return updated;
        });

        // 2. Thêm vào main notifications ngay lập tức để UI cập nhật
        setNotifications((prev) => {
          console.log("📝 Before adding notification:", {
            prevLength: prev.length,
            newNotificationId: transformedNotification.id,
            newNotificationRead: transformedNotification.read,
            newNotificationTitle: transformedNotification.title,
          });

          // Kiểm tra duplicate
          const isDuplicate = prev.some(
            (n) =>
              (n.orderData?.orderCode &&
                transformedNotification.orderData?.orderCode &&
                n.orderData.orderCode === transformedNotification.orderData.orderCode &&
                n.type === transformedNotification.type) ||
              n.id === transformedNotification.id
          );

          if (isDuplicate) {
            console.log("⚠️ Duplicate notification detected, skipping");
            return prev;
          }

          // Đảm bảo notification mới là chưa đọc
          const newNotification = {
            ...transformedNotification,
            read: false, // Force chưa đọc để UI hiển thị
            timestamp: transformedNotification.timestamp || new Date().toISOString(),
          };

          const withNewNotification = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);

          console.log("✅ After adding notification:", {
            totalLength: withNewNotification.length,
            unreadCount: withNewNotification.filter((n) => !n.read).length,
            firstNotificationRead: withNewNotification[0]?.read,
            firstNotificationTitle: withNewNotification[0]?.title,
          });

          return withNewNotification;
        });

        // 3. Force re-render ngay lập tức
        setForceUpdate((prev) => {
          const newValue = prev + 1;
          console.log("🔄 Force update triggered:", newValue);
          return newValue;
        });

        // 4. Trigger visual effects ngay lập tức
        setIsShaking(true);
        console.log("📳 Shaking triggered");
        setTimeout(() => {
          setIsShaking(false);
          console.log("📳 Shaking stopped");
        }, SHAKE_DURATION);

        // 5. KHÔNG auto-sync với API để tránh ghi đè WebSocket notification
        // API sync sẽ được thực hiện khi user manually refresh hoặc reload page
        console.log("⏰ Skipping auto-sync to preserve WebSocket notification in UI");

        // Clear existing auto-sync timeout if any
        if (autoSyncTimeoutRef.current) {
          clearTimeout(autoSyncTimeoutRef.current);
          autoSyncTimeoutRef.current = null;
        }
      } else {
        // ===== STAFF CHƯA LOGIN: STRATEGY CŨ =====
        // Thêm vào danh sách WebSocket notifications
        setWsNotifications((prev) => {
          const updated = [transformedNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
          return updated;
        });

        // Thêm vào main notifications và lưu localStorage
        setNotifications((prev) => {
          const updated = [transformedNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
          saveNotifications(updated);
          return updated;
        });

        // Trigger visual effects ngay lập tức cho staff chưa login
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), SHAKE_DURATION);
      }

      // Play sound và show browser notification cho cả 2 cases
      playNotificationSound(transformedNotification.type);

      // Show browser notification
      showBrowserNotification(transformedNotification.title, transformedNotification.message, {
        data: { orderCode: transformedNotification.orderData?.orderCode },
        actions: transformedNotification.orderData
          ? [{ action: "view", title: "Xem đơn hàng" }]
          : undefined,
      });

      return transformedNotification;
    },
    [saveNotifications, playNotificationSound, showBrowserNotification, loadNotificationsFromAPI]
  );

  // Thêm thông báo mới (legacy function for backward compatibility)
  const addNotification = useCallback(
    (notification) => {
      const newNotification = {
        id: `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: "medium",
        ...notification,
      };

      setNotifications((prev) => {
        // Kiểm tra duplicate dựa trên orderCode hoặc type + timestamp gần nhau
        const isDuplicate = prev.some(
          (n) =>
            n.orderData?.orderCode &&
            newNotification.orderData?.orderCode === n.orderData.orderCode &&
            n.type === newNotification.type &&
            Math.abs(
              new Date(n.timestamp).getTime() - new Date(newNotification.timestamp).getTime()
            ) < 5000
        );

        if (isDuplicate) {
          return prev;
        }
        const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
        saveNotifications(updated);
        return updated;
      });

      // Trigger visual effects
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), SHAKE_DURATION);

      // Play sound với type cụ thể
      playNotificationSound(notification.type);

      // Show browser notification
      showBrowserNotification(notification.title, notification.message, {
        data: { orderCode: notification.orderData?.orderCode },
        actions: notification.orderData ? [{ action: "view", title: "Xem đơn hàng" }] : undefined,
      });

      return newNotification;
    },
    [saveNotifications, playNotificationSound, showBrowserNotification]
  );

  // Các loại thông báo cụ thể cho đơn hàng (Staff specific)
  const addNewOrderNotification = useCallback(
    (orderData) => {
      return addNotification({
        type: "NEW_ORDER",
        title: "Đơn hàng mới",
        message: `Có đơn hàng mới #${orderData.orderCode || orderData.id} cần xử lý từ khách hàng ${
          orderData.customerName || "N/A"
        }.`,
        orderData,
        priority: "high",
        category: "new_order",
      });
    },
    [addNotification]
  );

  const addOrderStatusNotification = useCallback(
    (orderData, status) => {
      const statusMessages = {
        PROCESSING: "Đơn hàng đang được xử lý",
        CONFIRMED: "Đơn hàng đã được xác nhận",
        DELIVERING: "Đơn hàng đang giao",
        COMPLETED: "Đơn hàng đã hoàn thành",
        CANCELLED: "Đơn hàng đã bị hủy",
      };

      return addNotification({
        type: `ORDER_${status}`,
        title: statusMessages[status] || "Cập nhật đơn hàng",
        message: `Đơn hàng #${orderData.orderCode || orderData.id} - ${
          statusMessages[status] || "Trạng thái đã thay đổi"
        }.`,
        orderData: { ...orderData, orderStatus: status },
        priority: status === "NEW_ORDER" || status === "CANCELLED" ? "high" : "medium",
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
        message: notificationData.message,
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

      // Cập nhật wsNotifications nếu là WebSocket notification
      setWsNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
        )
      );

      // Gọi API để sync với backend chỉ khi là DB notification (không phải WebSocket notification)
      const isWebSocketNotification =
        notificationId.toString().startsWith("staff_") ||
        notificationId.toString().startsWith("ws_");

      // Lấy thông tin user từ localStorage để đảm bảo có đầy đủ thông tin
      const token = localStorage.getItem("accessToken");
      const userString = localStorage.getItem("user");
      let userData = null;
      try {
        userData = userString ? JSON.parse(userString) : null;
      } catch (e) {
        console.error("Error parsing user data:", e);
      }

      const hasValidAuth =
        token &&
        userData &&
        (userData.roleCode === "ROLE_STAFF" || userData.roleCodes?.includes("ROLE_STAFF"));

      if (!isWebSocketNotification && hasValidAuth) {
        try {
          const result = await markStaffNotificationAsRead(notificationId);
        } catch (error) {
          console.error(" Error marking staff notification as read:", error);
        }
      } else {
        console.log(" Skipping API call - Reason:", {
          isWebSocketNotification: isWebSocketNotification,
          hasValidAuth: hasValidAuth,
          reason: isWebSocketNotification
            ? "WebSocket notification"
            : "Not authenticated or not staff",
        });
      }
    },
    [saveNotifications]
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

    // Cập nhật wsNotifications
    setWsNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: true,
        readAt: n.readAt || new Date().toISOString(),
      }))
    );

    // Gọi API để sync với backend (chỉ cho DB notifications, WebSocket notifications chỉ lưu local)
    const token = localStorage.getItem("accessToken");
    const userString = localStorage.getItem("user");
    let userData = null;
    try {
      userData = userString ? JSON.parse(userString) : null;
    } catch (e) {
      console.error("Error parsing user data:", e);
    }

    const hasValidAuth =
      token &&
      userData &&
      (userData.roleCode === "ROLE_STAFF" || userData.roleCodes?.includes("ROLE_STAFF"));

    if (hasValidAuth) {
      try {
        const result = await markAllStaffNotificationsAsRead();
        if (!result.success) {
          console.error(
            "Failed to mark all staff notifications as read on server:",
            result.message
          );
        }
      } catch (error) {
        console.error("Error marking all staff notifications as read:", error);
      }
    }
  }, [saveNotifications]);

  // Xóa một thông báo
  const removeNotification = useCallback(
    async (notificationId) => {
      // Cập nhật UI ngay lập tức
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== notificationId);
        saveNotifications(updated);
        return updated;
      });

      // Cập nhật wsNotifications nếu là WebSocket notification
      setWsNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      // Gọi API để xóa trên server chỉ khi là DB notification (không phải WebSocket notification)
      const isWebSocketNotification =
        notificationId.toString().startsWith("staff_") ||
        notificationId.toString().startsWith("ws_");

      // Lấy thông tin user từ localStorage để đảm bảo có đầy đủ thông tin
      const token = localStorage.getItem("accessToken");
      const userString = localStorage.getItem("user");
      let userData = null;
      try {
        userData = userString ? JSON.parse(userString) : null;
      } catch (e) {
        console.error("Error parsing user data:", e);
      }

      const hasValidAuth =
        token &&
        userData &&
        (userData.roleCode === "ROLE_STAFF" || userData.roleCodes?.includes("ROLE_STAFF"));

      if (!isWebSocketNotification && hasValidAuth) {
        try {
          const result = await deleteStaffNotification(notificationId);
          if (!result.success) {
            // Rollback UI nếu API fail
            setTimeout(() => {
              loadNotificationsFromAPI();
            }, 1000);
          } else {
            console.log(" Successfully deleted notification on server");
          }
        } catch (error) {
          console.error(" Error deleting staff notification:", error);
          // Rollback UI nếu API fail
          setTimeout(() => {
            loadNotificationsFromAPI();
          }, 1000);
        }
      } else {
        console.log("Skipping API call - Reason:", {
          isWebSocketNotification: isWebSocketNotification,
          hasValidAuth: hasValidAuth,
          reason: isWebSocketNotification
            ? "WebSocket notification"
            : "Not authenticated or not staff",
        });
      }
    },
    [saveNotifications, loadNotificationsFromAPI]
  );

  // Xóa tất cả thông báo
  const clearAll = useCallback(async () => {
    // Backup dữ liệu hiện tại để rollback nếu cần
    const currentNotifications = notifications;
    const currentWsNotifications = wsNotifications;

    // Cập nhật UI ngay lập tức
    setNotifications([]);
    setWsNotifications([]);
    localStorage.removeItem(STAFF_NOTIFICATION_STORAGE_KEY);

    // Gọi API để xóa các DB notifications trên server (nếu staff đã đăng nhập)
    const token = localStorage.getItem("accessToken");
    const userString = localStorage.getItem("user");
    let userData = null;
    try {
      userData = userString ? JSON.parse(userString) : null;
    } catch (e) {
      console.error("Error parsing user data:", e);
    }

    const hasValidAuth =
      token &&
      userData &&
      (userData.roleCode === "ROLE_STAFF" || userData.roleCodes?.includes("ROLE_STAFF"));

    if (hasValidAuth) {
      try {
        const result = await deleteAllStaffNotifications();
        if (!result.success) {
          console.error("Failed to delete all staff notifications on server:", result.message);
          // Rollback UI nếu API fail
          setNotifications(currentNotifications);
          setWsNotifications(currentWsNotifications);
          saveNotifications(currentNotifications);
        }
      } catch (error) {
        console.error("Error deleting all staff notifications:", error);
        // Rollback UI nếu API fail
        setNotifications(currentNotifications);
        setWsNotifications(currentWsNotifications);
        saveNotifications(currentNotifications);
      }
    }
  }, [notifications, wsNotifications, saveNotifications]);

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

  // Computed values - sử dụng useMemo để tối ưu performance
  const unreadCount = useMemo(() => {
    const count = notifications.filter((n) => !n.read).length;
    console.log("🧮 Unread count computed:", {
      count,
      totalNotifications: notifications.length,
      forceUpdate,
    });
    return count;
  }, [notifications, forceUpdate]);

  const highPriorityUnreadCount = useMemo(() => {
    const count = notifications.filter((n) => !n.read && n.priority === "high").length;
    console.log("🔥 High priority unread count computed:", { count, forceUpdate });
    return count;
  }, [notifications, forceUpdate]);

  // Debug effect để track state changes
  useEffect(() => {
    console.log("🔔 StaffNotifications State Update:", {
      notificationsCount: notifications.length,
      unreadCount,
      highPriorityUnreadCount,
      isShaking,
      firstNotification: notifications[0]?.title || "None",
      lastUpdated: new Date().toLocaleTimeString(),
      allNotificationIds: notifications.map((n) => n.id).slice(0, 3), // Show first 3 IDs
    });
  }, [notifications, unreadCount, highPriorityUnreadCount, isShaking]);

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
    addNewOrderNotification,
    addOrderStatusNotification,
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

    // Force update trigger for debugging
    forceUpdate,

    // Force sync notifications after WebSocket event (when authenticated)
    syncNotificationsAfterWebSocket: async () => {
      const token = localStorage.getItem("accessToken");
      const userString = localStorage.getItem("user");
      let userData = null;
      try {
        userData = userString ? JSON.parse(userString) : null;
      } catch (e) {
        console.error("Error parsing user data:", e);
      }

      const hasValidAuth =
        token &&
        userData &&
        (userData.roleCode === "ROLE_STAFF" || userData.roleCodes?.includes("ROLE_STAFF"));

      if (hasValidAuth) {
        await loadNotificationsFromAPI();
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
