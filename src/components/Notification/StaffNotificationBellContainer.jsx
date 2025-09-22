import React from "react";
import { useStaffNotifications } from "../../hooks/useStaffNotifications";
import StaffNotificationBell from "../../pages/staff/util/StaffNotificationBell";

/**
 * Container component cho StaffNotificationBell
 * Kết nối với useStaffNotifications hook để quản lý localStorage và API sync
 */
const StaffNotificationBellContainer = ({
  onNotificationClick,
  onRefreshNotifications,
  className,
  ...otherProps
}) => {
  const {
    // State
    notifications,
    unreadCount,
    highPriorityUnreadCount,
    isShaking,
    audioEnabled,
    loading,
    forceUpdate, // Add forceUpdate for debugging

    // Actions
    addWebSocketNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    loadNotificationsFromAPI,
    requestNotificationPermission,
    toggleAudio,
  } = useStaffNotifications();

  // Handle refresh notifications
  const handleRefreshNotifications = async () => {
    await loadNotificationsFromAPI();
    if (onRefreshNotifications) {
      onRefreshNotifications();
    }
  };

  return (
    <StaffNotificationBell
      key={`staff-notification-${forceUpdate}`} // Force re-render when forceUpdate changes
      notifications={notifications}
      unreadCount={unreadCount}
      highPriorityUnreadCount={highPriorityUnreadCount}
      isShaking={isShaking}
      audioEnabled={audioEnabled}
      loading={loading}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onRemoveNotification={removeNotification}
      onClearAll={clearAll}
      onToggleAudio={toggleAudio}
      onRequestPermission={requestNotificationPermission}
      onRefreshNotifications={handleRefreshNotifications}
      onNotificationClick={onNotificationClick}
      className={className}
      {...otherProps}
    />
  );
};

export default StaffNotificationBellContainer;
