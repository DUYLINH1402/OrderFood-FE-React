import { publicClient } from "../apiClient";

// LẤY DANH SÁCH MÓN MỚI
export const getNewFoodsFromSQL = async (page = 0, size = 12) => {
  try {
    const response = await publicClient.get(`/api/foods/new?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách món mới:", error.message);
    return []; // hoặc có thể throw lại nếu muốn component xử lý
  }
};

// LẤY DANH SÁCH MÓN NGON
export const getFeaturedFoodsFromSQL = async (page = 0, size = 12) => {
  try {
    const response = await publicClient.get(`/api/foods/featured?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách món ngon:", error.message);
    return [];
  }
};

// LẤY DANH SÁCH MÓN ĐƯỢC ƯA THÍCH
export const getBestSellerFoodsFromSQL = async (page = 0, size = 12) => {
  try {
    const response = await publicClient.get(`/api/foods/bestsellers?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy món ăn được ưa thích:", error.message);
    return [];
  }
};

// LẤY TẤT CẢ MÓN ĂN
export const getAllFoodsFromSQL = async (page = 0, size = 12) => {
  try {
    const response = await publicClient.get(`/api/foods?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy tất cả món ăn:", error.message);
    return [];
  }
};

// LẤY MÓN ĂN THEO DANH MỤC
export const getFoodsByCategoryIDFromSQL = async (categoryId, page = 0, size = 12) => {
  try {
    const response = await publicClient.get(
      `/api/foods/by-category/${categoryId}?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy món ăn theo danh mục (${categoryId}):`, error.message);
    return [];
  }
};

// LẤY MÓN ĂN THEO DANH MỤC BẰNG SLUG
export const getFoodsByCategorySlugFromSQL = async (slug, page = 0, size = 12) => {
  try {
    const response = await publicClient.get(
      `/api/foods/by-category-slug/${slug}?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy món ăn theo danh mục (${slug}):`, error.message);
    return [];
  }
};

// LẤY CHI TIẾT MÓN ĂN THEO SLUG
export const getFoodBySlugFromSQL = async (slug) => {
  try {
    const response = await publicClient.get(`/api/foods/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết món ăn (${slug}):`, error.message);
    return null;
  }
};
