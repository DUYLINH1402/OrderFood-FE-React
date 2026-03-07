import { getRestaurantInfoFromSQL } from "../api/restaurantApi";

/**
 * Lấy thông tin nhà hàng
 * @returns {Promise<Object|null>} Thông tin nhà hàng bao gồm:
 * - id: ID nhà hàng
 * - name: Tên nhà hàng
 * - logoUrl: URL logo
 * - address: Địa chỉ
 * - phoneNumber: Số điện thoại
 * - videoUrl: URL video giới thiệu
 * - description: Mô tả
 * - openingHours: Giờ mở cửa
 * - galleries: Danh sách hình ảnh gallery
 */
export const getRestaurantInfo = async () => {
  return await getRestaurantInfoFromSQL();
};
