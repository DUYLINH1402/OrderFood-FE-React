import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  createAdminBlogApi,
  updateAdminBlogApi,
  getAdminBlogByIdApi,
} from "../../../services/api/adminBlogApi";
import { BLOG_TYPES } from "../../../constants/blogConstants";

// Status options
const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Bản nháp", description: "Chưa xuất bản, chỉ admin thấy" },
  { value: "PUBLISHED", label: "Xuất bản", description: "Công khai cho người dùng" },
  { value: "ARCHIVED", label: "Lưu trữ", description: "Đã lưu trữ, không hiển thị" },
];

// Blog type options
const BLOG_TYPE_OPTIONS = [
  {
    value: BLOG_TYPES.NEWS_PROMOTIONS,
    label: "Tin tức & Khuyến mãi",
    description: "Tin tức, khuyến mãi, sự kiện của nhà hàng",
    icon: "fa-newspaper",
    color: "emerald",
  },
  {
    value: BLOG_TYPES.MEDIA_PRESS,
    label: "Báo chí & Truyền thông",
    description: "Bài viết từ báo chí nói về nhà hàng",
    icon: "fa-bullhorn",
    color: "blue",
  },
  {
    value: BLOG_TYPES.CATERING_SERVICES,
    label: "Dịch vụ đãi tiệc",
    description: "Showcase các gói tiệc và dịch vụ",
    icon: "fa-utensils",
    color: "amber",
  },
];

// Quill editor modules
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link", "image", "video"],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const quillFormats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "script",
  "list",
  "bullet",
  "indent",
  "direction",
  "align",
  "blockquote",
  "code-block",
  "link",
  "image",
  "video",
];

// Hàm tạo slug từ title
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

