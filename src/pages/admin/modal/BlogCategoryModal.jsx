import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getAdminCategoriesApi,
  createAdminCategoryApi,
  updateAdminCategoryApi,
  deleteAdminCategoryApi,
} from "../../../services/api/adminBlogApi";
import {
  getSuperAdminCategoriesApi,
  createSuperAdminCategoryApi,
  updateSuperAdminCategoryApi,
  deleteSuperAdminCategoryApi,
} from "../../../services/api/superAdminApi";
import { toggleBlogCategoryProtected } from "../../../services/service/superAdminService";
import { useAuth } from "../../../hooks/auth/useAuth";
import { ROLES } from "../../../utils/roleConfig";
import { useConfirm } from "../../../components/ConfirmModal";

// Hàm tạo slug từ name
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

const BlogCategoryModal = ({ isOpen, onClose }) => {
  const confirm = useConfirm();
  const { userRole } = useAuth();
  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;

  // Chọn API dựa trên role
  const getCategoriesApiCall = isSuperAdmin ? getSuperAdminCategoriesApi : getAdminCategoriesApi;
  const createCategoryApiCall = isSuperAdmin ? createSuperAdminCategoryApi : createAdminCategoryApi;
  const updateCategoryApiCall = isSuperAdmin ? updateSuperAdminCategoryApi : updateAdminCategoryApi;
  const deleteCategoryApiCall = isSuperAdmin ? deleteSuperAdminCategoryApi : deleteAdminCategoryApi;

  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Data states
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    displayOrder: 0,
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCategoriesApiCall();
      if (response.success) {
        setCategories(response.data || []);
      } else {
        toast.error(response.message || "Không thể tải danh mục");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
      toast.error("Đã xảy ra lỗi khi tải danh mục");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on open
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setShowForm(false);
      setEditingCategory(null);
      resetForm();
    }
  }, [isOpen, fetchCategories]);

  // Animation
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Handle close
  const handleClose = useCallback(() => {
    if (saving) return;
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  }, [saving, onClose]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !saving) {
        if (showForm) {
          handleCancelForm();
        } else {
          handleClose();
        }
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, showForm, saving, handleClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      displayOrder: categories.length + 1,
      isActive: true,
    });
    setErrors({});
  };

  // Handle input change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Handle name change with auto slug
  const handleNameChange = (value) => {
    handleChange("name", value);
    if (!editingCategory || !formData.slug) {
      handleChange("slug", generateSlug(value));
    }
  };

  // Open create form
  const handleOpenCreateForm = () => {
    setEditingCategory(null);
    resetForm();
    setFormData((prev) => ({
      ...prev,
      displayOrder: categories.length + 1,
    }));
    setShowForm(true);
    // Trigger animation after render
    setTimeout(() => setFormVisible(true), 20);
  };

  // Open edit form
  const handleOpenEditForm = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive !== false,
    });
    setErrors({});
    setShowForm(true);
    // Trigger animation after render
    setTimeout(() => setFormVisible(true), 20);
  };

  // Cancel form with animation
  const handleCancelForm = () => {
    setFormVisible(false);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setShowForm(false);
      setEditingCategory(null);
      resetForm();
    }, 300);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên danh mục";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || undefined,
        description: formData.description || undefined,
        displayOrder: formData.displayOrder,
        isActive: formData.isActive,
      };

      let response;
      if (editingCategory) {
        response = await updateCategoryApiCall(editingCategory.id, payload);
      } else {
        response = await createCategoryApiCall(payload);
      }

      if (response.success) {
        toast.success(editingCategory ? "Cập nhật danh mục thành công" : "Tạo danh mục thành công");
        handleCancelForm();
        fetchCategories();
      } else {
        toast.error(response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Lỗi khi lưu danh mục:", error);
      toast.error("Đã xảy ra lỗi khi lưu danh mục");
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = (category) => {
    if (category.blogCount > 0) {
      toast.warning(`Không thể xóa danh mục có ${category.blogCount} bài viết`);
      return;
    }

    confirm({
      title: "Xác nhận xóa danh mục",
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn xóa danh mục <strong>"{category.name}"</strong>?
          </p>
          <p className="text-red-500 text-sm mt-2">Hành động này không thể hoàn tác!</p>
        </div>
      ),
      onOk: async () => {
        try {
          const response = await deleteCategoryApiCall(category.id);
          if (response.success) {
            toast.success("Xóa danh mục thành công");
            fetchCategories();
          } else {
            toast.error(response.message || "Không thể xóa danh mục");
          }
        } catch (error) {
          console.error("Lỗi khi xóa danh mục:", error);
          toast.error("Đã xảy ra lỗi khi xóa danh mục");
        }
      },
    });
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full max-w-4xl bg-white rounded-xl shadow-2xl transform transition-all duration-300 ${
            isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
          onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quản lý danh mục</h2>
              <p className="text-sm text-gray-500 mt-0.5">Thêm, sửa, xóa các danh mục bài viết</p>
            </div>
            <button
              onClick={handleClose}
              disabled={saving}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Form */}
            {showForm && (
              <div
                className={`mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 ease-out transform origin-top ${
                  formVisible
                    ? "opacity-100 translate-y-0 scale-y-100"
                    : "opacity-0 -translate-y-2 scale-y-95"
                }`}>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                </h3>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên danh mục <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="VD: Khuyến mãi"
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        errors.name ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleChange("slug", e.target.value)}
                      placeholder="khuyen-mai"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Mô tả ngắn về danh mục"
                      rows={2}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* Display Order & Active */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thứ tự hiển thị
                      </label>
                      <input
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) =>
                          handleChange("displayOrder", parseInt(e.target.value) || 0)
                        }
                        min={0}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => handleChange("isActive", e.target.checked)}
                          className="w-6 h-6 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Đang hoạt động</span>
                      </label>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={handleCancelForm}
                      disabled={saving}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                      Hủy
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                      {saving ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-6 h-6 mr-1.5 -ml-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {editingCategory ? "Cập nhật" : "Thêm"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Button */}
            {!showForm && (
              <div className="mb-4">
                <button
                  onClick={handleOpenCreateForm}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <svg
                    className="w-6 h-6 mr-2 -ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Thêm danh mục
                </button>
              </div>
            )}

            {/* Categories List */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-48"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có danh mục</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Hãy thêm danh mục đầu tiên để phân loại bài viết.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {categories
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((category) => (
                    <div
                      key={category.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        !category.isActive
                          ? "bg-gray-100 border-gray-200"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {category.name}
                            </h4>
                            {!category.isActive && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-gray-200 text-gray-600">
                                Ẩn
                              </span>
                            )}
                            {category.isProtected && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                🛡️ Bảo vệ
                              </span>
                            )}
                            <span className="text-sm text-gray-400">#{category.displayOrder}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5 truncate">
                            {category.description || "Không có mô tả"}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                            <span className="flex items-center">
                              <svg
                                className="w-6 h-6 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                                />
                              </svg>
                              {category.blogCount || 0} bài viết
                            </span>
                            <span className="text-gray-300">|</span>
                            <span className="font-mono">/blogs/categories/{category.slug}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          {isSuperAdmin && (
                            <button
                              onClick={async () => {
                                try {
                                  await toggleBlogCategoryProtected(
                                    category.id,
                                    !category.isProtected
                                  );
                                  toast.success(
                                    category.isProtected
                                      ? "Đã bỏ bảo vệ danh mục"
                                      : "Đã bảo vệ danh mục"
                                  );
                                  fetchCategories();
                                } catch (error) {
                                  toast.error("Không thể thay đổi trạng thái bảo vệ");
                                }
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                category.isProtected
                                  ? "text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                                  : "text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                              }`}
                              title={category.isProtected ? "Bỏ bảo vệ" : "Bảo vệ danh mục"}>
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditForm(category)}
                            className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Chỉnh sửa">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="#5173ac"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            disabled={category.blogCount > 0}
                            className={`p-1.5 rounded-lg transition-colors ${
                              category.blogCount > 0
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                            }`}
                            title={
                              category.blogCount > 0 ? "Không thể xóa danh mục có bài viết" : "Xóa"
                            }>
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              onClick={handleClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCategoryModal;
