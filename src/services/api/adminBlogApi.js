import apiClient, { publicClient } from "../apiClient";

// ===================== ADMIN BLOG APIs =====================

// LẤY DANH SÁCH BÀI VIẾT (ADMIN)
export const getAdminBlogsApi = async (params = {}) => {
  try {
    const response = await apiClient.get("/api/admin/blogs", { params });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài viết:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải danh sách bài viết",
    };
  }
};

// LẤY CHI TIẾT BÀI VIẾT THEO ID (ADMIN)
export const getAdminBlogByIdApi = async (id) => {
  try {
    const response = await apiClient.get(`/api/admin/blogs/${id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết bài viết:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải chi tiết bài viết",
    };
  }
};

// TẠO BÀI VIẾT MỚI
export const createAdminBlogApi = async (blogData) => {
  try {
    const response = await apiClient.post("/api/admin/blogs", blogData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi tạo bài viết:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tạo bài viết",
      errorCode: error.response?.data?.errorCode,
    };
  }
};

// CẬP NHẬT BÀI VIẾT
export const updateAdminBlogApi = async (id, blogData) => {
  try {
    const response = await apiClient.put(`/api/admin/blogs/${id}`, blogData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật bài viết:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật bài viết",
      errorCode: error.response?.data?.errorCode,
    };
  }
};

// XÓA BÀI VIẾT
export const deleteAdminBlogApi = async (id) => {
  try {
    await apiClient.delete(`/api/admin/blogs/${id}`);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Lỗi khi xóa bài viết:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể xóa bài viết",
    };
  }
};

// CẬP NHẬT TRẠNG THÁI BÀI VIẾT
export const updateBlogStatusApi = async (id, status) => {
  try {
    const response = await apiClient.patch(`/api/admin/blogs/${id}/status`, null, {
      params: { status },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật trạng thái",
    };
  }
};

// ===================== ADMIN CATEGORY APIs =====================

// LẤY DANH SÁCH DANH MỤC (ADMIN - bao gồm cả inactive)
export const getAdminCategoriesApi = async () => {
  try {
    const response = await apiClient.get("/api/admin/blogs/categories");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải danh mục",
    };
  }
};

// LẤY DANH SÁCH DANH MỤC (PUBLIC - chỉ active)
export const getPublicCategoriesApi = async () => {
  try {
    const response = await publicClient.get("/api/blogs/categories");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải danh mục",
    };
  }
};

// LẤY CHI TIẾT DANH MỤC THEO ID
export const getAdminCategoryByIdApi = async (id) => {
  try {
    const response = await apiClient.get(`/api/admin/blogs/categories/${id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết danh mục:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải chi tiết danh mục",
    };
  }
};

// TẠO DANH MỤC MỚI
export const createAdminCategoryApi = async (categoryData) => {
  try {
    const response = await apiClient.post("/api/admin/blogs/categories", categoryData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi tạo danh mục:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tạo danh mục",
      errorCode: error.response?.data?.errorCode,
    };
  }
};

// CẬP NHẬT DANH MỤC
export const updateAdminCategoryApi = async (id, categoryData) => {
  try {
    const response = await apiClient.put(`/api/admin/blogs/categories/${id}`, categoryData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật danh mục",
      errorCode: error.response?.data?.errorCode,
    };
  }
};

// XÓA DANH MỤC
export const deleteAdminCategoryApi = async (id) => {
  try {
    await apiClient.delete(`/api/admin/blogs/categories/${id}`);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Lỗi khi xóa danh mục:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể xóa danh mục",
      errorCode: error.response?.data?.errorCode,
    };
  }
};
