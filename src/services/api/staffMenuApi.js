import { publicClient, apiClient } from "../apiClient";

// LẤY TẤT CẢ MÓN ĂN CHO STAFF VỚI FILTER VÀ PAGINATION (dùng API /api/foods/management)
export const getStaffMenuFromSQL = async (params = {}) => {
  try {
    const { page = 0, size = 12, categoryId, status, name } = params;

    // Xây dựng query string cho API /api/foods/management
    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("size", size);

    // Thêm filter name (tên món ăn)
    if (name && name.trim()) {
      queryParams.append("name", name.trim());
    }

    // Thêm filter status (AVAILABLE/UNAVAILABLE)
    if (status && status !== "ALL") {
      queryParams.append("status", status);
    }

    // Thêm filter categoryId (parse sang số nguyên nếu có)
    if (categoryId && categoryId !== "ALL") {
      const parsedCategoryId = parseInt(categoryId, 10);
      if (!isNaN(parsedCategoryId)) {
        queryParams.append("categoryId", parsedCategoryId);
      }
    }

    // Gọi API management dành cho Staff (cần xác thực)
    const response = await apiClient.get(`/api/foods/management?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách món ăn cho staff:", error.message);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
};

// LẤY THỐNG KÊ SỐ LƯỢNG MÓN ĂN THEO TRẠNG THÁI (TOÀN BỘ HỆ THỐNG)
// Dùng filter status với size=1 để lấy totalElements nhanh hơn
export const getFoodStatsFromSQL = async () => {
  try {
    // Gọi 3 API song song với size=1, chỉ cần lấy totalElements
    const [allResponse, availableResponse, unavailableResponse] = await Promise.all([
      apiClient.get("/api/foods/management?page=0&size=1"),
      apiClient.get("/api/foods/management?page=0&size=1&status=AVAILABLE"),
      apiClient.get("/api/foods/management?page=0&size=1&status=UNAVAILABLE"),
    ]);

    return {
      total: allResponse.data?.totalElements || 0,
      available: availableResponse.data?.totalElements || 0,
      unavailable: unavailableResponse.data?.totalElements || 0,
    };
  } catch (error) {
    console.error("Lỗi khi lấy thống kê món ăn:", error.message);
    return { total: 0, available: 0, unavailable: 0 };
  }
};

// LẤY CHI TIẾT MÓN ĂN THEO ID
export const getFoodDetailByIdFromSQL = async (foodId) => {
  try {
    const response = await apiClient.get(`/api/foods/${foodId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết món ăn (${foodId}):`, error.message);
    return null;
  }
};

// CẬP NHẬT TRẠNG THÁI MÓN ĂN VỚI GHI CHÚ
// API: PATCH /api/foods/{id}/status
// Body: FoodStatusUpdateRequest { status, isActive, statusNote }
export const updateFoodStatusWithNoteFromSQL = async (foodId, status, statusNote = "") => {
  try {
    const response = await apiClient.patch(`/api/foods/${foodId}/status`, {
      status: status,
      statusNote: statusNote,
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật trạng thái món ăn (${foodId}):`, error.message);
    throw error;
  }
};

// LẤY DANH SÁCH MÓN BÁN CHẠY
export const getBestSellerFoodsFromSQL = async (limit = 10) => {
  try {
    const response = await publicClient.get(`/api/foods/bestsellers?size=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy món bán chạy:", error.message);
    return [];
  }
};

// LẤY DANH SÁCH MÓN ĐẶC BIỆT
export const getFeaturedFoodsFromSQL = async (limit = 10) => {
  try {
    const response = await publicClient.get(`/api/foods/featured?size=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy món đặc biệt:", error.message);
    return [];
  }
};

// LẤY DANH SÁCH COMBO/PROMOTION ĐANG CÓ
export const getActivePromotionsFromSQL = async () => {
  try {
    const response = await publicClient.get("/api/coupons/active");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy khuyến mãi:", error.message);
    return [];
  }
};

// LẤY LỊCH SỬ THAY ĐỔI TRẠNG THÁI CỦA STAFF
export const getStaffMenuHistoryFromSQL = async (page = 0, size = 20) => {
  try {
    const response = await apiClient.get(`/api/staff/foods/history?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử thay đổi:", error.message);
    return { success: false, data: [], message: "Không thể tải lịch sử" };
  }
};

// TÌM KIẾM MÓN ĂN
export const searchFoodsFromSQL = async (keyword, page = 0, size = 50) => {
  try {
    const response = await publicClient.get(
      `/api/foods/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm món ăn:", error.message);
    return { success: false, data: [], message: "Không thể tìm kiếm" };
  }
};

// LẤY DANH SÁCH DANH MỤC
export const getCategoriesFromSQL = async () => {
  try {
    const response = await publicClient.get("/api/categories");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error.message);
    return [];
  }
};
