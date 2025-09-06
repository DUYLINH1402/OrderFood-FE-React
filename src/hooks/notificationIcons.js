import React from "react";
import {
  IoCheckmarkCircle,
  IoCarSport,
  IoGift,
  IoCloseCircle,
  IoNotifications,
} from "react-icons/io5";

const getNotificationIcon = (type, icon) => {
  const baseClasses =
    "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg";

  const iconMap = {
    ORDER_CONFIRMED: {
      bg: "bg-gradient-to-br from-green-400 to-green-600",
      IconComponent: IoCheckmarkCircle,
    },
    ORDER_IN_DELIVERY: {
      bg: "bg-gradient-to-br from-blue-400 to-blue-600",
      IconComponent: IoCarSport,
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

  const config = iconMap[type] || iconMap["SYSTEM_NOTIFICATION"];
  const { IconComponent } = config;

  return (
    <div className={`${baseClasses} ${config.bg} ring-2 ring-white`}>
      <IconComponent size={20} />
    </div>
  );
};

export default getNotificationIcon;
