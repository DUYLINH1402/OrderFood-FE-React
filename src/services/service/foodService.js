const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";

import {
  getNewFoodsFromSQL,
  getFeaturedFoodsFromSQL,
  getBestSellerFoodsFromSQL,
  getAllFoodsFromSQL,
  getFoodsByCategoryIDFromSQL,
  getFoodsByCategorySlugFromSQL,
  getFoodBySlugFromSQL,
  updateFoodStatusFromSQL,
} from "../api/foodApi";

import {
  getNewFoodsFromFirebase,
  getFeaturedFoodsFromFirebase,
  getBestSellerFoodsFromFirebase,
  getAllFoodsFromFirebase,
  getFoodsByCategoryFromFirebase,
  getFoodBySlugFromFirebase,
} from "../firebase/foodFirebase";

// LẤY DANH SÁCH MÓN MỚI
export const getNewFoods = async (page, size) => {
  return useFirebase
    ? await getNewFoodsFromFirebase(page, size)
    : await getNewFoodsFromSQL(page, size);
};

// LẤY DANH SÁCH MÓN NGON
export const getFeaturedFoods = async (page, size) => {
  return useFirebase
    ? await getFeaturedFoodsFromFirebase(page, size)
    : await getFeaturedFoodsFromSQL(page, size);
};

// LẤY DANH SÁCH MÓN ĐƯỢC ƯA THÍCH
export const getBestSellerFoods = async (page, size) => {
  return useFirebase
    ? await getBestSellerFoodsFromFirebase(page, size)
    : await getBestSellerFoodsFromSQL(page, size);
};

// LẤY DANH SÁCH TẤT CẢ MÓN ĂN
export const getAllFoods = async (page, size) => {
  return useFirebase
    ? await getAllFoodsFromFirebase(page, size)
    : await getAllFoodsFromSQL(page, size);
};

// LẤY DANH SÁCH MÓN ĂN THEO DANH MỤC BẰNG ID
export const getFoodsByCategoryID = async (categoryId, page, size) => {
  return useFirebase
    ? await getFoodsByCategoryFromFirebase(categoryId, page, size)
    : await getFoodsByCategoryIDFromSQL(categoryId, page, size);
};
// LẤY DANH SÁCH MÓN ĂN THEO DANH MỤC BẰNG SLUG
export const getFoodsByCategorySlug = async (slug, page, size) => {
  return useFirebase
    ? await getFoodsByCategoryFromFirebase(slug, page, size)
    : await getFoodsByCategorySlugFromSQL(slug, page, size);
};
// LẤY CHI TIẾT MÓN ĂN THEO SLUG
export const getFoodBySlug = async (slug) => {
  return useFirebase ? await getFoodBySlugFromFirebase(slug) : await getFoodBySlugFromSQL(slug);
};

// CẬP NHẬT TRẠNG THÁI MÓN ĂN (CHỈ DÀNH CHO STAFF/ADMIN)
export const updateFoodStatus = async (foodId, status) => {
  // Chỉ sử dụng SQL API cho function này vì Firebase không cần update status
  return await updateFoodStatusFromSQL(foodId, status);
};
