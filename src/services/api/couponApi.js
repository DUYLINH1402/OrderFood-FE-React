import apiClient from "../apiClient";

// Gọi API lấy danh sách mã giảm giá
export const getUserCouponsApi = async () => {
  const res = await apiClient.get("/api/coupons/available");
  return res.data || [];
};

// Gọi API nhập mã giảm giá
export const redeemCouponApi = async (code) => {
  const res = await apiClient.post("/coupons/redeem", { code });
  return res.data;
};

// Gọi API áp dụng mã giảm giá (tính toán giảm giá trên FE)
// Gọi API validate coupon cho đơn hàng (BE sẽ kiểm tra và trả về thông tin giảm giá)
export const validateCouponApi = async ({ couponCode, orderAmount, foodIds }) => {
  const payload = { couponCode, orderAmount, foodIds };
  const res = await apiClient.post("/api/coupons/validate", payload);
  return res.data;
};
