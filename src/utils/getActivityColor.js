// Hàm lấy màu dựa vào loại hoạt động
export const getActivityColor = (type) => {
  const colorMap = {
    ORDER_CANCELLED: "bg-red-500",
    ORDER_COMPLETED: "bg-green-500",
    ORDER_CREATED: "bg-blue-500",
    ORDER_CONFIRMED: "bg-indigo-500",
    ORDER_PREPARING: "bg-yellow-500",
    ORDER_READY: "bg-teal-500",
    ORDER_DELIVERED: "bg-emerald-500",
    USER_REGISTERED: "bg-purple-500",
    STAFF_LOGIN: "bg-cyan-500",
    MENU_UPDATED: "bg-orange-500",
  };
  return colorMap[type] || "bg-gray-500";
};
