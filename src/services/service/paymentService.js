import { createPaymentApi, updatePaymentStatusApi, checkPaymentStatusApi } from "../api/paymentApi";

// TẠO PAYMENT
export const createPayment = async (paymentData) => {
  try {
    return await createPaymentApi(paymentData);
  } catch (error) {
    console.error("Error in createPayment service:", error);
    throw error;
  }
};

// UPDATE PAYMENT STATUS (cho trường hợp ZaloPay thất bại)
export const updatePaymentStatus = async (statusData) => {
  try {
    return await updatePaymentStatusApi(statusData);
  } catch (error) {
    console.error("Error in updatePaymentStatus service:", error);
    throw error;
  }
};

// CHECK PAYMENT STATUS
export const checkPaymentStatus = async (appTransId) => {
  try {
    return await checkPaymentStatusApi(appTransId);
  } catch (error) {
    console.error("Error in checkPaymentStatus service:", error);
    throw error;
  }
};
