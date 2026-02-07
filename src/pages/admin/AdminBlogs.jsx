import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getAdminBlogsApi,
  deleteAdminBlogApi,
  updateBlogStatusApi,
  getAdminCategoriesApi,
} from "../../services/api/adminBlogApi";
import BlogFormModal from "./modal/BlogFormModal";
import BlogDetailModal from "./modal/BlogDetailModal";
import BlogCategoryModal from "./modal/BlogCategoryModal";
import { useConfirm } from "../../components/ConfirmModal";

// Status config
const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "DRAFT", label: "Bản nháp" },
  { value: "PUBLISHED", label: "Đã xuất bản" },
  { value: "ARCHIVED", label: "Đã lưu trữ" },
];

// Hàm lấy màu badge theo trạng thái
const getStatusBadgeConfig = (status) => {
  switch (status) {
    case "PUBLISHED":
      return { bg: "bg-green-100", text: "text-green-800", label: "Đã xuất bản" };
    case "DRAFT":
      return { bg: "bg-yellow-100", text: "text-yellow-800", label: "Bản nháp" };
    case "ARCHIVED":
      return { bg: "bg-gray-100", text: "text-gray-800", label: "Đã lưu trữ" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", label: status };
  }
};

// Format ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return "Chưa có";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminBlogs = () => {
  const confirm = useConfirm();

  // State cho danh sách blogs
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho phân trang
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // State cho filter/search
  const [filters, setFilters] = useState({
    title: "",
    status: "",
    categoryId: "",
    sortBy: "createdAt",
    sortDir: "desc",
  });

  // State cho search input (debounce)
  const [searchInput, setSearchInput] = useState("");

  // State cho modals
  const [formModal, setFormModal] = useState({ open: false, blog: null });
  const [detailModal, setDetailModal] = useState({ open: false, blogId: null });
  const [categoryModal, setCategoryModal] = useState({ open: false });

  // Fetch danh mục
  const fetchCategories = useCallback(async () => {
    try {
      const response = await getAdminCategoriesApi();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
    }
  }, []);

  // Fetch danh sách blogs
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        sort: `${filters.sortBy},${filters.sortDir}`,
      };

      // Thêm các filter nếu có giá trị
      if (filters.title) params.title = filters.title;
      if (filters.status) params.status = filters.status;
      if (filters.categoryId) params.categoryId = filters.categoryId;

      const response = await getAdminBlogsApi(params);

      if (response.success && response.data) {
        setBlogs(response.data.content || []);
        setPagination((prev) => ({
          ...prev,
          totalElements: response.data.totalElements || 0,
          totalPages: response.data.totalPages || 0,
        }));
      } else {
        toast.error(response.message || "Không thể tải danh sách bài viết");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách bài viết:", error);
      toast.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, filters]);

  // Fetch khi mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch khi filters/pagination thay đổi
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, title: searchInput }));
      setPagination((prev) => ({ ...prev, page: 0 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Xử lý thay đổi filter
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  // Xử lý phân trang
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Mở modal tạo mới
  const handleOpenCreateModal = () => {
    setFormModal({ open: true, blog: null });
  };

  // Mở modal chỉnh sửa
  const handleOpenEditModal = (blog) => {
    setFormModal({ open: true, blog });
  };

  // Đóng form modal
  const handleCloseFormModal = () => {
    setFormModal({ open: false, blog: null });
  };

  // Mở modal xem chi tiết
  const handleViewDetail = (blogId) => {
    setDetailModal({ open: true, blogId });
  };

  // Đóng detail modal
  const handleCloseDetailModal = () => {
    setDetailModal({ open: false, blogId: null });
  };

  // Mở modal quản lý danh mục
  const handleOpenCategoryModal = () => {
    setCategoryModal({ open: true });
  };

  // Đóng category modal
  const handleCloseCategoryModal = () => {
    setCategoryModal({ open: false });
    fetchCategories(); // Refresh categories
  };

  // Xử lý sau khi tạo/cập nhật thành công
  const handleFormSuccess = () => {
    fetchBlogs();
  };

  // Xử lý thay đổi trạng thái
  const handleStatusChange = async (blog, newStatus) => {
    try {
      const response = await updateBlogStatusApi(blog.id, newStatus);
      if (response.success) {
        const statusLabel = STATUS_OPTIONS.find((s) => s.value === newStatus)?.label || newStatus;
        toast.success(`Đã chuyển trạng thái sang "${statusLabel}"`);
        fetchBlogs();
      } else {
        toast.error(response.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật trạng thái");
    }
  };

  // Xử lý xóa blog
  const handleDeleteBlog = (blog) => {
    confirm({
      title: "Xác nhận xóa bài viết",
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn xóa bài viết <strong>"{blog.title}"</strong>?
          </p>
          <p className="text-red-500 text-sm mt-2">Hành động này không thể hoàn tác!</p>
        </div>
      ),
      onOk: async () => {
        try {
          const response = await deleteAdminBlogApi(blog.id);
          if (response.success) {
            toast.success("Xóa bài viết thành công");
            fetchBlogs();
          } else {
            toast.error(response.message || "Không thể xóa bài viết");
          }
        } catch (error) {
          console.error("Lỗi khi xóa bài viết:", error);
          toast.error("Đã xảy ra lỗi khi xóa bài viết");
        }
      },
    });
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const config = getStatusBadgeConfig(status);
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Render thumbnail
  const renderThumbnail = (blog) => {
    if (blog.thumbnail) {
      return (
        <img src={blog.thumbnail} alt={blog.title} className="w-16 h-12 rounded-lg object-cover" />
      );
    }
    return (
      <div className="w-16 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  };

  // Render pagination
  const renderPagination = () => {
    const { page, totalPages, totalElements, size } = pagination;
    const startItem = page * size + 1;
    const endItem = Math.min((page + 1) * size, totalElements);

    if (totalElements === 0) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Trước
          </button>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Sau
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{startItem}</span> đến{" "}
              <span className="font-medium">{endItem}</span> trong{" "}
              <span className="font-medium">{totalElements}</span> kết quả
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="sr-only">Trước</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {/* Render page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (page < 3) {
                  pageNum = i;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pageNum === page
                        ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}>
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="sr-only">Sau</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="w-16 h-12 bg-gray-200 rounded-lg"></div>
              <div className="ml-4">
                <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-5 bg-gray-200 rounded w-20"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-28"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right">
            <div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div>
          </td>
        </tr>
      ))}
    </>
  );

  // Render empty state
  const renderEmptyState = () => (
    <tr>
      <td colSpan={6} className="px-6 py-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <h3 className="mt-2 text-base font-medium text-gray-900">Không có bài viết</h3>
        <p className="mt-1 text-sm text-gray-500">
          Không tìm thấy bài viết nào phù hợp với bộ lọc.
        </p>
        <div className="mt-6">
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
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
            Tạo bài viết mới
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý bài viết</h1>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý các bài viết, tin tức và blog của nhà hàng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCategoryModal}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg
              className="w-6 h-6 mr-2 -ml-1"
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
            Danh mục
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
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
            Tạo bài viết
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-full bg-indigo-100">
              <svg
                className="w-6 h-6 text-indigo-600"
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
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng bài viết</p>
              <p className="text-2xl font-semibold text-gray-900">{pagination.totalElements}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-full bg-green-100">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đã xuất bản</p>
              <p className="text-2xl font-semibold text-gray-900">
                {blogs.filter((b) => b.status === "PUBLISHED").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-full bg-yellow-100">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Bản nháp</p>
              <p className="text-2xl font-semibold text-gray-900">
                {blogs.filter((b) => b.status === "DRAFT").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-full bg-purple-100">
              <svg
                className="w-6 h-6 text-purple-600"
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
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Danh mục</p>
              <p className="text-2xl font-semibold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Category filter */}
            <select
              value={filters.categoryId}
              onChange={(e) => handleFilterChange("categoryId", e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${filters.sortBy}-${filters.sortDir}`}
              onChange={(e) => {
                const [sortBy, sortDir] = e.target.value.split("-");
                setFilters((prev) => ({ ...prev, sortBy, sortDir }));
              }}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option value="createdAt-desc">Mới nhất</option>
              <option value="createdAt-asc">Cũ nhất</option>
              <option value="title-asc">Tiêu đề A-Z</option>
              <option value="title-desc">Tiêu đề Z-A</option>
              <option value="viewCount-desc">Lượt xem cao nhất</option>
              <option value="publishedAt-desc">Xuất bản gần đây</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Bài viết
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Lượt xem
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading
                ? renderSkeleton()
                : blogs.length === 0
                ? renderEmptyState()
                : blogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {renderThumbnail(blog)}
                          <div className="ml-4 max-w-md">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {blog.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate">{blog.summary}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {blog.isFeatured && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-orange-100 text-orange-800">
                                  <svg
                                    className="w-3 h-3 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  Nổi bật
                                </span>
                              )}
                              {blog.tags && (
                                <span className="text-sm text-gray-400">
                                  {blog.tags.split(",").slice(0, 2).join(", ")}
                                  {blog.tags.split(",").length > 2 && "..."}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {blog.category?.name || "Chưa phân loại"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={blog.status}
                            onChange={(e) => handleStatusChange(blog, e.target.value)}
                            className={`appearance-none cursor-pointer pr-8 pl-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${
                              getStatusBadgeConfig(blog.status).bg
                            } ${getStatusBadgeConfig(blog.status).text}`}>
                            <option value="DRAFT">Bản nháp</option>
                            <option value="PUBLISHED">Đã xuất bản</option>
                            <option value="ARCHIVED">Đã lưu trữ</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <svg
                            className="w-6 h-6 mr-1 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          {(blog.viewCount || 0).toLocaleString("vi-VN")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(blog.createdAt)}</div>
                        {blog.publishedAt && (
                          <div className="text-sm text-gray-500">
                            Xuất bản: {formatDate(blog.publishedAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Xem chi tiết */}
                          <button
                            onClick={() => handleViewDetail(blog.id)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Xem chi tiết">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>

                          {/* Chỉnh sửa */}
                          <button
                            onClick={() => handleOpenEditModal(blog)}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Chỉnh sửa">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          {/* Xóa */}
                          <button
                            onClick={() => handleDeleteBlog(blog)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Xóa bài viết">
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
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>

      {/* Modals */}
      <BlogFormModal
        isOpen={formModal.open}
        blog={formModal.blog}
        categories={categories}
        onClose={handleCloseFormModal}
        onSuccess={handleFormSuccess}
      />

      <BlogDetailModal
        isOpen={detailModal.open}
        blogId={detailModal.blogId}
        onClose={handleCloseDetailModal}
        onEdit={(blog) => {
          handleCloseDetailModal();
          handleOpenEditModal(blog);
        }}
      />

      <BlogCategoryModal isOpen={categoryModal.open} onClose={handleCloseCategoryModal} />
    </div>
  );
};

export default AdminBlogs;
