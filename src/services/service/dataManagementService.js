import { apiClient } from "../apiClient";

/**
 * Reindex toàn bộ dữ liệu tìm kiếm (Algolia)
 * Chạy async ở backend, API trả về message xác nhận đã bắt đầu
 * @returns {Promise<string>} Message thông báo
 */
export const reindexSearchData = async () => {
  const response = await apiClient.post("/api/v1/admin/search/reindex");
  return response.data;
};

/**
 * Khởi tạo dữ liệu Algolia từ đầu
 * Xóa toàn bộ dữ liệu cũ và đẩy dữ liệu mới lên
 * @returns {Promise<{success: boolean, message: string, syncedFoods: number}>}
 */
export const initAlgoliaData = async () => {
  const response = await apiClient.post("/api/v1/admin/search/init");
  return response.data;
};

/**
 * Xóa cache hệ thống
 * @returns {Promise<string>} Message thông báo
 */
export const clearCache = async () => {
  const response = await apiClient.post("/api/v1/cache/clear");
  return response.data;
};

/**
 * Lấy thông tin trạng thái cache
 * @returns {Promise<{cacheSize: number, entries: number}>}
 */
export const getCacheStatus = async () => {
  const response = await apiClient.get("/api/v1/cache/status");
  return response.data;
};
