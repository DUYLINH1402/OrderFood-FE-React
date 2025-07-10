import { publicClient } from "../apiClient";

// LẤY DANH SÁCH CATEGORIES CHA
export const getRootCategoriesFromSQL = async () => {
  try {
    const res = await publicClient.get("/api/categories/roots");
    return res.data;
  } catch (error) {
    console.error("Lỗi khi fetch categories:", error);
    return [];
  }
};

// LẤY DANH SÁCH CATEGORIES CON
export const getCategoriesByParentFromSQL = async (parentId) => {
  const res = await publicClient.get(`/api/categories/by-parent/${parentId}`);
  return res.data;
};

// LẤY DANH MỤC THEO ID
export const getCategoryByIdFromSQL = async (categoryId) => {
  try {
    const res = await publicClient.get(`/api/categories/${categoryId}`);
    return res.data;
  } catch (error) {
    console.error(`Lỗi khi fetch category với ID (${categoryId}):`, error);
    return null;
  }
};

// LẤY DANH MỤC THEO SLUG
export const getCategoryBySlugFromSQL = async (slug) => {
  try {
    const res = await publicClient.get(`/api/categories/slug/${slug}`);
    return res.data;
  } catch (error) {
    console.error(`Lỗi khi fetch category với slug (${slug}):`, error);
    return null;
  }
};

// LẤY DANH SÁCH DANH MỤC CON THEO SLUG CHA
export const getCategoriesByParentSlugFromSQL = async (slug) => {
  try {
    const res = await publicClient.get(`/api/categories/by-parent-slug/${slug}`);
    return res.data;
  } catch (error) {
    console.error(`Lỗi khi fetch child categories với slug (${slug}):`, error);
    return [];
  }
};
