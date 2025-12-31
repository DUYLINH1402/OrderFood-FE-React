import { apiClient } from "../apiClient";

/**
 * Admin Employee API - Dành cho admin quản lý nhân viên
 * Base URL: /api/admin/employees
 * Nhân viên là user có role ROLE_STAFF
 */

/**
 * Lấy danh sách nhân viên (có phân trang, filter)
 * @param {Object} params - Tham số tìm kiếm
 * @param {string} params.keyword - Từ khóa tìm kiếm (username, email, fullName, phoneNumber)
 * @param {boolean} params.isActive - Filter theo trạng thái active
 * @param {number} params.page - Số trang (bắt đầu từ 0)
 * @param {number} params.size - Số lượng mỗi trang
 * @param {string} params.sortBy - Trường sắp xếp
 * @param {string} params.sortDir - Hướng sắp xếp (asc/desc)
 */
export const getAdminEmployeesApi = async (params = {}) => {
  try {
    const response = await apiClient.get("/api/admin/employees", { params });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nhân viên:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải danh sách nhân viên",
      data: null,
    };
  }
};

/**
 * Lấy chi tiết nhân viên theo ID
 * @param {number} id - ID nhân viên
 */
export const getAdminEmployeeByIdApi = async (id) => {
  try {
    const response = await apiClient.get(`/api/admin/employees/${id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết nhân viên:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tải thông tin nhân viên",
      data: null,
    };
  }
};

/**
 * Tạo nhân viên mới
 * @param {Object} data - Thông tin nhân viên
 * @param {string} data.username - Tên đăng nhập (3-50 ký tự)
 * @param {string} data.email - Email
 * @param {string} data.password - Mật khẩu (6-100 ký tự)
 * @param {string} data.fullName - Họ tên (tối đa 100 ký tự)
 * @param {string} data.phoneNumber - Số điện thoại (tối đa 20 ký tự)
 * @param {string} data.address - Địa chỉ (tối đa 255 ký tự)
 * @param {string} data.avatarUrl - URL avatar
 * @param {boolean} data.isActive - Trạng thái active
 * @param {boolean} data.isVerified - Trạng thái verified
 * Note: roleCode luôn là ROLE_STAFF, được set ở backend
 */
export const createAdminEmployeeApi = async (data) => {
  try {
    const response = await apiClient.post("/api/admin/employees", data);
    console.log("Tạo nhân viên thành công:", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi tạo nhân viên:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tạo nhân viên",
      data: null,
    };
  }
};

/**
 * Cập nhật thông tin nhân viên
 * @param {number} id - ID nhân viên
 * @param {Object} data - Thông tin cần cập nhật
 * Note: Không cho phép thay đổi role thông qua API employees
 */
export const updateAdminEmployeeApi = async (id, data) => {
  try {
    const response = await apiClient.put(`/api/admin/employees/${id}`, data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật nhân viên:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật nhân viên",
      data: null,
    };
  }
};

/**
 * Xóa nhân viên
 * @param {number} id - ID nhân viên cần xóa
 */
export const deleteAdminEmployeeApi = async (id) => {
  try {
    await apiClient.delete(`/api/admin/employees/${id}`);
    return {
      success: true,
      message: "Xóa nhân viên thành công",
    };
  } catch (error) {
    console.error("Lỗi khi xóa nhân viên:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể xóa nhân viên",
    };
  }
};

/**
 * Cập nhật trạng thái nhân viên (khóa/mở khóa)
 * @param {number} id - ID nhân viên
 * @param {Object} data - Thông tin trạng thái
 * @param {boolean} data.isActive - Trạng thái active
 * @param {boolean} data.isVerified - Trạng thái verified
 */
export const updateAdminEmployeeStatusApi = async (id, data) => {
  try {
    const response = await apiClient.put(`/api/admin/employees/${id}/status`, data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái nhân viên:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật trạng thái nhân viên",
      data: null,
    };
  }
};

/**
 * Reset mật khẩu nhân viên (gửi email reset password)
 * @param {number} userId - ID nhân viên
 */
export const resetAdminEmployeePasswordApi = async (userId) => {
  try {
    const response = await apiClient.post(`/api/admin/employees/${userId}/reset-password`);
    return {
      success: true,
      data: response.data,
      message: "Đã gửi email reset mật khẩu thành công",
    };
  } catch (error) {
    console.error("Lỗi khi reset mật khẩu nhân viên:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể gửi email reset mật khẩu",
      data: null,
    };
  }
};

// Export default object
const adminEmployeeApi = {
  getEmployees: getAdminEmployeesApi,
  getEmployeeById: getAdminEmployeeByIdApi,
  createEmployee: createAdminEmployeeApi,
  updateEmployee: updateAdminEmployeeApi,
  deleteEmployee: deleteAdminEmployeeApi,
  updateEmployeeStatus: updateAdminEmployeeStatusApi,
  resetEmployeePassword: resetAdminEmployeePasswordApi,
};

export default adminEmployeeApi;
