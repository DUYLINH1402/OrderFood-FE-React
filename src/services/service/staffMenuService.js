const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";

import {
  getAllFoodsFromSQL,
  getBestSellerFoodsFromSQL,
  getFeaturedFoodsFromSQL,
  getFoodBySlugFromSQL,
  getFoodsByCategoryIDFromSQL,
} from "../api/foodApi";
import {
  getRootCategoriesFromSQL,
  getCategoriesByParentFromSQL,
  getAllCategoriesWithChildrenFromSQL,
} from "../api/categoriesApi";

import {
  getStaffMenuFromSQL,
  updateFoodStatusWithNoteFromSQL,
  getStaffMenuHistoryFromSQL,
  getFoodStatsFromSQL,
  //   searchStaffFoodsFromSQL,
} from "../api/staffMenuApi";

// Lấy tất cả món ăn (dùng lại từ foodApi)
export const getAllFoods = async (page = 0, size = 12) => {
  return useFirebase ? [] : await getAllFoodsFromSQL(page, size);
};

// Lấy món bán chạy (dùng lại từ foodApi)
export const getBestSellerFoods = async (page = 0, size = 10) => {
  return useFirebase ? [] : await getBestSellerFoodsFromSQL(page, size);
};

// Lấy món đặc biệt (dùng lại từ foodApi)
export const getFeaturedFoods = async (page = 0, size = 10) => {
  return useFirebase ? [] : await getFeaturedFoodsFromSQL(page, size);
};

// Lấy chi tiết món theo slug (dùng lại từ foodApi)
export const getFoodBySlug = async (slug) => {
  return useFirebase ? null : await getFoodBySlugFromSQL(slug);
};

// Lấy món theo danh mục (dùng lại từ foodApi)
export const getFoodsByCategory = async (categoryId, page = 0, size = 12) => {
  return useFirebase ? [] : await getFoodsByCategoryIDFromSQL(categoryId, page, size);
};

// Lấy danh mục gốc (dùng lại từ categoriesApi)
export const getRootCategories = async () => {
  return useFirebase ? [] : await getRootCategoriesFromSQL();
};

// Lấy danh mục con (dùng lại từ categoriesApi)
export const getChildCategories = async (parentId) => {
  return useFirebase ? [] : await getCategoriesByParentFromSQL(parentId);
};

// Lấy tất cả danh mục kèm children (cho Staff dropdown)
export const getAllCategoriesWithChildren = async () => {
  return useFirebase ? [] : await getAllCategoriesWithChildrenFromSQL();
};

// LẤY TẤT CẢ MÓN ĂN CHO STAFF VỚI FILTER (server-side filtering)
export const getStaffMenuWithFilter = async (params = {}) => {
  return useFirebase
    ? { content: [], totalElements: 0, totalPages: 0 }
    : await getStaffMenuFromSQL(params);
};

// ========================================================================
// CACHE CHO STATS (để tránh gọi API nhiều lần)
// ========================================================================
let statsCache = null;
let statsCacheTime = null;
const STATS_CACHE_TTL = 5 * 60 * 1000; // 5 phút

// LẤY THỐNG KÊ SỐ LƯỢNG MÓN ĂN (TOÀN BỘ HỆ THỐNG) - CÓ CACHE
export const getFoodStats = async (forceRefresh = false) => {
  // Kiểm tra cache còn hợp lệ không
  if (!forceRefresh && statsCache && statsCacheTime) {
    const now = Date.now();
    if (now - statsCacheTime < STATS_CACHE_TTL) {
      return statsCache;
    }
  }

  // Gọi API lấy stats mới
  if (useFirebase) {
    return { total: 0, available: 0, unavailable: 0 };
  }

  const stats = await getFoodStatsFromSQL();
  // Lưu vào cache
  statsCache = stats;
  statsCacheTime = Date.now();
  return stats;
};

// XÓA CACHE STATS (gọi khi cập nhật trạng thái món ăn)
export const invalidateStatsCache = () => {
  statsCache = null;
  statsCacheTime = null;
};

// LẤY TẤT CẢ MÓN ĂN CHO STAFF (bao gồm cả món UNAVAILABLE) - deprecated, dùng getStaffMenuWithFilter
export const getStaffMenu = async (page = 0, size = 12) => {
  return useFirebase
    ? { content: [], totalElements: 0, totalPages: 0 }
    : await getStaffMenuFromSQL({ page, size });
};

// CẬP NHẬT TRẠNG THÁI MÓN ĂN VỚI GHI CHÚ
// Params: foodId, status (AVAILABLE/UNAVAILABLE), statusNote (lý do)
export const updateFoodStatusWithNote = async (foodId, status, statusNote = "") => {
  return await updateFoodStatusWithNoteFromSQL(foodId, status, statusNote);
};

// LẤY LỊCH SỬ THAY ĐỔI TRẠNG THÁI CỦA STAFF
export const getStaffMenuHistory = async (page = 0, size = 20) => {
  return useFirebase ? { success: false, data: [] } : await getStaffMenuHistoryFromSQL(page, size);
};

// TÌM KIẾM MÓN ĂN CHO STAFF
export const searchStaffFoods = async (keyword, page = 0, size = 50) => {
  return useFirebase
    ? { success: false, data: [] }
    : await searchStaffFoodsFromSQL(keyword, page, size);
};
