import React, { useState, useEffect, useCallback } from "react";
import {
  FiX,
  FiTag,
  FiInfo,
  FiAlertTriangle,
  FiPackage,
  FiStar,
  FiImage,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

// Placeholder image khi không có ảnh món ăn
const PLACEHOLDER_IMAGE = "https://placehold.co/400x300/f3f4f6/9ca3af?text=No+Image";

const FoodDetailModal = ({ food, isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Animation khi mở modal
  useEffect(() => {
    if (isOpen) {
      // Reset trạng thái
      setIsClosing(false);
      setImageLoaded(false);
      // Delay nhỏ để trigger animation
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Xử lý đóng modal với animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setIsVisible(false);
    // Đợi animation hoàn thành trước khi đóng thực sự
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  }, [onClose]);

  // Xử lý phím ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  // Ngăn scroll body khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;
  if (!food) return null;

  // Xác định màu sắc theo trạng thái
  const getStatusConfig = (status) => {
    switch (status) {
      case "AVAILABLE":
        return {
          bg: "bg-gradient-to-r from-green-500 to-emerald-600",
          text: "text-white",
          label: "Có sẵn",
          icon: FiCheckCircle,
        };
      case "UNAVAILABLE":
        return {
          bg: "bg-gradient-to-r from-amber-500 to-orange-600",
          text: "text-white",
          label: "Hết hàng",
          icon: FiXCircle,
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-400 to-gray-500",
          text: "text-white",
          label: "Không xác định",
          icon: FiInfo,
        };
    }
  };

  const statusConfig = getStatusConfig(food.status);
  const StatusIcon = statusConfig.icon;

  // Lấy URL ảnh (hỗ trợ cả imageUrl và image từ BE)
  const imageUrl = food.imageUrl || food.image || PLACEHOLDER_IMAGE;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay với hiệu ứng blur */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-2 tablet:p-4 desktop:p-6">
        <div
          className={`relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden mx-2 tablet:mx-0 transform transition-all duration-300 ease-out ${
            isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
          }`}>
          {/* Header với hình ảnh */}
          <div className="relative h-44 tablet:h-56 desktop:h-80 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
            {/* Skeleton loading */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
            )}

            {/* Hình ảnh món ăn */}
            <img
              src={imageUrl}
              alt={food.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = PLACEHOLDER_IMAGE;
                setImageLoaded(true);
              }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Nút đóng */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 tablet:top-4 tablet:right-4 p-2 tablet:p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 group">
              <FiX className="w-4 h-4 tablet:w-5 tablet:h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
            </button>

            {/* Badge trạng thái */}
            <div className="absolute bottom-3 left-3 tablet:bottom-4 tablet:left-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 tablet:px-4 py-1.5 tablet:py-2 text-sx tablet:text-sm font-semibold rounded-full shadow-lg ${statusConfig.bg} ${statusConfig.text}`}>
                <StatusIcon className="w-3.5 h-3.5 tablet:w-4 tablet:h-4" />
                {statusConfig.label}
              </span>
            </div>

            {/* Badge giá */}
            <div className="absolute bottom-3 right-3 tablet:bottom-4 tablet:right-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 tablet:px-4 py-1.5 tablet:py-2 shadow-lg">
                <span className="text-md tablet:text-lg desktop:text-xl font-bold text-orange-600">
                  {food.price?.toLocaleString("vi-VN")}đ
                </span>
                {food.originalPrice && food.originalPrice > food.price && (
                  <span className="ml-2 text-sx tablet:text-sm text-gray-400 line-through">
                    {food.originalPrice?.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Nội dung */}
          <div className="p-4 tablet:p-6 overflow-y-auto max-h-[calc(92vh-14rem)] tablet:max-h-[calc(92vh-16rem)] custom-scrollbar">
            {/* Tên món ăn */}
            <div className="mb-4 tablet:mb-5">
              <h2 className="text-lg tablet:text-xl desktop:text-2xl font-bold text-gray-900 leading-tight mb-2">
                {food.name}
              </h2>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 tablet:gap-2">
                {food.slug && (
                  <span className="inline-flex items-center px-2.5 tablet:px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sx tablet:text-sm font-medium transition-transform hover:scale-105">
                    <FiTag className="w-3 h-3 tablet:w-3.5 tablet:h-3.5 mr-1.5" />
                    {food.slug}
                  </span>
                )}
                {food.categoryName && (
                  <span className="inline-flex items-center px-2.5 tablet:px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sx tablet:text-sm font-medium transition-transform hover:scale-105">
                    <FiPackage className="w-3 h-3 tablet:w-3.5 tablet:h-3.5 mr-1.5" />
                    {food.categoryName}
                  </span>
                )}
                {food.isBestSeller && (
                  <span className="inline-flex items-center px-2.5 tablet:px-3 py-1 bg-gradient-to-r from-red-50 to-orange-50 text-red-600 rounded-lg text-sx tablet:text-sm font-medium animate-pulse">
                    <FiTrendingUp className="w-3 h-3 tablet:w-3.5 tablet:h-3.5 mr-1.5" />
                    Bán chạy
                  </span>
                )}
                {food.isFeatured && (
                  <span className="inline-flex items-center px-2.5 tablet:px-3 py-1 bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-600 rounded-lg text-sx tablet:text-sm font-medium">
                    <FiStar className="w-3 h-3 tablet:w-3.5 tablet:h-3.5 mr-1.5" />
                    Đặc biệt
                  </span>
                )}
                {food.isNew && (
                  <span className="inline-flex items-center px-2.5 tablet:px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-600 rounded-lg text-sx tablet:text-sm font-medium">
                    <FiTag className="w-3 h-3 tablet:w-3.5 tablet:h-3.5 mr-1.5" />
                    Món mới
                  </span>
                )}
              </div>
            </div>

            {/* Mô tả */}
            <div className="mb-5 tablet:mb-6">
              <h3 className="text-sm tablet:text-md font-semibold text-gray-800 mb-2 flex items-center">
                <FiInfo className="w-4 h-4 tablet:w-4.5 tablet:h-4.5 mr-2 text-blue-500" />
                Mô tả món ăn
              </h3>
              <div className="bg-gray-50 rounded-xl p-3 tablet:p-4">
                <p className="text-sm tablet:text-md desktop:text-base text-gray-600 leading-relaxed">
                  {food.description || "Chưa có mô tả cho món ăn này."}
                </p>
              </div>
            </div>

            {/* Thành phần */}
            {food.ingredients && food.ingredients.length > 0 && (
              <div className="mb-5 tablet:mb-6">
                <h3 className="text-sm tablet:text-md font-semibold text-gray-800 mb-2 flex items-center">
                  <FiPackage className="w-4 h-4 tablet:w-4.5 tablet:h-4.5 mr-2 text-purple-500" />
                  Thành phần
                </h3>
                <div className="flex flex-wrap gap-2">
                  {food.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="px-3 tablet:px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sx tablet:text-sm font-medium transition-all duration-200 cursor-default">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Thông tin dị ứng (Allergen) */}
            {food.allergens && food.allergens.length > 0 && (
              <div className="mb-5 tablet:mb-6">
                <h3 className="text-sm tablet:text-md font-semibold text-red-700 mb-2 flex items-center">
                  <FiAlertTriangle className="w-4 h-4 tablet:w-4.5 tablet:h-4.5 mr-2 text-red-500" />
                  Cảnh báo dị ứng
                </h3>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 tablet:p-4">
                  <div className="flex flex-wrap gap-2">
                    {food.allergens.map((allergen, index) => (
                      <span
                        key={index}
                        className="px-3 tablet:px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-sx tablet:text-sm font-medium">
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Thông tin bổ sung dạng grid */}
            <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3 tablet:gap-4 pt-4 border-t border-gray-100">
              {food.preparationTime && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 tablet:p-4 text-center transition-transform hover:scale-105">
                  <FiClock className="w-5 h-5 tablet:w-6 tablet:h-6 text-blue-500 mx-auto mb-1.5" />
                  <span className="block text-sx tablet:text-sm text-gray-500 mb-0.5">
                    Chuẩn bị
                  </span>
                  <p className="font-semibold text-gray-900 text-sm tablet:text-md">
                    {food.preparationTime} phút
                  </p>
                </div>
              )}
              {food.calories && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 tablet:p-4 text-center transition-transform hover:scale-105">
                  <FiTrendingUp className="w-5 h-5 tablet:w-6 tablet:h-6 text-green-500 mx-auto mb-1.5" />
                  <span className="block text-sx tablet:text-sm text-gray-500 mb-0.5">
                    Calories
                  </span>
                  <p className="font-semibold text-gray-900 text-sm tablet:text-md">
                    {food.calories} kcal
                  </p>
                </div>
              )}
              {food.soldCount !== undefined && food.soldCount !== null && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 tablet:p-4 text-center transition-transform hover:scale-105">
                  <FiPackage className="w-5 h-5 tablet:w-6 tablet:h-6 text-orange-500 mx-auto mb-1.5" />
                  <span className="block text-sx tablet:text-sm text-gray-500 mb-0.5">Đã bán</span>
                  <p className="font-semibold text-gray-900 text-sm tablet:text-md">
                    {food.soldCount?.toLocaleString("vi-VN")} phần
                  </p>
                </div>
              )}
              {food.rating && (
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-3 tablet:p-4 text-center transition-transform hover:scale-105">
                  <FiStar className="w-5 h-5 tablet:w-6 tablet:h-6 text-yellow-500 mx-auto mb-1.5" />
                  <span className="block text-sx tablet:text-sm text-gray-500 mb-0.5">
                    Đánh giá
                  </span>
                  <p className="font-semibold text-gray-900 text-sm tablet:text-md flex items-center justify-center">
                    {food.rating}
                    <span className="text-gray-400 font-normal">/5</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 tablet:px-6 py-3 tablet:py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="w-full px-4 py-2.5 tablet:py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-medium text-sm tablet:text-md desktop:text-base transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]">
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
};

export default FoodDetailModal;
