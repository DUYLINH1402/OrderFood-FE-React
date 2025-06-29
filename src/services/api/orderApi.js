import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// TẠO ĐƠN HÀNG
export const createOrderApi = async (payload) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/orders`, payload);
    console.log("Đơn hàng đã được tạo:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    throw error;
  }
};
