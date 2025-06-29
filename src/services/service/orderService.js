const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";
import { createOrderApi } from "../api/orderApi";

// TẠO ĐƠN HÀNG
export const createOrder = async (payload) => {
  return useFirebase ? await createOrderFromFirebase(payload) : await createOrderApi(payload);
};
