const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// LẤY DANH SÁCH CATEGORIES CHA
export const getRootCategoriesFromSQL = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/categories/roots`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return await res.json();
  } catch (error) {
    console.error("Lỗi khi fetch categories:", error);
    return [];
  }
};

// LẤY DANH SÁCH CATEGORIES CON
export const getCategoriesByParentFromSQL = async (parentId) => {
  const res = await fetch(`${BASE_URL}/api/categories/by-parent/${parentId}`);
  if (!res.ok) throw new Error("Failed to fetch child categories");
  return await res.json();
};

// LẤY DANH MỤC THEO ID
export const getCategoryByIdFromSQL = async (categoryId) => {
  try {
    const res = await fetch(`${BASE_URL}/api/categories/${categoryId}`);
    if (!res.ok) throw new Error(`Failed to fetch category with ID: ${categoryId}`);
    return await res.json();
  } catch (error) {
    console.error(`Lỗi khi fetch category với ID (${categoryId}):`, error);
    return null;
  }
};
