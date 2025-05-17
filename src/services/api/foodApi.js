const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// LẤY DANH SÁCH MÓN MỚI
export const getNewFoodsFromSQL = async (page = 0, size = 12) => {
  try {
    const response = await fetch(`${BASE_URL}/api/foods/new?page=${page}&size=${size}`);
    if (!response.ok) {
      throw new Error("Failed to fetch new foods");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi khi lấy danh sách món mới:", error.message);
    return []; // hoặc có thể throw lại nếu muốn component xử lý
  }
};

// LẤY DANH SÁCH MÓN NGON
export const getFeaturedFoodsFromSQL = async (page = 0, size = 12) => {
  try {
    const response = await fetch(`${BASE_URL}/api/foods/featured?page=${page}&size=${size}`);
    if (!response.ok) {
      throw new Error("Failed to fetch featured foods");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi khi lấy danh sách món ngon:", error.message);
    return [];
  }
};

// LẤY DANH SÁCH MÓN ĐƯỢC ƯA THÍCH
export const getBestSellerFoodsFromSQL = async (page = 0, size = 12) => {
  try {
    const response = await fetch(`${BASE_URL}/api/foods/bestsellers?page=${page}&size=${size}`);
    if (!response.ok) {
      throw new Error("Failed to fetch best seller foods");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi khi lấy món ăn được ưa thích:", error.message);
    return [];
  }
};

// LẤY TẤT CẢ MÓN ĂN
export const getAllFoodsFromSQL = async (page = 0, size = 12) => {
  try {
    const response = await fetch(`${BASE_URL}/api/foods?page=${page}&size=${size}`);
    if (!response.ok) {
      const text = await response.text(); // chỉ đọc khi lỗi
      console.error("Response lỗi:", text);
      throw new Error("Failed to fetch all foods");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi khi lấy tất cả món ăn:", error.message);
    return [];
  }
};

// LẤY MÓN ĂN THEO DANH MỤC
export const getFoodsByCategoryIDFromSQL = async (categoryId, page = 0, size = 12) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/foods/by-category/${categoryId}?page=${page}&size=${size}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch foods for category: ${categoryId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Lỗi khi lấy món ăn theo danh mục (${categoryId}):`, error.message);
    return [];
  }
};
// LẤY MÓN ĂN THEO DANH MỤC BẰNG SLUG
export const getFoodsByCategorySlugFromSQL = async (slug, page = 0, size = 12) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/foods/by-category-slug/${slug}?page=${page}&size=${size}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch foods for category: ${slug}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Lỗi khi lấy món ăn theo danh mục (${slug}):`, error.message);
    return [];
  }
};
// LẤY CHI TIẾT MÓN ĂN THEO SLUG
export const getFoodBySlugFromSQL = async (slug) => {
  try {
    const response = await fetch(`${BASE_URL}/api/foods/slug/${slug}`);
    if (!response.ok) {
      throw new Error(`Không thể lấy món ăn với slug: ${slug}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết món ăn (${slug}):`, error.message);
    return null;
  }
};
