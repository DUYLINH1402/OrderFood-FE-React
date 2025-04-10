const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// LẤY DANH SÁCH MÓN MỚI
export const getNewFoodsFromSQL = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/foods/new`);
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
export const getFeaturedFoodsFromSQL = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/foods/featured`);
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
export const getBestSellerFoodsFromSQL = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/foods/bestsellers`);
    if (!response.ok) {
      throw new Error("Failed to fetch best seller foods");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi khi lấy món ăn được ưa thích:", error.message);
    return [];
  }
};
