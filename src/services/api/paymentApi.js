import { publicClient } from "../apiClient";

// API để tạo payment - Hỗ trợ cả khách vãng lai
export const createPaymentApi = async (paymentData) => {
  try {
    const response = await publicClient.post("/api/payments", paymentData);
    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

// API để update payment status từ frontend - Không cần token
export const updatePaymentStatusApi = async (statusData) => {
  try {
    const response = await publicClient.post("/api/payments/update-status", statusData);
    return response.data;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
};

// API để check payment status - Không cần token
export const checkPaymentStatusApi = async (appTransId) => {
  try {
    const response = await publicClient.get(`/api/payments/zalopay/check-status/${appTransId}`);
    return response.data;
  } catch (error) {
    console.error("Error checking payment status:", error);
    throw error;
  }
};
