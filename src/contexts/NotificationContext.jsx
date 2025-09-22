import React, { createContext, useContext, useEffect } from "react";
import { useUserNotifications } from "../hooks/useUserNotifications";

const NotificationContext = createContext(null);

/**
 * Provider cung cấp thông báo tập trung cho toàn bộ ứng dụng
 * Đảm bảo đồng bộ dữ liệu giữa NotificationBell và NotificationsTab
 */
export const NotificationProvider = ({ children }) => {
  const notificationHook = useUserNotifications();

  const contextValue = {
    // State từ hook
    notifications: notificationHook.notifications,
    unreadCount: notificationHook.unreadCount,
    highPriorityUnreadCount: notificationHook.highPriorityUnreadCount,
    loading: notificationHook.loading,
    audioEnabled: notificationHook.audioEnabled,
    isShaking: notificationHook.isShaking,

    // Actions từ hook
    markAsRead: notificationHook.markAsRead,
    markAllAsRead: notificationHook.markAllAsRead,
    removeNotification: notificationHook.removeNotification,
    clearAll: notificationHook.clearAll,
    toggleAudio: notificationHook.toggleAudio,
    loadNotificationsFromAPI: notificationHook.loadNotificationsFromAPI,

    // Notification creators
    addOrderConfirmedNotification: notificationHook.addOrderConfirmedNotification,
    addOrderInDeliveryNotification: notificationHook.addOrderInDeliveryNotification,
    addOrderCompletedNotification: notificationHook.addOrderCompletedNotification,
    addOrderCancelledNotification: notificationHook.addOrderCancelledNotification,
    addSystemNotification: notificationHook.addSystemNotification,
    addWebSocketNotification: notificationHook.addWebSocketNotification,

    // Utility functions
    requestNotificationPermission: notificationHook.requestNotificationPermission,
    testAudio: notificationHook.testAudio,
    triggerShake: notificationHook.triggerShake,
  };

  return (
    <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>
  );
};

/**
 * Hook để sử dụng notification context
 * Đảm bảo component được sử dụng trong NotificationProvider
 */
export const useNotificationContext = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider. " +
        "Please wrap your component with <NotificationProvider>."
    );
  }

  return context;
};

/**
 * Hook tối ưu cho NotificationBell
 * Chỉ return những props cần thiết cho component
 */
export const useNotificationBell = () => {
  const context = useNotificationContext();

  return {
    // Props cho NotificationBell component
    notifications: context.notifications,
    unreadCount: context.unreadCount,
    highPriorityUnreadCount: context.highPriorityUnreadCount,
    isShaking: context.isShaking,
    audioEnabled: context.audioEnabled,
    loading: context.loading,

    // Callbacks cho NotificationBell
    onMarkAsRead: context.markAsRead,
    onMarkAllAsRead: context.markAllAsRead,
    onRemoveNotification: context.removeNotification,
    onClearAll: context.clearAll,
    onToggleAudio: context.toggleAudio,
    onRequestPermission: context.requestNotificationPermission,
    onRefreshNotifications: context.loadNotificationsFromAPI,
  };
};

/**
 * Hook tối ưu cho NotificationsTab
 * Return tất cả functionality cần thiết
 */
export const useNotificationsTab = () => {
  const context = useNotificationContext();

  return {
    // State
    notifications: context.notifications,
    unreadCount: context.unreadCount,
    highPriorityUnreadCount: context.highPriorityUnreadCount,
    loading: context.loading,
    audioEnabled: context.audioEnabled,

    // Actions
    markAsRead: context.markAsRead,
    markAllAsRead: context.markAllAsRead,
    removeNotification: context.removeNotification,
    clearAll: context.clearAll,
    toggleAudio: context.toggleAudio,
    loadNotificationsFromAPI: context.loadNotificationsFromAPI,
  };
};

export default NotificationContext;
