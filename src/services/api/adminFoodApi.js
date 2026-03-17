import { apiClient } from "../apiClient";

// BASE URL: /api/admin/foods

// LẤY DANH SÁCH MÓN ĂN VỚI BỘ LỌC (dùng chung API /api/foods/management)
export const getAdminFoodsFromSQL = async (params = {}) => {
  try {
    const { page = 0, size = 12, categoryId, status, name, isActive } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("size", size);

    if (name && name.trim()) {
      queryParams.append("name", name.trim());
    }

    if (status && status !== "ALL") {
      queryParams.append("status", status);
    }

    if (categoryId && categoryId !== "ALL") {
      const parsedCategoryId = parseInt(categoryId, 10);
      if (!isNaN(parsedCategoryId)) {
        queryParams.append("categoryId", parsedCategoryId);
      }
    }

    if (typeof isActive === "boolean") {
      queryParams.append("isActive", isActive);
    }

    const response = await apiClient.get(
      `/api/v1/staff/foods/management?${queryParams.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Loi khi lay danh sach mon an cho admin:", error.message);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
};

// LẤY CHI TIẾT MÓN ĂN THEO ID
export const getFoodByIdFromSQL = async (foodId) => {
  try {
    const response = await apiClient.get(`/api/v1/admin/foods/${foodId}`);
    return response.data;
  } catch (error) {
    console.error(`Loi khi lay chi tiet mon an (${foodId}):`, error.message);
    throw error;
  }
};

// TẠO MÓN ĂN MỚI
// API: POST /api/admin/foods
// Body: FoodRequest (multipart/form-data)
export const createFoodFromSQL = async (foodData) => {
  try {
    const formData = new FormData();

    // Thêm các trường thông tin món ăn
    formData.append("name", foodData.name);
    formData.append("price", foodData.price);
    formData.append("categoryId", foodData.categoryId);

    if (foodData.description) {
      formData.append("description", foodData.description);
    }
    if (foodData.slug) {
      formData.append("slug", foodData.slug);
    }
    if (typeof foodData.isBestSeller === "boolean") {
      formData.append("isBestSeller", foodData.isBestSeller);
    }
    if (typeof foodData.isFeatured === "boolean") {
      formData.append("isFeatured", foodData.isFeatured);
    }
    if (typeof foodData.isNew === "boolean") {
      formData.append("isNew", foodData.isNew);
    }
    if (foodData.status) {
      formData.append("status", foodData.status);
    }

    // Thêm file ảnh nếu có
    if (foodData.image instanceof File) {
      formData.append("image", foodData.image);
    }

    const response = await apiClient.post("/api/v1/admin/foods", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Loi khi tao mon an moi:", error.message);
    throw error;
  }
};

// CẬP NHẬT THÔNG TIN MÓN ĂN
// API: PUT /api/admin/foods/{id}
// Body: FoodRequest (multipart/form-data)
export const updateFoodFromSQL = async (foodId, foodData) => {
  try {
    const formData = new FormData();

    formData.append("name", foodData.name);
    formData.append("price", foodData.price);
    formData.append("categoryId", foodData.categoryId);

    if (foodData.description) {
      formData.append("description", foodData.description);
    }
    if (foodData.slug) {
      formData.append("slug", foodData.slug);
    }
    if (typeof foodData.isBestSeller === "boolean") {
      formData.append("isBestSeller", foodData.isBestSeller);
    }
    if (typeof foodData.isFeatured === "boolean") {
      formData.append("isFeatured", foodData.isFeatured);
    }
    if (typeof foodData.isNew === "boolean") {
      formData.append("isNew", foodData.isNew);
    }
    if (foodData.status) {
      formData.append("status", foodData.status);
    }

    // Thêm file ảnh mới nếu có
    if (foodData.image instanceof File) {
      formData.append("image", foodData.image);
    }

    const response = await apiClient.put(`/api/v1/admin/foods/${foodId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Loi khi cap nhat mon an (${foodId}):`, error.message);
    throw error;
  }
};

// CẬP NHẬT TRẠNG THÁI MÓN ĂN
// API: PATCH /api/admin/foods/{id}/status
// Body: FoodStatusUpdateRequest
export const updateFoodStatusFromSQL = async (foodId, statusData) => {
  try {
    const response = await apiClient.patch(`/api/v1/admin/foods/${foodId}/status`, statusData);
    return response.data;
  } catch (error) {
    console.error(`Loi khi cap nhat trang thai mon an (${foodId}):`, error.message);
    throw error;
  }
};

// XÓA MÓN ĂN
// API: DELETE /api/admin/foods/{id}
export const deleteFoodFromSQL = async (foodId) => {
  try {
    const response = await apiClient.delete(`/api/v1/admin/foods/${foodId}`);
    return response.data;
  } catch (error) {
    console.error(`Loi khi xoa mon an (${foodId}):`, error.message);
    throw error;
  }
};

// UPLOAD ẢNH MÓN ĂN LÊN S3
// API: POST /api/admin/foods/upload
export const uploadFoodImageFromSQL = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/api/v1/admin/foods/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Loi khi upload anh mon an:", error.message);
    throw error;
  }
};
