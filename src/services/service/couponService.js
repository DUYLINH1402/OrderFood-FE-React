const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";

import { getUserCouponsApi, redeemCouponApi } from "../api/couponApi";

// [GET] Lấy danh sách mã giảm giá của user
export const getUserCoupons = async () => {
  return useFirebase ? [] : await getUserCouponsApi();
};

// [POST] Nhập mã giảm giá
export const redeemCoupon = async (code) => {
  return useFirebase ? null : await redeemCouponApi(code);
};
