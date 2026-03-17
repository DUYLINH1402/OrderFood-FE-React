import { apiClient } from "../apiClient";

// BASE URL: /api/v1/admin/restaurant

/**
 * Lấy thông tin nhà hàng cho Admin
 * @returns {Promise<Object|null>} Thông tin nhà hàng
 */
export const getAdminRestaurantInfoFromSQL = async () => {
  try {
    const response = await apiClient.get("/api/v1/admin/restaurant");
    return response.data;
  } catch (error) {
    console.error("Loi khi lay thong tin nha hang (admin):", error.message);
    throw error;
  }
};

/**
 * Cập nhật thông tin nhà hàng
 * @param {Object} data - Dữ liệu cập nhật
 * @param {string} data.name - Tên nhà hàng
 * @param {string} data.logoUrl - URL logo
 * @param {string} data.address - Địa chỉ
 * @param {string} data.phoneNumber - Số điện thoại
 * @param {string} data.videoUrl - URL video giới thiệu
 * @param {string} data.description - Mô tả
 * @param {string} data.openingHours - Giờ mở cửa
 * @returns {Promise<Object>} Thông tin nhà hàng sau khi cập nhật
 */
export const updateRestaurantInfoFromSQL = async (data) => {
  try {
    const response = await apiClient.put("/api/v1/admin/restaurant", data);
    return response.data;
  } catch (error) {
    console.error("Loi khi cap nhat thong tin nha hang:", error.message);
    throw error;
  }
};

/**
 * Thêm hình ảnh vào gallery
 * @param {Object} data - Dữ liệu hình ảnh
 * @param {string} data.imageUrl - URL hình ảnh
 * @param {number} data.displayOrder - Thứ tự hiển thị
 * @returns {Promise<Object>} Thông tin nhà hàng với gallery đã cập nhật
 */
export const addGalleryImageFromSQL = async (data) => {
  try {
    const response = await apiClient.post("/api/v1/admin/restaurant/gallery", data);
    return response.data;
  } catch (error) {
    console.error("Loi khi them hinh anh gallery:", error.message);
    throw error;
  }
};

/**
 * Cập nhật hình ảnh gallery
 * @param {number} galleryId - ID hình ảnh cần cập nhật
 * @param {Object} data - Dữ liệu cập nhật
 * @param {string} data.imageUrl - URL hình ảnh mới
 * @param {number} data.displayOrder - Thứ tự hiển thị mới
 * @returns {Promise<Object>} Thông tin gallery sau khi cập nhật
 */
export const updateGalleryImageFromSQL = async (galleryId, data) => {
  try {
    const response = await apiClient.put(`/api/v1/admin/restaurant/gallery/${galleryId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Loi khi cap nhat hinh anh gallery (${galleryId}):`, error.message);
    throw error;
  }
};

/**
 * Xóa hình ảnh khỏi gallery
 * @param {number} galleryId - ID hình ảnh cần xóa
 * @returns {Promise<void>}
 */
export const deleteGalleryImageFromSQL = async (galleryId) => {
  try {
    await apiClient.delete(`/api/v1/admin/restaurant/gallery/${galleryId}`);
  } catch (error) {
    console.error(`Loi khi xoa hinh anh gallery (${galleryId}):`, error.message);
    throw error;
  }
};

/**
 * Sắp xếp lại thứ tự gallery
 * @param {number[]} galleryIds - Danh sách ID theo thứ tự mới
 * @returns {Promise<Object>} Thông tin nhà hàng với gallery đã sắp xếp lại
 */
export const reorderGalleryFromSQL = async (galleryIds) => {
  try {
    const response = await apiClient.put("/api/v1/admin/restaurant/gallery/reorder", galleryIds);
    return response.data;
  } catch (error) {
    console.error("Loi khi sap xep lai gallery:", error.message);
    throw error;
  }
};
