const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";

import {
  getAdminFoodsFromSQL,
  getFoodByIdFromSQL,
  createFoodFromSQL,
  updateFoodFromSQL,
  updateFoodStatusFromSQL,
  deleteFoodFromSQL,
  uploadFoodImageFromSQL,
} from "../api/adminFoodApi";

import { getBestSellerFoodsFromSQL, getFeaturedFoodsFromSQL } from "../api/staffMenuApi";

import { getAllCategoriesWithChildrenFromSQL } from "../api/categoriesApi";

import { getFoodStatsFromSQL } from "../api/staffMenuApi";

// LẤY DANH SÁCH MÓN ĂN CHO ADMIN VỚI FILTER
export const getAdminFoods = async (params = {}) => {
  return useFirebase
    ? { content: [], totalElements: 0, totalPages: 0 }
    : await getAdminFoodsFromSQL(params);
};

// LẤY CHI TIẾT MÓN ĂN THEO ID
export const getFoodById = async (foodId) => {
  return useFirebase ? null : await getFoodByIdFromSQL(foodId);
};

// TẠO MÓN ĂN MỚI
export const createFood = async (foodData) => {
  if (useFirebase) {
    throw new Error("Firebase khong ho tro tao mon an");
  }
  return await createFoodFromSQL(foodData);
};

// CẬP NHẬT THÔNG TIN MÓN ĂN
export const updateFood = async (foodId, foodData) => {
  if (useFirebase) {
    throw new Error("Firebase khong ho tro cap nhat mon an");
  }
  return await updateFoodFromSQL(foodId, foodData);
};

// CẬP NHẬT TRẠNG THÁI MÓN ĂN
export const updateFoodStatus = async (foodId, statusData) => {
  if (useFirebase) {
    throw new Error("Firebase khong ho tro cap nhat trang thai");
  }
  return await updateFoodStatusFromSQL(foodId, statusData);
};

// XÓA MÓN ĂN
export const deleteFood = async (foodId) => {
  if (useFirebase) {
    throw new Error("Firebase khong ho tro xoa mon an");
  }
  return await deleteFoodFromSQL(foodId);
};

// UPLOAD ẢNH MÓN ĂN
export const uploadFoodImage = async (file) => {
  if (useFirebase) {
    throw new Error("Firebase khong ho tro upload anh");
  }
  return await uploadFoodImageFromSQL(file);
};

// LẤY MÓN BÁN CHẠY
export const getBestSellerFoods = async (page = 0, size = 10) => {
  return useFirebase ? [] : await getBestSellerFoodsFromSQL(size);
};

// LẤY MÓN ĐẶC BIỆT
export const getFeaturedFoods = async (page = 0, size = 10) => {
  return useFirebase ? [] : await getFeaturedFoodsFromSQL(size);
};

// LẤY TẤT CẢ DANH MỤC KÈM CHILDREN
export const getAllCategoriesWithChildren = async () => {
  return useFirebase ? [] : await getAllCategoriesWithChildrenFromSQL();
};

// ========================================================================
// CACHE CHO STATS
// ========================================================================
let statsCache = null;
let statsCacheTime = null;
const STATS_CACHE_TTL = 5 * 60 * 1000; // 5 phut

// LẤY THỐNG KÊ SỐ LƯỢNG MÓN ĂN
export const getFoodStats = async (forceRefresh = false) => {
  if (!forceRefresh && statsCache && statsCacheTime) {
    const now = Date.now();
    if (now - statsCacheTime < STATS_CACHE_TTL) {
      return statsCache;
    }
  }

  if (useFirebase) {
    return { total: 0, available: 0, unavailable: 0 };
  }

  const stats = await getFoodStatsFromSQL();
  statsCache = stats;
  statsCacheTime = Date.now();
  return stats;
};

// XÓA CACHE STATS
export const invalidateStatsCache = () => {
  statsCache = null;
  statsCacheTime = null;
};