const BlogFormModal = ({ isOpen, blog, categories = [], onClose, onSuccess }) => {
  const isEditMode = !!blog;

  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    thumbnail: "",
    status: "DRAFT",
    blogType: BLOG_TYPES.NEWS_PROMOTIONS,
    isFeatured: false,
    tags: "",
    metaTitle: "",
    metaDescription: "",
    publishedAt: "",
    categoryId: "",
    // MEDIA_PRESS fields
    sourceUrl: "",
    sourceName: "",
    sourceLogo: "",
    sourcePublishedAt: "",
    // CATERING_SERVICES fields
    priceRange: "",
    serviceAreas: "",
    menuItems: "",
    galleryImages: "",
    minCapacity: "",
    maxCapacity: "",
    contactInfo: "",
  });

  // Loading states
  const [loading, setLoading] = useState(false);
  const [fetchingBlog, setFetchingBlog] = useState(false);

  // Errors
  const [errors, setErrors] = useState({});

  // Active tab
  const [activeTab, setActiveTab] = useState("content");

  // Fetch blog details when editing
  useEffect(() => {
    const fetchBlogDetails = async () => {
      if (isEditMode && blog?.id) {
        setFetchingBlog(true);
        try {
          const response = await getAdminBlogByIdApi(blog.id);
          if (response.success && response.data) {
            const data = response.data;
            setFormData({
              title: data.title || "",
              slug: data.slug || "",
              summary: data.summary || "",
              content: data.content || "",
              thumbnail: data.thumbnail || "",
              status: data.status || "DRAFT",
              blogType: data.blogType || BLOG_TYPES.NEWS_PROMOTIONS,
              isFeatured: data.isFeatured || false,
              tags: data.tags || "",
              metaTitle: data.metaTitle || "",
              metaDescription: data.metaDescription || "",
              publishedAt: data.publishedAt
                ? new Date(data.publishedAt).toISOString().slice(0, 16)
                : "",
              categoryId: data.category?.id || "",
              // MEDIA_PRESS fields
              sourceUrl: data.sourceUrl || "",
              sourceName: data.sourceName || "",
              sourceLogo: data.sourceLogo || "",
              sourcePublishedAt: data.sourcePublishedAt
                ? new Date(data.sourcePublishedAt).toISOString().slice(0, 16)
                : "",
              // CATERING_SERVICES fields
              priceRange: data.priceRange || "",
              serviceAreas: data.serviceAreas || "",
              menuItems:
                typeof data.menuItems === "string"
                  ? data.menuItems
                  : JSON.stringify(data.menuItems || []),
              galleryImages: Array.isArray(data.galleryImages)
                ? data.galleryImages.join("\n")
                : data.galleryImages || "",
              minCapacity: data.minCapacity || "",
              maxCapacity: data.maxCapacity || "",
              contactInfo: data.contactInfo || "",
            });
          }
        } catch (error) {
          console.error("Lỗi khi tải chi tiết bài viết:", error);
          toast.error("Không thể tải thông tin bài viết");
        } finally {
          setFetchingBlog(false);
        }
      }
    };

    if (isOpen) {
      if (isEditMode) {
        fetchBlogDetails();
      } else {
        // Reset form for create mode
        setFormData({
          title: "",
          slug: "",
          summary: "",
          content: "",
          thumbnail: "",
          status: "DRAFT",
          isFeatured: false,
          tags: "",
          metaTitle: "",
          metaDescription: "",
          publishedAt: "",
          categoryId: "",
          blogType: "NEWS_PROMOTIONS",
          // MEDIA_PRESS fields
          sourceUrl: "",
          sourceName: "",
          sourceLogo: "",
          sourcePublishedAt: "",
          // CATERING_SERVICES fields
          priceRange: "",
          serviceAreas: "",
          menuItems: "",
          galleryImages: "",
          minCapacity: "",
          maxCapacity: "",
          contactInfo: "",
        });
      }
      setErrors({});
      setActiveTab("content");
    }
  }, [isOpen, blog, isEditMode]);

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
    if (loading) return;
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  }, [loading, onClose]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose, loading]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle input change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Handle title change with auto slug
  const handleTitleChange = (value) => {
    handleChange("title", value);
    if (!isEditMode || !formData.slug) {
      handleChange("slug", generateSlug(value));
    }
    // Auto fill meta title if empty
    if (!formData.metaTitle) {
      handleChange("metaTitle", value);
    }
  };

  // Handle content change
  const handleContentChange = (value) => {
    handleChange("content", value);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Vui lòng nhập tiêu đề bài viết";
    } else if (formData.title.length > 255) {
      newErrors.title = "Tiêu đề không được vượt quá 255 ký tự";
    }

    if (formData.slug && formData.slug.length > 300) {
      newErrors.slug = "Slug không được vượt quá 300 ký tự";
    }

    if (formData.summary && formData.summary.length > 500) {
      newErrors.summary = "Tóm tắt không được vượt quá 500 ký tự";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Vui lòng chọn danh mục";
    }

    if (formData.metaTitle && formData.metaTitle.length > 255) {
      newErrors.metaTitle = "Meta title không được vượt quá 255 ký tự";
    }

    if (formData.metaDescription && formData.metaDescription.length > 500) {
      newErrors.metaDescription = "Meta description không được vượt quá 500 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      // Switch to tab with first error
      if (errors.title || errors.slug || errors.summary || errors.categoryId) {
        setActiveTab("content");
      } else if (errors.metaTitle || errors.metaDescription) {
        setActiveTab("seo");
      }
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        slug: formData.slug || undefined,
        summary: formData.summary || undefined,
        content: formData.content || undefined,
        thumbnail: formData.thumbnail || undefined,
        status: formData.status,
        isFeatured: formData.isFeatured,
        tags: formData.tags || undefined,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        publishedAt: formData.publishedAt
          ? new Date(formData.publishedAt).toISOString()
          : undefined,
        categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
        blogType: formData.blogType,
      };

      // Add MEDIA_PRESS specific fields
      if (formData.blogType === "MEDIA_PRESS") {
        payload.sourceUrl = formData.sourceUrl || undefined;
        payload.sourceName = formData.sourceName || undefined;
        payload.sourceLogo = formData.sourceLogo || undefined;
        payload.sourcePublishedAt = formData.sourcePublishedAt
          ? new Date(formData.sourcePublishedAt).toISOString()
          : undefined;
      }

      // Add CATERING_SERVICES specific fields
      if (formData.blogType === "CATERING_SERVICES") {
        payload.priceRange = formData.priceRange || undefined;
        payload.serviceAreas = formData.serviceAreas
          ? formData.serviceAreas
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;
        payload.minCapacity = formData.minCapacity ? Number(formData.minCapacity) : undefined;
        payload.maxCapacity = formData.maxCapacity ? Number(formData.maxCapacity) : undefined;
        payload.contactInfo = formData.contactInfo || undefined;
        // Parse menuItems JSON
        if (formData.menuItems) {
          try {
            payload.menuItems = JSON.parse(formData.menuItems);
          } catch (e) {
            console.warn("Invalid menuItems JSON:", e);
          }
        }
        // Parse galleryImages (newline separated URLs)
        if (formData.galleryImages) {
          payload.galleryImages = formData.galleryImages
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }

      let response;
      if (isEditMode) {
        response = await updateAdminBlogApi(blog.id, payload);
      } else {
        response = await createAdminBlogApi(payload);
      }

      if (response.success) {
        toast.success(isEditMode ? "Cập nhật bài viết thành công" : "Tạo bài viết thành công");
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Lỗi khi lưu bài viết:", error);
      toast.error("Đã xảy ra lỗi khi lưu bài viết");
    } finally {
      setLoading(false);
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
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {isEditMode ? "Cập nhật thông tin bài viết" : "Điền thông tin để tạo bài viết mới"}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
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

          {/* Loading overlay */}
          {fetchingBlog && (
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
                <span className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Nội dung
                </span>
              </button>
              <button
                onClick={() => setActiveTab("media")}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "media"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}>
                <span className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Media & Tags
                </span>
              </button>
              <button
                onClick={() => setActiveTab("seo")}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "seo"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}>
                <span className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  SEO
                </span>
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "settings"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}>
                <span className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Cài đặt
                </span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[490px] max-h-[calc(100vh-280px)] overflow-y-auto">
            {/* Tab: Content */}
            {activeTab === "content" && (
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Nhập tiêu đề bài viết"
                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.title ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      /blogs/
                    </span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleChange("slug", e.target.value)}
                      placeholder="tieu-de-bai-viet"
                      className={`block w-full px-3 py-2 border rounded-r-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        errors.slug ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                  <p className="mt-1 text-sm text-gray-500">Để trống để tự động tạo từ tiêu đề</p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => handleChange("categoryId", e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.categoryId ? "border-red-300" : "border-gray-300"
                    }`}>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                  )}
                </div>

                {/* Blog Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại bài viết <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.blogType}
                    onChange={(e) => handleChange("blogType", e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    {BLOG_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.blogType === "NEWS_PROMOTIONS" &&
                      "Tin tức về khuyến mãi, sự kiện nhà hàng"}
                    {formData.blogType === "MEDIA_PRESS" && "Bài viết từ báo chí, truyền thông"}
                    {formData.blogType === "CATERING_SERVICES" && "Dịch vụ đãi tiệc lưu động"}
                  </p>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tóm tắt</label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => handleChange("summary", e.target.value)}
                    placeholder="Mô tả ngắn gọn về bài viết (hiển thị ở danh sách)"
                    rows={3}
                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.summary ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  <div className="mt-1 flex justify-between">
                    {errors.summary ? (
                      <p className="text-sm text-red-600">{errors.summary}</p>
                    ) : (
                      <span />
                    )}
                    <span className="text-sm text-gray-500">{formData.summary.length}/500</span>
                  </div>
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={handleContentChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Nhập nội dung bài viết..."
                      className="bg-white"
                      style={{ minHeight: "300px" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Media & Tags */}
            {activeTab === "media" && (
              <div className="space-y-5">
                {/* Thumbnail URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ảnh đại diện (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => handleChange("thumbnail", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {formData.thumbnail && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 mb-2">Xem trước:</p>
                      <img
                        src={formData.thumbnail}
                        alt="Preview"
                        className="max-w-xs h-40 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleChange("tags", e.target.value)}
                    placeholder="tag1, tag2, tag3"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">Nhập các tags cách nhau bởi dấu phẩy</p>
                  {formData.tags && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tags.split(",").map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Featured */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Bài viết nổi bật</h4>
                    <p className="text-sm text-gray-500">
                      Hiển thị ở vị trí đặc biệt trên trang chủ
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange("isFeatured", !formData.isFeatured)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      formData.isFeatured ? "bg-indigo-600" : "bg-gray-200"
                    }`}>
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.isFeatured ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* MEDIA_PRESS specific fields */}
                {formData.blogType === "MEDIA_PRESS" && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-800 mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
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
                      Thông tin nguồn báo chí
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên nguồn
                        </label>
                        <input
                          type="text"
                          value={formData.sourceName}
                          onChange={(e) => handleChange("sourceName", e.target.value)}
                          placeholder="VD: VnExpress, Tuổi Trẻ, Dân Trí..."
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL bài gốc
                        </label>
                        <input
                          type="url"
                          value={formData.sourceUrl}
                          onChange={(e) => handleChange("sourceUrl", e.target.value)}
                          placeholder="https://vnexpress.net/bai-viet-goc..."
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Logo nguồn (URL)
                        </label>
                        <input
                          type="url"
                          value={formData.sourceLogo}
                          onChange={(e) => handleChange("sourceLogo", e.target.value)}
                          placeholder="https://example.com/logo.png"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {formData.sourceLogo && (
                          <img
                            src={formData.sourceLogo}
                            alt="Logo preview"
                            className="mt-2 h-8 object-contain"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ngày đăng gốc
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.sourcePublishedAt}
                          onChange={(e) => handleChange("sourcePublishedAt", e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CATERING_SERVICES specific fields */}
                {formData.blogType === "CATERING_SERVICES" && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="text-sm font-semibold text-amber-800 mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.75 1.75 0 014 14.9V4a1 1 0 011-1h14a1 1 0 011 1v11.5a1.75 1.75 0 01-.5.046z"
                        />
                      </svg>
                      Thông tin dịch vụ đãi tiệc
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sức chứa tối thiểu
                          </label>
                          <input
                            type="number"
                            value={formData.minCapacity}
                            onChange={(e) => handleChange("minCapacity", e.target.value)}
                            placeholder="VD: 50"
                            min="1"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sức chứa tối đa
                          </label>
                          <input
                            type="number"
                            value={formData.maxCapacity}
                            onChange={(e) => handleChange("maxCapacity", e.target.value)}
                            placeholder="VD: 500"
                            min="1"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Khoảng giá
                        </label>
                        <input
                          type="text"
                          value={formData.priceRange}
                          onChange={(e) => handleChange("priceRange", e.target.value)}
                          placeholder="VD: 500.000đ - 2.000.000đ/người"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Khu vực phục vụ
                        </label>
                        <input
                          type="text"
                          value={formData.serviceAreas}
                          onChange={(e) => handleChange("serviceAreas", e.target.value)}
                          placeholder="VD: Quận 1, Quận 3, Quận Bình Thạnh (cách nhau bởi dấu phẩy)"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Nhập các khu vực cách nhau bởi dấu phẩy
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Thông tin liên hệ
                        </label>
                        <textarea
                          value={formData.contactInfo}
                          onChange={(e) => handleChange("contactInfo", e.target.value)}
                          placeholder="VD: Hotline: 0901234567&#10;Email: catering@example.com"
                          rows={2}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Thực đơn mẫu (JSON)
                        </label>
                        <textarea
                          value={formData.menuItems}
                          onChange={(e) => handleChange("menuItems", e.target.value)}
                          placeholder='VD: [{"name": "Set menu A", "price": 500000}, {"name": "Set menu B", "price": 800000}]'
                          rows={3}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono text-xs"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Định dạng JSON array với các object chứa name, price, description (tùy
                          chọn)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gallery (URLs)
                        </label>
                        <textarea
                          value={formData.galleryImages}
                          onChange={(e) => handleChange("galleryImages", e.target.value)}
                          placeholder="Mỗi URL trên một dòng"
                          rows={3}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <p className="mt-1 text-sm text-gray-500">Nhập mỗi URL ảnh trên một dòng</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: SEO */}
            {activeTab === "seo" && (
              <div className="space-y-5">
                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => handleChange("metaTitle", e.target.value)}
                    placeholder="Tiêu đề hiển thị trên kết quả tìm kiếm"
                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.metaTitle ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  <div className="mt-1 flex justify-between">
                    {errors.metaTitle ? (
                      <p className="text-sm text-red-600">{errors.metaTitle}</p>
                    ) : (
                      <span />
                    )}
                    <span
                      className={`text-sm ${
                        formData.metaTitle.length > 60 ? "text-orange-500" : "text-gray-500"
                      }`}>
                      {formData.metaTitle.length}/60 (khuyến nghị)
                    </span>
                  </div>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => handleChange("metaDescription", e.target.value)}
                    placeholder="Mô tả hiển thị trên kết quả tìm kiếm"
                    rows={3}
                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.metaDescription ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  <div className="mt-1 flex justify-between">
                    {errors.metaDescription ? (
                      <p className="text-sm text-red-600">{errors.metaDescription}</p>
                    ) : (
                      <span />
                    )}
                    <span
                      className={`text-sm ${
                        formData.metaDescription.length > 160 ? "text-orange-500" : "text-gray-500"
                      }`}>
                      {formData.metaDescription.length}/160 (khuyến nghị)
                    </span>
                  </div>
                </div>

                {/* SEO Preview */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Xem trước trên Google</h4>
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <div className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
                      {formData.metaTitle || formData.title || "Tiêu đề bài viết"}
                    </div>
                    <div className="text-green-700 text-sm truncate">
                      example.com/blogs/{formData.slug || "tieu-de-bai-viet"}
                    </div>
                    <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {formData.metaDescription || formData.summary || "Mô tả bài viết..."}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Settings */}
            {activeTab === "settings" && (
              <div className="space-y-5">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {STATUS_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                          formData.status === option.value
                            ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500"
                            : "border-gray-300 bg-white hover:bg-gray-50"
                        }`}>
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={formData.status === option.value}
                          onChange={(e) => handleChange("status", e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex flex-col">
                          <span
                            className={`block text-sm font-medium ${
                              formData.status === option.value ? "text-indigo-900" : "text-gray-900"
                            }`}>
                            {option.label}
                          </span>
                          <span
                            className={`mt-1 text-sm ${
                              formData.status === option.value ? "text-indigo-700" : "text-gray-500"
                            }`}>
                            {option.description}
                          </span>
                        </div>
                        {formData.status === option.value && (
                          <span className="absolute top-2 right-2 text-indigo-600">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Scheduled publish */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lên lịch xuất bản
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.publishedAt}
                    onChange={(e) => handleChange("publishedAt", e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Để trống để xuất bản ngay khi chuyển sang trạng thái "Xuất bản"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors">
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors">
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    className="w-6 h-6 mr-2 -ml-1"
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
                  {isEditMode ? "Cập nhật" : "Tạo bài viết"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogFormModal;
