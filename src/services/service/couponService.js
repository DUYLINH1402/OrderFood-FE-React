const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";

import { getUserCouponsApi, redeemCouponApi, validateCouponApi } from "../api/couponApi";

// [GET] Lấy danh sách mã giảm giá của user
export const getUserCoupons = async () => {
  return useFirebase ? [] : await getUserCouponsApi();
};

// [POST] Nhập mã giảm giá
export const redeemCoupon = async (code) => {
  return useFirebase ? null : await redeemCouponApi(code);
};

// [POST] Kiểm tra mã giảm giá (gửi đủ dữ liệu cho BE)
export const validateCoupon = async ({ couponCode, orderAmount, foodIds }) => {
  const payload = { couponCode, orderAmount, foodIds };
  return useFirebase ? null : await validateCouponApi(payload);
};
