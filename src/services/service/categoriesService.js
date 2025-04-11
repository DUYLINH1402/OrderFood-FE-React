const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";

import {
  getRootCategoriesFromSQL,
  getCategoriesByParentFromSQL,
  getCategoryByIdFromSQL,
} from "../api/categoriesApi";

// LẤY DANH SÁCH CATEGORIES CHA
export const getRootCategories = async () => {
  return useFirebase ? await getCategoriesFromFirebase() : await getRootCategoriesFromSQL();
};

// LẤY DANH SÁCH CATEGORIES CHA
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
