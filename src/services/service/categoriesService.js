const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";

import {
  getRootCategoriesFromSQL,
  getCategoriesByParentFromSQL,
  getCategoryByIdFromSQL,
  getCategoryBySlugFromSQL,
  getCategoriesByParentSlugFromSQL,
} from "../api/categoriesApi.js";

// LẤY DANH SÁCH CATEGORIES CHA
export const getRootCategories = async () => {
  return useFirebase ? await getCategoriesFromFirebase() : await getRootCategoriesFromSQL();
};

// LẤY DANH SÁCH CATEGORIES CON
export const getCategoriesByParent = async (parentId) => {
  return useFirebase
    ? await getCategoriesByParentFromFirebase(parentId)
    : await getCategoriesByParentFromSQL(parentId);
};

// LẤY DANH MỤC THEO ID
export const getCategoryById = async (categoryId) => {
  return useFirebase
    ? await getCategoryByIdFromFirebase(categoryId)
    : await getCategoryByIdFromSQL(categoryId);
};

// LẤY DANH MỤC THEO SLUG
export const getCategoryBySlug = async (slug) => {
  return useFirebase
    ? null // Nếu cần hỗ trợ Firebase thì thêm sau
    : await getCategoryBySlugFromSQL(slug);
};

// LẤY DANH MỤC CON THEO SLUG CHA
export const getCategoriesByParentSlug = async (slug) => {
  return useFirebase ? null : await getCategoriesByParentSlugFromSQL(slug);
};
