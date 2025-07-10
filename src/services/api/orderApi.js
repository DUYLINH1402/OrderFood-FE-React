import { publicClient } from "../apiClient";

// TẠO ĐƠN HÀNG - Hỗ trợ cả khách vãng lai và user đăng nhập
export const createOrderApi = async (payload) => {
  try {
    // console.log("Sending order request to: /api/orders");
    // console.log("Request payload:", JSON.stringify(payload, null, 2));

    const response = await publicClient.post("/api/orders", payload);
    // console.log("Đơn hàng đã được tạo:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
      },
    });

    // Re-throw the error with more context
    const enhancedError = new Error(
      error.response?.data?.message || error.message || "Không thể tạo đơn hàng"
    );
    enhancedError.status = error.response?.status;
    enhancedError.originalError = error;
    throw enhancedError;
  }
};
