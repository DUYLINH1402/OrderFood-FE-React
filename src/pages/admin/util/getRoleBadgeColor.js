// Hàm lấy màu badge theo role
export const getRoleBadgeColor = (roleCode) => {
  switch (roleCode) {
    case "ROLE_ADMIN":
      return "bg-purple-100 text-purple-800";
    case "ROLE_STAFF":
      return "bg-blue-100 text-blue-800";
    case "ROLE_USER":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
