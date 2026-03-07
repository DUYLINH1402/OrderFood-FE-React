import {
  getAdminRestaurantInfoFromSQL,
  updateRestaurantInfoFromSQL,
  addGalleryImageFromSQL,
  updateGalleryImageFromSQL,
  deleteGalleryImageFromSQL,
  reorderGalleryFromSQL,
} from "../api/adminRestaurantApi";

/**
 * Lấy thông tin nhà hàng cho Admin
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
export const getAdminRestaurantInfo = async () => {
  return await getAdminRestaurantInfoFromSQL();
};

/**
 * Cập nhật thông tin nhà hàng
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise<Object>} Thông tin nhà hàng sau khi cập nhật
 */
export const updateRestaurantInfo = async (data) => {
  return await updateRestaurantInfoFromSQL(data);
};

/**
 * Thêm hình ảnh vào gallery
 * @param {Object} data - Dữ liệu hình ảnh {imageUrl, displayOrder}
 * @returns {Promise<Object>} Thông tin nhà hàng với gallery đã cập nhật
 */
export const addGalleryImage = async (data) => {
  return await addGalleryImageFromSQL(data);
};

/**
 * Cập nhật hình ảnh gallery
 * @param {number} galleryId - ID hình ảnh
 * @param {Object} data - Dữ liệu cập nhật {imageUrl, displayOrder}
 * @returns {Promise<Object>} Thông tin gallery sau khi cập nhật
 */
export const updateGalleryImage = async (galleryId, data) => {
  return await updateGalleryImageFromSQL(galleryId, data);
};

/**
 * Xóa hình ảnh khỏi gallery
 * @param {number} galleryId - ID hình ảnh cần xóa
 * @returns {Promise<void>}
 */
export const deleteGalleryImage = async (galleryId) => {
  return await deleteGalleryImageFromSQL(galleryId);
};

/**
 * Sắp xếp lại thứ tự hiển thị gallery
 * @param {number[]} galleryIds - Danh sách ID theo thứ tự mới mong muốn
 * @returns {Promise<Object>} Thông tin nhà hàng với gallery đã sắp xếp lại
 */
export const reorderGallery = async (galleryIds) => {
  return await reorderGalleryFromSQL(galleryIds);
};
