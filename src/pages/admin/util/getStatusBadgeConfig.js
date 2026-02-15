// Hàm lấy màu badge theo trạng thái
const getStatusBadgeConfig = (status) => {
  switch (status) {
    case "PUBLISHED":
      return { bg: "bg-green-100", text: "text-green-800", label: "Đã xuất bản" };
    case "DRAFT":
      return { bg: "bg-yellow-100", text: "text-yellow-800", label: "Bản nháp" };
    case "ARCHIVED":
      return { bg: "bg-gray-100", text: "text-gray-800", label: "Đã lưu trữ" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", label: status };
  }
};

export default getStatusBadgeConfig;
