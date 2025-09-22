import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button, Empty, Spin, Typography, Tooltip, Badge, Dropdown, Menu } from "antd";
import {
  Bell,
  BellRing,
  Clock,
  CheckCheck,
  Trash2,
  ExternalLink,
  Filter,
  Settings,
  Volume2,
  VolumeX,
  RefreshCw,
  Package,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Truck,
  ChefHat,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import { useUserNotifications } from "../../hooks/useUserNotifications";
// Import utility functions
import {
  getNotificationIconConfig,
  formatTimeAgo,
  getNotificationNavigationPath,
  filterNotifications,
  sortNotificationsByTime,
  getPriorityColor,
  getNotificationSummary,
} from "../../utils/notificationUtils";

const { Text, Title } = Typography;
const { confirm } = Modal;

const NotificationsTab = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // all, unread, orders, system

  // Sử dụng hook useUserNotifications để lấy data từ backend
  const {
    notifications,
    unreadCount,
    highPriorityUnreadCount,
    loading,
    audioEnabled,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    toggleAudio,
    loadNotificationsFromAPI,
  } = useUserNotifications();

  const getNotificationIcon = (type, orderStatus) => {
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
      <div
        className={`w-10 h-10 p-2 rounded-lg ${config.bgColor} ${config.textColor} flex items-center justify-center`}>
        <IconComponent className="w-6 h-6" />
      </div>
    );
  };

  const handleNotificationClick = (notification) => {
    // Đánh dấu đã đọc nếu chưa đọc
    if (!notification.read && markAsRead) {
      markAsRead(notification.id);
    }

    // Sử dụng utility function để xác định navigation path
    const path = getNotificationNavigationPath(notification);
    navigate(path);
  };

  const handleMarkAsRead = (notificationId) => {
    if (markAsRead) {
      markAsRead(notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    if (markAllAsRead) {
      markAllAsRead();
    }
  };

  const handleRemoveNotification = (notificationId) => {
    confirm({
      title: "Xóa thông báo",
      content: "Bạn có chắc chắn muốn xóa thông báo này không?",
      onOk: () => {
        if (removeNotification) {
          removeNotification(notificationId);
        }
      },
    });
  };

  const handleClearAll = () => {
    confirm({
      title: "Xóa tất cả thông báo",
      content:
        "Bạn có chắc chắn muốn xóa tất cả thông báo không? Hành động này không thể hoàn tác.",
      onOk: () => {
        if (clearAll) {
          clearAll();
        }
      },
    });
  };

  const handleAudioToggle = () => {
    if (toggleAudio) {
      toggleAudio(!audioEnabled);
    }
  };

  // Refresh notifications từ API
  const handleRefreshNotifications = () => {
    if (loadNotificationsFromAPI) {
      loadNotificationsFromAPI();
    }
  };

  const filteredNotifications = filterNotifications(notifications, filter);

  const filterMenu = (
    <Menu
      selectedKeys={[filter]}
      onClick={({ key }) => setFilter(key)}
      items={[
        { key: "all", label: "Tất cả thông báo" },
        { key: "unread", label: "Chưa đọc" },
        { key: "orders", label: "Đơn hàng" },
        { key: "system", label: "Hệ thống" },
      ]}
    />
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Title level={4} className="!mb-1">
            Tất cả thông báo
          </Title>
          <Text className="text-gray-500">Quản lý và xem tất cả thông báo của bạn</Text>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <Tooltip title="Tải lại thông báo">
            <Button
              type="text"
              icon={<RefreshCw className="w-5 h-5" />}
              onClick={handleRefreshNotifications}
              loading={loading}
              className="text-gray-600 hover:text-blue-600"
            />
          </Tooltip>

          {/* Filter */}
          <Dropdown overlay={filterMenu} trigger={["click"]}>
            <Button icon={<Filter className="w-5 h-5" />}>
              Lọc
              <span className="ml-1 text-gray-400">({filteredNotifications.length})</span>
            </Button>
          </Dropdown>

          {/* Audio Toggle */}
          <Tooltip title={audioEnabled ? "Tắt âm thanh" : "Bật âm thanh"}>
            <Button
              type="text"
              icon={
                audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />
              }
              onClick={handleAudioToggle}
              className={audioEnabled ? "text-blue-600" : "text-gray-400"}
            />
          </Tooltip>

          {/* Mark all as read */}
          {unreadCount > 0 && (
            <Button
              type="primary"
              icon={<CheckCheck className="w-5 h-5" />}
              onClick={handleMarkAllAsRead}>
              Đọc tất cả ({unreadCount})
            </Button>
          )}

          {/* Clear all */}
          {notifications.length > 0 && (
            <Button danger icon={<Trash2 className="w-5 h-5" />} onClick={handleClearAll}>
              Xóa tất cả
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Spin size="large" />
            <Text className="text-gray-500 block mt-3">Đang tải thông báo...</Text>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{ height: 60 }}
              description={
                <div className="text-center">
                  <Text className="text-base font-medium text-gray-600 block mb-1">
                    {filter === "unread"
                      ? "Không có thông báo chưa đọc"
                      : filter === "orders"
                      ? "Không có thông báo đơn hàng"
                      : filter === "system"
                      ? "Không có thông báo hệ thống"
                      : "Chưa có thông báo nào"}
                  </Text>
                  <Text className="text-gray-400">
                    Thông báo sẽ xuất hiện tại đây khi có cập nhật mới
                  </Text>
                </div>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`relative p-6 cursor-pointer transition-all duration-200 hover:bg-gray-50 group ${
                  !notification.read
                    ? `bg-blue-50/50 border-l-4 ${
                        notification.priority === "high" ? "border-l-red-500" : "border-l-blue-500"
                      }`
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleNotificationClick(notification)}>
                {/* Unread indicator */}
                {!notification.read && (
                  <div className="absolute top-4 right-4">
                    <div
                      className={`w-3 h-3 rounded-full animate-pulse ${
                        notification.priority === "high" ? "bg-red-500" : "bg-blue-500"
                      }`}
                    />
                  </div>
                )}

                {/* Priority indicator */}
                {notification.priority === "high" && (
                  <div className="absolute top-3 left-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  </div>
                )}

                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getNotificationIcon(
                      notification.type,
                      notification.orderData?.orderStatus || notification.orderStatus
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <Text
                        className={`sm:text-base text-sm font-semibold leading-tight pr-6 ${
                          !notification.read ? "text-gray-900" : "text-gray-700"
                        } ${getPriorityColor(notification.priority)}`}>
                        {notification.title}
                      </Text>
                    </div>

                    <Text
                      className={`text-sm leading-relaxed mb-3 ${
                        !notification.read ? "text-gray-700" : "text-gray-500"
                      }`}>
                      {notification.message}
                    </Text>

                    {/* Order info if available */}
                    {notification.orderData && (
                      <div className="flex items-center space-x-3 mb-3 text-sm text-gray-500">
                        <Badge
                          color="blue"
                          text={`#${notification.orderData.orderCode || notification.orderData.id}`}
                        />
                        {notification.orderData.totalPrice && (
                          <span className="font-medium">
                            {notification.orderData.totalPrice.toLocaleString()} VNĐ
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Clock className="w-5 h-5" />
                        <Text className="text-sm">{formatTimeAgo(notification.timestamp)}</Text>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {!notification.read && (
                          <Tooltip title="Đánh dấu đã đọc">
                            <Button
                              type="text"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="text-blue-600 hover:bg-blue-50"
                              icon={<CheckCheck className="w-5 h-5" />}
                            />
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
                              className="text-green-600 hover:bg-green-50"
                              icon={<ExternalLink className="w-5 h-5" />}
                            />
                          </Tooltip>
                        )}

                        <Tooltip title="Xóa thông báo">
                          <Button
                            type="text"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveNotification(notification.id);
                            }}
                            className="text-red-600 hover:bg-red-50"
                            icon={<Trash2 className="w-5 h-5" />}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {notifications.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Tổng: {notifications.length} thông báo
              {unreadCount > 0 && ` • ${unreadCount} chưa đọc`}
            </span>
            <span>Hiển thị: {filteredNotifications.length} thông báo</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;
