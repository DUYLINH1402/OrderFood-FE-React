import { apiClient } from "../apiClient";

// ===================== SUPER ADMIN - PROTECTED DATA =====================

/**
 * Toggle bảo vệ món ăn
 * @param {number} id - ID món ăn
 * @param {boolean} isProtected - Trạng thái bảo vệ
 */
export const toggleFoodProtectedApi = async (id, isProtected) => {
  try {
    const response = await apiClient.patch(`/api/v1/superadmin/system/foods/${id}/protected`, {
      isProtected,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật trạng thái bảo vệ",
    };
  }
};

/**
 * Toggle bảo vệ người dùng
 * @param {number} id - ID người dùng
 * @param {boolean} isProtected - Trạng thái bảo vệ
 */
export const toggleUserProtectedApi = async (id, isProtected) => {
  try {
    const response = await apiClient.patch(`/api/v1/superadmin/system/users/${id}/protected`, {
      isProtected,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật trạng thái bảo vệ",
    };
  }
};

/**
 * Toggle bảo vệ bài viết
 * @param {number} id - ID bài viết
 * @param {boolean} isProtected - Trạng thái bảo vệ
 */
export const toggleBlogProtectedApi = async (id, isProtected) => {
  try {
    const response = await apiClient.patch(`/api/v1/superadmin/system/blogs/${id}/protected`, {
      isProtected,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật trạng thái bảo vệ",
    };
  }
};

/**
 * Toggle bảo vệ danh mục blog
 * @param {number} id - ID danh mục
 * @param {boolean} isProtected - Trạng thái bảo vệ
 */
export const toggleBlogCategoryProtectedApi = async (id, isProtected) => {
  try {
    const response = await apiClient.patch(
      `/api/v1/superadmin/system/blog-categories/${id}/protected`,
      { isProtected }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật trạng thái bảo vệ",
    };
  }
};

// ===================== SUPER ADMIN - FOODS =====================

export const getSuperAdminFoodsApi = async (params = {}) => {
  try {
    const { page = 0, size = 12, categoryId, status, name, isActive } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("size", size);

    if (name && name.trim()) queryParams.append("name", name.trim());
    if (status && status !== "ALL") queryParams.append("status", status);
    if (categoryId && categoryId !== "ALL") {
      const parsedCategoryId = parseInt(categoryId, 10);
      if (!isNaN(parsedCategoryId)) queryParams.append("categoryId", parsedCategoryId);
    }
    if (typeof isActive === "boolean") queryParams.append("isActive", isActive);

    const response = await apiClient.get(
      `/api/v1/superadmin/foods/management?${queryParams.toString()}`
    );
    return response.data;
  } catch (error) {
    return { content: [], totalElements: 0, totalPages: 0 };
  }
};

export const getSuperAdminFoodByIdApi = async (foodId) => {
  const response = await apiClient.get(`/api/v1/superadmin/foods/${foodId}`);
  return response.data;
};

export const createSuperAdminFoodApi = async (foodData) => {
  const formData = new FormData();
  formData.append("name", foodData.name);
  formData.append("price", foodData.price);
  formData.append("categoryId", foodData.categoryId);
  if (foodData.description) formData.append("description", foodData.description);
  if (foodData.slug) formData.append("slug", foodData.slug);
  if (typeof foodData.isBestSeller === "boolean")
    formData.append("isBestSeller", foodData.isBestSeller);
  if (typeof foodData.isFeatured === "boolean") formData.append("isFeatured", foodData.isFeatured);
  if (typeof foodData.isNew === "boolean") formData.append("isNew", foodData.isNew);
  if (foodData.status) formData.append("status", foodData.status);
  if (foodData.image instanceof File) formData.append("image", foodData.image);

  const response = await apiClient.post("/api/v1/superadmin/foods", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateSuperAdminFoodApi = async (foodId, foodData) => {
  const formData = new FormData();
  formData.append("name", foodData.name);
  formData.append("price", foodData.price);
  formData.append("categoryId", foodData.categoryId);
  if (foodData.description) formData.append("description", foodData.description);
  if (foodData.slug) formData.append("slug", foodData.slug);
  if (typeof foodData.isBestSeller === "boolean")
    formData.append("isBestSeller", foodData.isBestSeller);
  if (typeof foodData.isFeatured === "boolean") formData.append("isFeatured", foodData.isFeatured);
  if (typeof foodData.isNew === "boolean") formData.append("isNew", foodData.isNew);
  if (foodData.status) formData.append("status", foodData.status);
  if (foodData.image instanceof File) formData.append("image", foodData.image);

  const response = await apiClient.put(`/api/v1/superadmin/foods/${foodId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteSuperAdminFoodApi = async (foodId) => {
  const response = await apiClient.delete(`/api/v1/superadmin/foods/${foodId}`);
  return response.data;
};

export const updateSuperAdminFoodStatusApi = async (foodId, statusData) => {
  const response = await apiClient.patch(`/api/v1/superadmin/foods/${foodId}/status`, statusData);
  return response.data;
};

export const uploadSuperAdminFoodImageApi = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post("/api/v1/superadmin/foods/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// ===================== SUPER ADMIN - USERS =====================

export const getSuperAdminUsersApi = async (params = {}) => {
  try {
    const response = await apiClient.get("/api/v1/superadmin/users", { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải danh sách người dùng",
    };
  }
};

export const getSuperAdminUserByIdApi = async (id) => {
  try {
    const response = await apiClient.get(`/api/v1/superadmin/users/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải thông tin người dùng",
    };
  }
};

export const createSuperAdminUserApi = async (data) => {
  try {
    const response = await apiClient.post("/api/v1/superadmin/users", data);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tạo người dùng",
    };
  }
};

export const updateSuperAdminUserApi = async (id, data) => {
  try {
    const response = await apiClient.put(`/api/v1/superadmin/users/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật người dùng",
    };
  }
};

export const deleteSuperAdminUserApi = async (id) => {
  try {
    await apiClient.delete(`/api/v1/superadmin/users/${id}`);
    return { success: true, message: "Xóa người dùng thành công" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể xóa người dùng",
    };
  }
};

export const updateSuperAdminUserStatusApi = async (id, data) => {
  try {
    const response = await apiClient.put(`/api/v1/superadmin/users/${id}/status`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật trạng thái",
    };
  }
};

export const resetSuperAdminUserPasswordApi = async (userId) => {
  try {
    const response = await apiClient.post(`/api/v1/superadmin/users/${userId}/reset-password`);
    return { success: true, data: response.data, message: "Đã gửi email reset mật khẩu" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể gửi email reset mật khẩu",
    };
  }
};

// ===================== SUPER ADMIN - BLOGS =====================

export const getSuperAdminBlogsApi = async (params = {}) => {
  try {
    const response = await apiClient.get("/api/v1/superadmin/blogs", { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải danh sách bài viết",
    };
  }
};

export const getSuperAdminBlogByIdApi = async (id) => {
  try {
    const response = await apiClient.get(`/api/v1/superadmin/blogs/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải chi tiết bài viết",
    };
  }
};

export const createSuperAdminBlogApi = async (blogData) => {
  try {
    const response = await apiClient.post("/api/v1/superadmin/blogs", blogData);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tạo bài viết",
    };
  }
};

export const updateSuperAdminBlogApi = async (id, blogData) => {
  try {
    const response = await apiClient.put(`/api/v1/superadmin/blogs/${id}`, blogData);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật bài viết",
    };
  }
};

export const deleteSuperAdminBlogApi = async (id) => {
  try {
    await apiClient.delete(`/api/v1/superadmin/blogs/${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể xóa bài viết",
    };
  }
};

export const updateSuperAdminBlogStatusApi = async (id, status) => {
  try {
    const response = await apiClient.patch(`/api/v1/superadmin/blogs/${id}/status`, null, {
      params: { status },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật trạng thái",
    };
  }
};

// Super Admin Blog Categories
export const getSuperAdminCategoriesApi = async () => {
  try {
    const response = await apiClient.get("/api/v1/superadmin/blogs/categories");
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải danh mục",
    };
  }
};

export const createSuperAdminCategoryApi = async (categoryData) => {
  try {
    const response = await apiClient.post("/api/v1/superadmin/blogs/categories", categoryData);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tạo danh mục",
    };
  }
};

export const updateSuperAdminCategoryApi = async (id, categoryData) => {
  try {
    const response = await apiClient.put(`/api/v1/superadmin/blogs/categories/${id}`, categoryData);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật danh mục",
    };
  }
};

export const deleteSuperAdminCategoryApi = async (id) => {
  try {
    await apiClient.delete(`/api/v1/superadmin/blogs/categories/${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể xóa danh mục",
    };
  }
};

// ===================== SUPER ADMIN - ALGOLIA SEARCH =====================

export const superAdminReindexSearchApi = async () => {
  const response = await apiClient.post("/api/v1/superadmin/search/reindex");
  return response.data;
};

export const superAdminInitAlgoliaApi = async () => {
  const response = await apiClient.post("/api/v1/superadmin/search/init");
  return response.data;
};
