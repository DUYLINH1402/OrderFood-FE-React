import React, { useState, useEffect } from "react";
import { Badge, Dropdown, Button, Typography, Tooltip, Empty, Spin } from "antd";
import {
  Bell,
  BellRing,
  Clock,
  CheckCheck,
  Trash2,
  Settings,
  VolumeX,
  Volume2,
  Clipboard,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  ChefHat,
  Package,
  Truck,
  XCircle,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useConfirm } from "../ConfirmModal";
// Import utility functions
import {
  getNotificationIconConfig,
  formatTimeAgo,
  getNotificationNavigationPath,
  isValidNotification,
  sortNotificationsByTime,
  getPriorityColor,
} from "../../utils/notificationUtils";

const { Text } = Typography;

const NotificationBell = ({
  notifications = [],
  unreadCount = 0,
  highPriorityUnreadCount = 0,
  isShaking = false,
  audioEnabled = false,
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemoveNotification,
  onClearAll,
  onToggleAudio,
  onRequestPermission,
  onRefreshNotifications,
}) => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [isAnimating, setIsAnimating] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Animation effect khi có thông báo mới - chỉ shake khi thực sự có thông báo chưa đọc
  useEffect(() => {
    if (isShaking && unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1200);
      return () => clearTimeout(timer);
    } else {
      // Dừng animation khi không còn thông báo chưa đọc
      setIsAnimating(false);
    }
  }, [isShaking, unreadCount]);

  // Khóa scroll khi dropdown mở (áp dụng cho tất cả thiết bị)
  useEffect(() => {
    if (dropdownVisible) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      // Lấy độ rộng scrollbar
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Khóa scroll và compensate cho scrollbar để tránh layout shift
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [dropdownVisible]);

  const getNotificationIcon = (type, orderStatus) => {
    const baseClasses =
      "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg";

    // Sử dụng utility function chung
    const config = getNotificationIconConfig(type, orderStatus);

    // Map iconType string to component
    const iconComponents = {
      CheckCircle,
      ChefHat,
      Package,
      Truck,
      XCircle,
      AlertTriangle,
      Clock,
      Settings,
      Bell,
      ShoppingCart,
    };

    const IconComponent = iconComponents[config.iconType] || Bell;

    return (
      <div className={`${baseClasses} ${config.gradientBg}`}>
        <IconComponent size={20} className="shrink-0" />
      </div>
    );
  };

  // Xử lý xóa từng thông báo
  const handleRemoveNotification = (notificationId, e) => {
    e.stopPropagation();
    // Đóng dropdown trước khi hiện modal
    setDropdownVisible(false);

    confirm({
      title: "Xóa thông báo",
      content: "Bạn có chắc chắn muốn xóa thông báo này không?",
      onOk: () => {
        if (onRemoveNotification) {
          onRemoveNotification(notificationId);
        }
      },
    });
  };

  const handleNotificationClick = (notification) => {
    // Đánh dấu đã đọc nếu chưa đọc
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    // Đóng dropdown
    setDropdownVisible(false);

    // Sử dụng utility function để xác định navigation path
    const path = getNotificationNavigationPath(notification);
    navigate(path);
  };

  // Xử lý xóa tất cả thông báo
  const handleClearAll = (e) => {
    e.stopPropagation();
    // Đóng dropdown trước khi hiện modal
    setDropdownVisible(false);
    confirm({
      title: "Xóa tất cả thông báo",
      content:
        "Bạn có chắc chắn muốn xóa tất cả thông báo không? Hành động này không thể hoàn tác.",
      onOk: () => {
        if (onClearAll) {
          onClearAll();
        }
      },
    });
  };

  // Xử lý đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    if (unreadCount === 0) return;
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const handleSettingsClick = (e) => {
    e.stopPropagation();
    setShowSettings(!showSettings);
  };

  const handleAudioToggle = (e) => {
    e.stopPropagation();
    if (onToggleAudio) {
      onToggleAudio(!audioEnabled);
    }
  };

  const handleRequestPermission = async (e) => {
    e.stopPropagation();
    if (onRequestPermission) {
      const granted = await onRequestPermission();
      if (granted) {
        // Có thể hiển thị toast success
        console.log("Notification permission granted");
      }
    }
  };

  // Settings panel
  const settingsPanel = (
    <div className="p-4 border-t border-gray-100 bg-gray-50">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Âm thanh thông báo</span>
          <Button
            type="text"
            size="small"
            onClick={handleAudioToggle}
            className={`${audioEnabled ? "text-blue-600" : "text-gray-400"} hover:bg-blue-50`}>
            {audioEnabled ? <Volume2 className="w-7 h-7" /> : <VolumeX className="w-7 h-7" />}
          </Button>
        </div>

        {Notification.permission !== "granted" && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Thông báo trình duyệt</span>
            <Button
              type="link"
              size="small"
              onClick={handleRequestPermission}
              className="text-blue-600 p-0 h-auto">
              Bật
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const dropdownContent = (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#48894f] to-[#36627f] px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg backdrop-blur-sm">
              <Bell className="w-6 h-6 sm:w-6 sm:h-6 text-white" />
            </div>
            <Text className="sm:text-sm text-sm font-semibold text-white">Thông báo</Text>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2 sm:px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sx sm:text-sm font-medium text-white">
              {notifications.length}
            </span>

            {onRefreshNotifications && (
              <Tooltip title="Tải lại thông báo">
                <Button
                  type="text"
                  size="small"
                  onClick={onRefreshNotifications}
                  loading={loading}
                  className="text-white/90 hover:text-white hover:bg-white/10 w-6 h-6 sm:w-7 sm:h-7 p-0 rounded-lg">
                  <RefreshCw className="w-6 h-6 sm:w-6 sm:h-6" />
                </Button>
              </Tooltip>
            )}

            {unreadCount > 0 && (
              <Tooltip title="Đánh dấu tất cả đã đọc">
                <Button
                  type="text"
                  size="small"
                  onClick={handleMarkAllAsRead}
                  className="text-white/90 hover:text-white hover:bg-white/10 border-white/20 text-sx sm:text-sm font-medium px-2 sm:px-3 py-1 h-6 sm:h-7 rounded-lg">
                  <CheckCheck className="w-6 h-6 sm:w-6 sm:h-6 mr-1" />
                  <span className="hidden sm:inline">Đọc tất cả</span>
                  <span className="sm:hidden">Đọc</span>
                </Button>
              </Tooltip>
            )}

            <Tooltip title="Cài đặt">
              <Button
                type="text"
                size="small"
                onClick={handleSettingsClick}
                className="text-white/90 hover:text-white hover:bg-white/10 w-6 h-6 sm:w-7 sm:h-7 p-0 rounded-lg">
                <Settings className="w-6 h-6 sm:w-6 sm:h-6" />
              </Button>
            </Tooltip>
          </div>
        </div>

        {unreadCount > 0 && (
          <div className="mt-2 flex items-center space-x-4">
            <span className="text-sx sm:text-sm text-white/80">{unreadCount} chưa đọc</span>
            {highPriorityUnreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500/30 text-white text-sm rounded-full">
                {highPriorityUnreadCount} Quan trọng
              </span>
            )}
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && settingsPanel}

      {/* Notifications List */}
      <div
        className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{
          maxHeight: showSettings ? "300px" : window.innerHeight <= 600 ? "50vh" : "400px",
        }}>
        {loading && notifications.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <Spin size="large" />
            <Text className="text-sm text-gray-500 block mt-3">Đang tải thông báo...</Text>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 sm:p-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{ height: 60 }}
              description={
                <div className="text-center">
                  <Text className="text-sm sm:text-base font-medium text-gray-600 block mb-1">
                    Chưa có thông báo nào
                  </Text>
                  <Text className="text-sm text-gray-400">
                    Thông báo về đơn hàng sẽ xuất hiện tại đây
                  </Text>
                </div>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {loading && notifications.length > 0 && (
              <div className="px-4 sm:px-6 py-2 bg-gray-50 border-b">
                <div className="flex items-center justify-center space-x-2">
                  <Spin size="small" />
                  <Text className="text-sm text-gray-500">Đang cập nhật...</Text>
                </div>
              </div>
            )}
            {notifications.slice(0, 20).map((notification, index) => (
              <div
                key={notification.id}
                className={`relative px-4 sm:px-6 py-3 sm:py-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 group ${
                  !notification.read
                    ? `bg-[#bcc0c552] border-l-4 ${
                        notification.priority === "high" ? "border-l-red-500" : "border-l-blue-500"
                      }`
                    : "hover:bg-gray-50"
                } ${index === 0 ? "border-t-0" : ""}`}
                onClick={() => handleNotificationClick(notification)}>
                {/* Unread indicator */}
                {!notification.read && (
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                    <div
                      className={`w-2 h-2 rounded-full animate-pulse ${
                        notification.priority === "high" ? "bg-red-500" : "bg-blue-500"
                      }`}
                    />
                  </div>
                )}

                {/* Priority indicator */}
                {notification.priority === "high" && (
                  <div className="absolute top-2 left-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  </div>
                )}

                <div className="flex items-start space-x-3 sm:space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(
                      notification.type,
                      notification.orderData?.orderStatus || notification.orderStatus
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <Text
                        className={`text-sm sm:text-sm font-semibold leading-tight pr-4 sm:pr-6 ${
                          !notification.read ? "text-gray-900" : "text-gray-700"
                        } ${getPriorityColor(notification.priority)}`}>
                        {notification.title}
                      </Text>
                    </div>

                    <Text
                      className={`text-sm sm:text-sm leading-relaxed mb-2 sm:mb-3 ${
                        !notification.read ? "text-gray-700" : "text-gray-500"
                      }`}>
                      {notification.message}
                    </Text>

                    {/* Order info if available */}
                    {notification.orderData && (
                      <div className="flex items-center space-x-2 mb-2 text-sx sm:text-sm text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded-full">
                          #{notification.orderData.orderCode || notification.orderData.id}
                        </span>
                        {notification.orderData.totalPrice && (
                          <span>{notification.orderData.totalPrice.toLocaleString()}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Clock className="w-5 h-5" />
                        <Text className="text-sx sm:text-sm">
                          {formatTimeAgo(notification.timestamp)}
                        </Text>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {!notification.read && onMarkAsRead && (
                          <Tooltip title="Đánh dấu đã đọc">
                            <Button
                              type="text"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsRead(notification.id);
                              }}
                              className="text-blue-600 hover:bg-blue-50 w-7 h-7 p-0 rounded">
                              <CheckCheck className="w-6 h-6" />
                            </Button>
                          </Tooltip>
                        )}

                        {notification.orderData && (
                          <Tooltip title="Xem đơn hàng">
                            <Button
                              type="text"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                              className="text-green-600 hover:bg-green-50 w-7 h-7 p-0 rounded">
                              <ExternalLink className="w-6 h-6" />
                            </Button>
                          </Tooltip>
                        )}

                        {onRemoveNotification && (
                          <Tooltip title="Xóa thông báo">
                            <Button
                              type="text"
                              size="small"
                              onClick={(e) => handleRemoveNotification(notification.id, e)}
                              className="text-red-600 hover:bg-red-50 w-7 h-7 p-0 rounded">
                              <Trash2 className="w-6 h-6" />
                            </Button>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Show more indicator if there are many notifications */}
            {notifications.length > 20 && (
              <div className="px-4 sm:px-6 py-3 text-center border-t bg-gray-50">
                <Text className="text-sm text-gray-500">
                  Và {notifications.length - 20} thông báo khác...
                </Text>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <Button
              type="text"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/ho-so?tab=notifications");
                setDropdownVisible(false);
              }}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 h-7 rounded-lg hover:bg-blue-50">
              <Clipboard className="w-5 h-5" /> Xem tất cả thông báo
            </Button>

            {notifications.length > 5 && onClearAll && (
              <Button
                type="text"
                size="small"
                onClick={handleClearAll}
                className="text-gray-600 hover:text-red-600 font-medium text-sm px-3 py-1 h-7 rounded-lg hover:bg-red-50">
                <Trash2 className="w-5 h-5" />
                Xóa tất cả
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={["click"]}
      placement="bottomRight"
      open={dropdownVisible}
      onOpenChange={(visible) => {
        setDropdownVisible(visible);
        if (!visible) {
          setShowSettings(false);
        }
      }}
      overlayStyle={{
        marginTop: "8px",
        zIndex: 1050,
      }}>
      <div className="relative">
        {/* Main notification badge */}
        <Badge count={unreadCount} size="small" offset={[-2, -15]} className="notification-badge">
          <Button
            type="text"
            shape="circle"
            size="large"
            className={`
              relative overflow-hidden
              flex items-center justify-center
              w-14  h-14 p-0
              bg-white hover:bg-gray-50
              border border-gray-100 hover:border-gray-300
              shadow-sm hover:shadow-md
              transition-all duration-300 ease-in-out
              ${isAnimating && unreadCount > 0 ? "animate-bounce" : ""}
              ${unreadCount > 0 ? "ring-2 ring-blue-100" : ""}
            `}>
            {/* Background effect for active state */}
            {unreadCount > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full animate-pulse " />
            )}

            {/* High priority indicator */}
            {highPriorityUnreadCount > 0 && (
              <div className="absolute center w-6 h-6 bg-red-500 rounded-full animate-ping opacity-75" />
            )}

            {/* Bell Icon */}
            <div className="relative z-10">
              {unreadCount > 0 ? (
                <BellRing
                  className={`
                  w-7 h-7 text-blue-600 transition-all duration-300
                  ${isAnimating && unreadCount > 0 ? "animate-pulse" : ""}
                `}
                />
              ) : (
                <Bell className="w-7 h-7 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
              )}
            </div>
          </Button>
        </Badge>

        {/* Pulse ring effect for new notifications - chỉ hiện khi có thông báo chưa đọc */}
        {unreadCount > 0 && isAnimating && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75" />
            <div
              className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-50"
              style={{ animationDelay: "0.5s" }}
            />
          </>
        )}
      </div>
    </Dropdown>
  );
};

export default NotificationBell;
