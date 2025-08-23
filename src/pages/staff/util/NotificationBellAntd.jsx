import React, { useState, useEffect } from "react";
import { Badge, Dropdown, Button, Typography, Empty } from "antd";
import { Bell, BellRing, Clock, CheckCheck, X } from "lucide-react";

const { Text } = Typography;

const NotificationBell = ({
  notifications = [],
  isShaking = false,
  onBellClick,
  onNotificationClick,
  onMarkAsRead,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Kích hoạt animation khi có thông báo mới
  useEffect(() => {
    if (isShaking && notifications.length > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isShaking, notifications.length]);

  // Vô hiệu hóa scrollbar của body khi dropdown mở
  useEffect(() => {
    if (dropdownVisible) {
      // Lưu trạng thái overflow hiện tại
      const originalOverflow = document.body.style.overflow;

      // Vô hiệu hóa scroll
      document.body.style.overflow = "hidden";

      // Cleanup function để khôi phục scroll khi unmount hoặc dropdown đóng
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [dropdownVisible]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleBellClick = () => {
    if (onBellClick) {
      onBellClick();
    }
  };

  const handleNotificationClick = (notification) => {
    // Đóng dropdown trước khi xử lý notification
    setDropdownVisible(false);

    // Gọi callback để hiển thị modal
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const handleMarkAsRead = (notificationId, e) => {
    e?.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(notificationId);
    }
  };

  const handleMarkAllAsRead = (e) => {
    e?.stopPropagation();
    notifications.forEach((n) => {
      if (!n.read && onMarkAsRead) {
        onMarkAsRead(n.id);
      }
    });
  };

  const formatTimeAgo = (timestamp) => {
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
    return time.toLocaleDateString("vi-VN");
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "NEW_ORDER":
        return (
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-md">
            <Bell className="w-8 h-8 text-white" />
          </div>
        );
      case "ORDER_STATUS_UPDATE":
        return (
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-md">
            <BellRing className="w-8 h-8 text-white" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-md">
            <Bell className="w-8 h-8 text-white" />
          </div>
        );
    }
  };

  const dropdownContent = (
    <div
      className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
      style={{
        width: window.innerWidth <= 768 ? "95vw" : 380,
        maxWidth: window.innerWidth <= 768 ? "95vw" : 380,
      }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg backdrop-blur-sm">
              <Bell className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <Text className="text-base sm:text-lg font-semibold text-white">Thông báo</Text>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 sm:px-3 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium text-white">
              {notifications.length}
            </span>
            {unreadCount > 0 && (
              <Button
                type="text"
                size="small"
                onClick={handleMarkAllAsRead}
                className="text-white/90 hover:text-white hover:bg-white/10 border-white/20 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 h-7 sm:h-8 rounded-lg backdrop-blur-sm transition-all duration-200">
                <CheckCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Đọc tất cả</span>
                <span className="sm:hidden">Đọc</span>
              </Button>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <div className="mt-2 text-xs sm:text-sm text-white/80">
            {unreadCount} thông báo chưa đọc
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 sm:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {notifications.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full">
                <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <div>
                <Text className="text-base sm:text-lg font-medium text-gray-900 block mb-1">
                  Chưa có thông báo
                </Text>
                <Text className="text-sm text-gray-500">
                  Các thông báo mới sẽ xuất hiện tại đây
                </Text>
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`relative px-4 sm:px-6 py-3 sm:py-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 group ${
                  !notification.read
                    ? "bg-blue-50/50 border-l-4 border-l-blue-500"
                    : "hover:bg-gray-50"
                } ${index === 0 ? "border-t-0" : ""}`}
                onClick={() => handleNotificationClick(notification)}>
                {/* Unread indicator */}
                {!notification.read && (
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}

                <div className="flex items-start space-x-3 sm:space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Text
                        className={`text-sm font-semibold truncate pr-4 sm:pr-6 ${
                          !notification.read ? "text-gray-900" : "text-gray-700"
                        }`}>
                        {notification.title}
                      </Text>
                    </div>

                    <Text
                      className={`text-sm leading-relaxed mb-2 sm:mb-3 ${
                        !notification.read ? "text-gray-700" : "text-gray-500"
                      }`}>
                      {notification.message}
                    </Text>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                        <Text className="text-xs sm:text-sm">
                          {formatTimeAgo(notification.timestamp)}
                        </Text>
                      </div>

                      {!notification.read && (
                        <Button
                          type="text"
                          size="small"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 sm:px-3 py-1 h-6 sm:h-7 rounded-md text-xs sm:text-sm font-medium">
                          <CheckCheck className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Đã đọc</span>
                          <span className="sm:hidden">✓</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-100">
          <div className="text-center">
            <Button
              type="text"
              size="small"
              onClick={() => setDropdownVisible(false)}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm px-4 py-2 h-8 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              Đóng thông báo
            </Button>
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
        if (visible) {
          handleBellClick();
        }
      }}
      overlayStyle={{
        marginTop: "8px",
      }}>
      <div className="relative">
        <Badge count={unreadCount} size="small" offset={[-2, 2]} className="notification-badge">
          <Button
            type="text"
            shape="circle"
            size="large"
            className={`
              relative overflow-hidden
              flex items-center justify-center
              w-12 h-12 p-0
              bg-white hover:bg-gray-50 
              border border-gray-200 hover:border-gray-300
              shadow-sm hover:shadow-md
              transition-all duration-300 ease-in-out
              ${isAnimating || (isShaking && unreadCount > 0) ? "animate-bounce" : ""}
              ${unreadCount > 0 ? "ring-2 ring-blue-100" : ""}
            `}>
            {/* Background effect for active state */}
            {unreadCount > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full animate-pulse" />
            )}

            {/* Bell Icon */}
            <div className="relative z-10">
              {unreadCount > 0 ? (
                <BellRing
                  className={`
                  w-5 h-5 text-blue-600 transition-all duration-300
                  ${isShaking ? "animate-pulse" : ""}
                `}
                />
              ) : (
                <Bell className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
              )}
            </div>
          </Button>
        </Badge>

        {/* Pulse ring effect for new notifications */}
        {unreadCount > 0 && isShaking && (
          <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75" />
        )}
      </div>
    </Dropdown>
  );
};

// Custom CSS for animations (add to your global CSS)
const customStyles = `
  @keyframes notification-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .animate-notification-pulse {
    animation: notification-pulse 1.5s ease-in-out infinite;
  }
  
  .scrollbar-thin::-webkit-scrollbar {
    width: 4px;
  }
  
  .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 2px;
  }
  
  .scrollbar-track-gray-100::-webkit-scrollbar-track {
    background-color: #f3f4f6;
  }
  
  .notification-badge .ant-badge-count {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
    border: 2px solid white;
    font-weight: 600;
    font-size: 11px;
  }
`;

export default NotificationBell;
