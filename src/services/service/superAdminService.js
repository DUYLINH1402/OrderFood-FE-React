import {
  toggleFoodProtectedApi,
  toggleUserProtectedApi,
  toggleBlogProtectedApi,
  toggleBlogCategoryProtectedApi,
} from "../api/superAdminApi";

// ===================== TOGGLE BẢO VỆ DỮ LIỆU =====================

export const toggleFoodProtected = async (id, isProtected) => {
  return await toggleFoodProtectedApi(id, isProtected);
};

export const toggleUserProtected = async (id, isProtected) => {
  return await toggleUserProtectedApi(id, isProtected);
};

export const toggleBlogProtected = async (id, isProtected) => {
  return await toggleBlogProtectedApi(id, isProtected);
};

export const toggleBlogCategoryProtected = async (id, isProtected) => {
  return await toggleBlogCategoryProtectedApi(id, isProtected);
};

// ===================== HELPER: KIỂM TRA LỖI BẢO VỆ =====================

/**
 * Kiểm tra xem lỗi API có phải do dữ liệu được bảo vệ hay không
 * @param {Error} error - Lỗi từ API call
 * @returns {boolean}
 */
export const isProtectedDataError = (error) => {
  return error?.response?.data?.errorCode === "PROTECTED_DATA_ACCESS_DENIED";
};

/**
 * Lấy thông báo lỗi phù hợp cho dữ liệu được bảo vệ
 * @param {Error} error - Lỗi từ API call
 * @returns {string}
 */
export const getProtectedDataErrorMessage = (error) => {
  if (isProtectedDataError(error)) {
    return "Dữ liệu được bảo vệ, chỉ Super Admin mới có quyền thực hiện thao tác này";
  }
  return error?.response?.data?.message || "Có lỗi xảy ra";
};
