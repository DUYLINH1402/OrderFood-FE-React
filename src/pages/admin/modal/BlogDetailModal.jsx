import React, { useState, useEffect, useCallback } from "react";
import { getAdminBlogByIdApi } from "../../../services/api/adminBlogApi";
import { getSuperAdminBlogByIdApi } from "../../../services/api/superAdminApi";
import { useAuth } from "../../../hooks/auth/useAuth";
import { ROLES } from "../../../utils/roleConfig";

// Status config
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

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "Chưa có";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const BlogDetailModal = ({ isOpen, blogId, onClose, onEdit }) => {
  const { userRole } = useAuth();
  const getBlogByIdApiCall =
    userRole === ROLES.SUPER_ADMIN ? getSuperAdminBlogByIdApi : getAdminBlogByIdApi;
  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Data states
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState("content");

  // Fetch blog details
  const fetchBlogDetails = useCallback(async () => {
    if (!blogId) return;

    setLoading(true);
    try {
      const response = await getBlogByIdApiCall(blogId);
      if (response.success && response.data) {
        setBlog(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết bài viết:", error);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  // Fetch on open
  useEffect(() => {
    if (isOpen && blogId) {
      fetchBlogDetails();
      setActiveTab("content");
    }
  }, [isOpen, blogId, fetchBlogDetails]);

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
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      setIsClosing(false);
      setBlog(null);
      onClose();
    }, 300);
  }, [onClose]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle edit
  const handleEdit = () => {
    if (blog && onEdit) {
      onEdit(blog);
    }
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
          className={`relative w-full max-w-7xl bg-white rounded-xl shadow-2xl transform transition-all duration-300 ${
            isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
          onClick={(e) => e.stopPropagation()}>
          {/* Loading */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl">
              <div className="flex flex-col items-center">
                <svg
                  className="animate-spin h-10 w-10 text-indigo-600"
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
                <p className="mt-2 text-gray-600">Đang tải...</p>
              </div>
            </div>
          )}

          {blog && (
            <>
              {/* Header with thumbnail */}
              <div className="relative">
                {blog.thumbnail ? (
                  <div className="h-48 w-full overflow-hidden rounded-t-xl">
                    <img
                      src={blog.thumbnail}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                ) : (
                  <div className="h-32 w-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-xl" />
                )}

                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h2
                        className={`text-2xl font-bold truncate ${
                          blog.thumbnail ? "text-white" : "text-white"
                        }`}>
                        {blog.title}
                      </h2>
                      <div className="flex items-center gap-3 mt-2">
                        {/* Status badge */}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                            getStatusBadgeConfig(blog.status).bg
                          } ${getStatusBadgeConfig(blog.status).text}`}>
                          {getStatusBadgeConfig(blog.status).label}
                        </span>

                        {/* Category */}
                        {blog.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {blog.category.name}
                          </span>
                        )}

                        {/* Featured */}
                        {blog.isFeatured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Nổi bật
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex px-6 -mb-px">
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "content"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}>
                    Nội dung
                  </button>
                  <button
                    onClick={() => setActiveTab("info")}
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "info"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}>
                    Thông tin
                  </button>
                  <button
                    onClick={() => setActiveTab("seo")}
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "seo"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}>
                    SEO
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="p-6 min-h-[440px] max-h-[calc(100vh-280px)] overflow-y-auto">
                {/* Tab: Content */}
                {activeTab === "content" && (
                  <div className="space-y-4">
                    {/* Summary */}
                    {blog.summary && (
                      <div className="p-4 text-sm bg-gray-50 rounded-lg">
                        <h4 className=" font-medium text-gray-500 mb-2">Tóm tắt</h4>
                        <p className="text-gray-700">{blog.summary}</p>
                      </div>
                    )}

                    {/* Content */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Nội dung</h4>
                      {blog.content ? (
                        <div
                          className=" text-sm text-justify max-w-none bg-white border border-gray-200 rounded-lg p-4"
                          dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                      ) : (
                        <p className="text-gray-400 italic">Chưa có nội dung</p>
                      )}
                    </div>

                    {/* Tags */}
                    {blog.tags && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {blog.tags.split(",").map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                              <svg
                                className="w-3 h-3 mr-1.5 text-gray-400"
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
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Info */}
                {activeTab === "info" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Author */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Tác giả</h4>
                        <div className=" text-sm flex items-center gap-3">
                          {blog.author?.avatarUrl ? (
                            <img
                              src={blog.author.avatarUrl}
                              alt={blog.author.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {blog.author?.fullName || "Không rõ"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Danh mục</h4>
                        {blog.category ? (
                          <div>
                            <p className="text-sm text-gray-900">{blog.category.name}</p>
                            <p className="text-sm text-gray-500">{blog.category.description}</p>
                          </div>
                        ) : (
                          <p className="text-gray-400">Chưa phân loại</p>
                        )}
                      </div>

                      {/* View Count */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Lượt xem</h4>
                        <p className="text-2xl font-bold text-gray-900">
                          {(blog.viewCount || 0).toLocaleString("vi-VN")}
                        </p>
                      </div>

                      {/* Slug */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">URL</h4>
                        <p className="text-sm text-gray-600 font-mono break-all">
                          /blogs/{blog.slug}
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Thời gian</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Ngày tạo</p>
                          <p className="text-sm text-gray-900">{formatDate(blog.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Cập nhật lần cuối</p>
                          <p className="text-sm text-gray-900">{formatDate(blog.updatedAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Ngày xuất bản</p>
                          <p className="text-sm text-gray-900">{formatDate(blog.publishedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: SEO */}
                {activeTab === "seo" && (
                  <div className="space-y-4">
                    {/* Meta Title */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Meta Title</h4>
                      <p className="text-sm text-gray-900">{blog.metaTitle || blog.title}</p>
                      <p
                        className={`text-sm mt-1 ${
                          (blog.metaTitle || blog.title).length > 60
                            ? "text-orange-500"
                            : "text-gray-400"
                        }`}>
                        {(blog.metaTitle || blog.title).length}/60 ký tự
                      </p>
                    </div>

                    {/* Meta Description */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Meta Description</h4>
                      <p className="text-sm text-gray-900">
                        {blog.metaDescription || blog.summary || "Chưa có"}
                      </p>
                      <p
                        className={`text-sm mt-1 ${
                          (blog.metaDescription || blog.summary || "").length > 160
                            ? "text-orange-500"
                            : "text-gray-400"
                        }`}>
                        {(blog.metaDescription || blog.summary || "").length}/160 ký tự
                      </p>
                    </div>

                    {/* Google Preview */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">
                        Xem trước trên Google
                      </h4>
                      <div className="bg-white p-4 rounded border border-gray-200">
                        <div className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
                          {blog.metaTitle || blog.title}
                        </div>
                        <div className="text-green-700 text-sm truncate">
                          example.com/blogs/{blog.slug}
                        </div>
                        <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {blog.metaDescription || blog.summary || "Mô tả bài viết..."}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="text-sm text-gray-500">ID: {blog.id}</div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                    Đóng
                  </button>
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                    <svg
                      className="w-6 h-6 mr-2 -ml-1"
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
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Empty state */}
          {!loading && !blog && (
            <div className="p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy bài viết</h3>
              <p className="mt-1 text-sm text-gray-500">
                Bài viết này có thể đã bị xóa hoặc không tồn tại.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetailModal;
