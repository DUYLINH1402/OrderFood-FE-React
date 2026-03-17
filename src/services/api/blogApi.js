import { publicClient } from "../apiClient";

// LẤY DANH SÁCH BÀI VIẾT CÔNG KHAI (có phân trang)
export const getBlogsFromSQL = async (page = 0, size = 10, sort = "publishedAt,desc") => {
  try {
    const response = await publicClient.get("/api/v1/public/blogs", {
      params: { page, size, sort },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài viết:", error);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
};

// LẤY DANH SÁCH BÀI VIẾT NỔI BẬT
export const getFeaturedBlogsFromSQL = async (limit = 6) => {
  try {
    const response = await publicClient.get("/api/v1/public/blogs/featured", {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy bài viết nổi bật:", error);
    return [];
  }
};

// TÌM KIẾM BÀI VIẾT
export const searchBlogsFromSQL = async (keyword, page = 0, size = 10) => {
  try {
    const response = await publicClient.get("/api/v1/public/blogs/search", {
      params: { keyword, page, size },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm bài viết:", error);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
};

// LẤY CHI TIẾT BÀI VIẾT THEO SLUG
export const getBlogBySlugFromSQL = async (slug) => {
  try {
    const response = await publicClient.get(`/api/v1/public/blogs/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết bài viết:", error);
    return null;
  }
};

// LẤY BÀI VIẾT LIÊN QUAN
export const getRelatedBlogsFromSQL = async (id, limit = 4) => {
  try {
    const response = await publicClient.get(`/api/v1/public/blogs/${id}/related`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy bài viết liên quan:", error);
    return [];
  }
};

// LẤY DANH SÁCH DANH MỤC
export const getBlogCategoriesFromSQL = async () => {
  try {
    const response = await publicClient.get("/api/v1/public/blogs/categories");
    // Đảm bảo trả về mảng, xử lý cả trường hợp API trả về object có key content/data
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch (error) {
    console.error("Lỗi khi lấy danh mục bài viết:", error);
    return [];
  }
};

// LẤY CHI TIẾT DANH MỤC THEO SLUG
export const getBlogCategoryBySlugFromSQL = async (slug) => {
  try {
    const response = await publicClient.get(`/api/v1/public/blogs/categories/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết danh mục:", error);
    return null;
  }
};

// LẤY BÀI VIẾT THEO DANH MỤC
export const getBlogsByCategoryFromSQL = async (categorySlug, page = 0, size = 10) => {
  try {
    const response = await publicClient.get(
      `/api/v1/public/blogs/categories/${categorySlug}/posts`,
      {
        params: { page, size },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy bài viết theo danh mục:", error);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
};

// =====================================================
// API CHO CÁC LOẠI NỘI DUNG BLOG (NEWS_PROMOTIONS, MEDIA_PRESS, CATERING_SERVICES)
// =====================================================

// LẤY DANH SÁCH BÀI VIẾT THEO LOẠI NỘI DUNG
export const getBlogsByTypeFromSQL = async (
  blogType,
  page = 0,
  size = 10,
  sort = "publishedAt,desc"
) => {
  try {
    const response = await publicClient.get(`/api/v1/public/blogs/type/${blogType}`, {
      params: { page, size, sort },
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy bài viết loại ${blogType}:`, error);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
};

// LẤY BÀI VIẾT NỔI BẬT THEO LOẠI
export const getFeaturedBlogsByTypeFromSQL = async (blogType, limit = 6) => {
  try {
    const response = await publicClient.get(`/api/v1/public/blogs/type/${blogType}/featured`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy bài viết nổi bật loại ${blogType}:`, error);
    return [];
  }
};

// LẤY DANH MỤC THEO LOẠI NỘI DUNG
export const getBlogCategoriesByTypeFromSQL = async (blogType) => {
  try {
    const response = await publicClient.get(`/api/v1/public/blogs/categories/type/${blogType}`);
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch (error) {
    console.error(`Lỗi khi lấy danh mục loại ${blogType}:`, error);
    return [];
  }
};
