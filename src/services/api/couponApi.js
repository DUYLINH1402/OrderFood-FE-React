import apiClient from "../apiClient";

// Gọi API lấy danh sách mã giảm giá
export const getUserCouponsApi = async () => {
  const res = await apiClient.get("/api/coupons");
  return res.data.content || [];
};

// Gọi API nhập mã giảm giá
export const redeemCouponApi = async (code) => {
  const res = await apiClient.post("/coupons/redeem", { code });
  return res.data;
};
