import {
  getBlogsFromSQL,
  getFeaturedBlogsFromSQL,
  searchBlogsFromSQL,
  getBlogBySlugFromSQL,
  getRelatedBlogsFromSQL,
  getBlogCategoriesFromSQL,
  getBlogCategoryBySlugFromSQL,
  getBlogsByCategoryFromSQL,
} from "../api/blogApi";

// LẤY DANH SÁCH BÀI VIẾT CÔNG KHAI (có phân trang)
export const getBlogs = async (page = 0, size = 10, sort = "publishedAt,desc") => {
  return await getBlogsFromSQL(page, size, sort);
};

// LẤY DANH SÁCH BÀI VIẾT NỔI BẬT
export const getFeaturedBlogs = async (limit = 6) => {
  return await getFeaturedBlogsFromSQL(limit);
};

// TÌM KIẾM BÀI VIẾT
export const searchBlogs = async (keyword, page = 0, size = 10) => {
  return await searchBlogsFromSQL(keyword, page, size);
};

// LẤY CHI TIẾT BÀI VIẾT THEO SLUG
export const getBlogBySlug = async (slug) => {
  return await getBlogBySlugFromSQL(slug);
};

// LẤY BÀI VIẾT LIÊN QUAN
export const getRelatedBlogs = async (id, limit = 4) => {
  return await getRelatedBlogsFromSQL(id, limit);
};

// LẤY DANH SÁCH DANH MỤC
export const getBlogCategories = async () => {
  return await getBlogCategoriesFromSQL();
};

// LẤY CHI TIẾT DANH MỤC THEO SLUG
export const getBlogCategoryBySlug = async (slug) => {
  return await getBlogCategoryBySlugFromSQL(slug);
};

// LẤY BÀI VIẾT THEO DANH MỤC
export const getBlogsByCategory = async (categorySlug, page = 0, size = 10) => {
  return await getBlogsByCategoryFromSQL(categorySlug, page, size);
};
