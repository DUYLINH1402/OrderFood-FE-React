import React, { useState, useEffect, useCallback } from "react";
import { Switch, Select, Input, InputNumber, Upload } from "antd";
import {
  FiX,
  FiSave,
  FiImage,
  FiTag,
  FiDollarSign,
  FiPackage,
  FiFileText,
  FiStar,
  FiTrendingUp,
  FiPlus,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

const { TextArea } = Input;
const PLACEHOLDER_IMAGE = "https://placehold.co/400x300/f3f4f6/9ca3af?text=No+Image";

const FoodFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  food = null, // null = create, object = edit
  categories = [],
  loading = false,
}) => {
  const isEditMode = !!food;
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: 0,
    description: "",
    categoryId: null,
    status: "AVAILABLE",
    isBestSeller: false,
    isFeatured: false,
    isNew: false,
    image: null,
    imageUrl: "",
  });

  // Preview image
  const [previewUrl, setPreviewUrl] = useState("");
  const [errors, setErrors] = useState({});

  // Initialize form data when food changes
  useEffect(() => {
    if (food) {
      setFormData({
        name: food.name || "",
        slug: food.slug || "",
        price: food.price || 0,
        description: food.description || "",
        categoryId: food.categoryId || null,
        status: food.status || "AVAILABLE",
        isBestSeller: food.isBestSeller || false,
        isFeatured: food.isFeatured || false,
        isNew: food.isNew || false,
        image: null,
        imageUrl: food.imageUrl || "",
      });
      setPreviewUrl(food.imageUrl || "");
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        slug: "",
        price: 0,
        description: "",
        categoryId: null,
        status: "AVAILABLE",
        isBestSeller: false,
        isFeatured: false,
        isNew: false,
        image: null,
        imageUrl: "",
      });
      setPreviewUrl("");
    }
    setErrors({});
  }, [food, isOpen]);

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
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Auto generate slug from name
  const generateSlug = (name) => {
    return name
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

  // Handle name change with auto slug
  const handleNameChange = (value) => {
    handleChange("name", value);
    if (!isEditMode || !formData.slug) {
      handleChange("slug", generateSlug(value));
    }
  };

  // Handle image upload
  const handleImageChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên món ăn";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Giá phải lớn hơn 0";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Vui lòng chọn danh mục";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = () => {
    if (!validateForm()) return;

    onSubmit({
      ...formData,
      price: Number(formData.price),
    });
  };

  // Build category options (flatten tree)
  const buildCategoryOptions = () => {
    const options = [];
    categories.forEach((category) => {
      if (category.children?.length > 0) {
        // Add parent as group label
        options.push({
          label: category.name,
          options: category.children.map((child) => ({
            value: child.id,
            label: child.name,
          })),
        });
      } else if (category.id) {
        options.push({
          value: category.id,
          label: category.name,
        });
      }
    });
    return options;
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-2 tablet:p-4 desktop:p-6">
        <div
          className={`relative bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[92vh] overflow-hidden mx-2 tablet:mx-0 transform transition-all duration-300 ease-out ${
            isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
          }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-[#3c54c2] to-[#4ba9ce] px-4 tablet:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  {isEditMode ? (
                    <FiFileText className="w-5 h-5 text-white" />
                  ) : (
                    <FiPlus className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg tablet:text-xl font-bold text-white">
                    {isEditMode ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
                  </h2>
                  <p className="text-sx tablet:text-sm text-white/80">
                    {isEditMode ? "Cập nhật thông tin món ăn" : "Điền thông tin để tạo món ăn mới"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors disabled:opacity-50">
                <FiX className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 tablet:p-6 overflow-y-auto max-h-[calc(92vh-160px)]">
            <div className="grid grid-cols-1 desktop:grid-cols-2 gap-4 tablet:gap-6">
              {/* Left Column - Image Upload */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiImage className="w-6 h-6 inline mr-1" />
                    Hình ảnh món ăn
                  </label>
                  <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-orange-400 transition-colors">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <FiImage className="w-12 h-12 mb-2" />
                        <p className="text-sm">Chọn ảnh</p>
                      </div>
                    )}
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={handleImageChange}
                      className="absolute inset-0">
                      <div className="absolute inset-0 cursor-pointer" />
                    </Upload>
                  </div>
                  <p className="text-sx text-gray-500 mt-2">
                    Định dạng: JPG, PNG. Kích thước tối đa: 5MB
                  </p>
                </div>

                {/* Flags */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm text-gray-900 mb-3">Đánh dấu đặc biệt</h4>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiTrendingUp className="w-6 h-6 text-red-500" />
                      <span className="text-sm text-gray-700">Món bán chạy</span>
                    </div>
                    <Switch
                      checked={formData.isBestSeller}
                      onChange={(checked) => handleChange("isBestSeller", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiStar className="w-6 h-6 text-yellow-500" />
                      <span className="text-sm text-gray-700">Món đặc biệt</span>
                    </div>
                    <Switch
                      checked={formData.isFeatured}
                      onChange={(checked) => handleChange("isFeatured", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiTag className="w-6 h-6 text-blue-500" />
                      <span className="text-sm text-gray-700">Món mới</span>
                    </div>
                    <Switch
                      checked={formData.isNew}
                      onChange={(checked) => handleChange("isNew", checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên món ăn <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Nhap ten mon an..."
                    size="large"
                    status={errors.name ? "error" : ""}
                    prefix={<FiFileText className="text-gray-400" />}
                  />
                  {errors.name && (
                    <p className="text-sx text-red-500 mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    placeholder="tu-dong-tao-tu-ten"
                    size="large"
                    prefix={<FiTag className="text-gray-400" />}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <InputNumber
                    value={formData.price}
                    onChange={(value) => handleChange("price", value)}
                    placeholder="0"
                    size="large"
                    className="w-full"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    min={0}
                    status={errors.price ? "error" : ""}
                    prefix={<FiDollarSign className="text-gray-400" />}
                  />
                  {errors.price && (
                    <p className="text-sx text-red-500 mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" />
                      {errors.price}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.categoryId}
                    onChange={(value) => handleChange("categoryId", value)}
                    placeholder="Chọn danh mục..."
                    size="large"
                    className="w-full"
                    options={buildCategoryOptions()}
                    status={errors.categoryId ? "error" : ""}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                  />
                  {errors.categoryId && (
                    <p className="text-sx text-red-500 mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" />
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <Select
                    value={formData.status}
                    onChange={(value) => handleChange("status", value)}
                    size="large"
                    className="w-full"
                    options={[
                      { value: "AVAILABLE", label: "Có sẵn" },
                      { value: "UNAVAILABLE", label: "Hết hàng" },
                    ]}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <TextArea
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Nhập mô tả món ăn..."
                    rows={4}
                    showCount
                    maxLength={500}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 tablet:px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col-reverse tablet:flex-row gap-3 tablet:justify-end">
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-sm px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50">
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="text-sm px-6 py-2.5 bg-gradient-to-r from-[#3c54c2] to-[#4ba9ce] text-white rounded-lg hover:from-[#10216e] hover:to-[#82c2db] transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <FiLoader className="w-6 h-6 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    {isEditMode ? (
                      <FiCheckCircle className="w-6 h-6" />
                    ) : (
                      <FiPlus className="w-6 h-6" />
                    )}
                    {isEditMode ? "Cập nhật" : "Thêm món ăn"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodFormModal;
