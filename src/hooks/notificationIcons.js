import React from "react";
import { IoCheckmarkCircle, IoCar, IoGift, IoCloseCircle, IoNotifications } from "react-icons/io5";
import { Clock, Settings } from "lucide-react";

const getNotificationIcon = (type, orderStatus) => {
  const baseClasses =
    "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg";

  // Mapping dựa trên orderStatus từ Backend enum OrderStatus
  const getIconConfig = () => {
    // Ưu tiên orderStatus từ WebSocket data
    if (orderStatus) {
      switch (orderStatus.toUpperCase()) {
        case "PENDING":
          return {
            bg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
            IconComponent: Clock,
          };
        case "PROCESSING":
          return {
            bg: "bg-gradient-to-br from-orange-400 to-orange-600",
            IconComponent: Settings,
          };
        case "CONFIRMED":
          return {
            bg: "bg-gradient-to-br from-green-400 to-green-600",
            IconComponent: IoCheckmarkCircle,
          };
        case "DELIVERING":
          return {
            bg: "bg-gradient-to-br from-indigo-400 to-indigo-600",
            IconComponent: IoCar,
          };
        case "COMPLETED":
          return {
            bg: "bg-gradient-to-br from-purple-400 to-purple-600",
            IconComponent: IoGift,
          };
        case "CANCELLED":
          return {
            bg: "bg-gradient-to-br from-red-400 to-red-600",
            IconComponent: IoCloseCircle,
          };
        default:
          return {
            bg: "bg-gradient-to-br from-gray-400 to-gray-600",
            IconComponent: IoNotifications,
          };
      }
    }

    // Fallback cho type cũ (backwards compatibility)
    const iconMap = {
      ORDER_PENDING: {
        bg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
        IconComponent: Clock,
      },
      ORDER_PROCESSING: {
        bg: "bg-gradient-to-br from-orange-400 to-orange-600",
        IconComponent: Settings,
      },
      ORDER_CONFIRMED: {
        bg: "bg-gradient-to-br from-green-400 to-green-600",
        IconComponent: IoCheckmarkCircle,
      },
      ORDER_DELIVERING: {
        bg: "bg-gradient-to-br from-indigo-400 to-indigo-600",
        IconComponent: IoCar,
      },
      ORDER_IN_DELIVERY: {
        bg: "bg-gradient-to-br from-blue-400 to-blue-600",
        IconComponent: IoCar,
      },
      ORDER_COMPLETED: {
        bg: "bg-gradient-to-br from-purple-400 to-purple-600",
        IconComponent: IoGift,
      },
      ORDER_CANCELLED: {
        bg: "bg-gradient-to-br from-red-400 to-red-600",
        IconComponent: IoCloseCircle,
      },
      SYSTEM_NOTIFICATION: {
        bg: "bg-gradient-to-br from-gray-400 to-gray-600",
        IconComponent: IoNotifications,
      },
    };

    return iconMap[type] || iconMap["SYSTEM_NOTIFICATION"];
  };

  const config = getIconConfig();
  const { IconComponent } = config;

  return (
    <div className={`${baseClasses} ${config.bg} ring-2 ring-white`}>
      <IconComponent size={20} />
    </div>
  );
};

export default getNotificationIcon;
