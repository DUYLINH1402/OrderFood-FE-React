import React, { useState, useEffect, useCallback } from "react";
import { FiX, FiAlertCircle, FiCheckCircle, FiAlertTriangle, FiLoader } from "react-icons/fi";

// Placeholder image khi không có ảnh món ăn
const PLACEHOLDER_IMAGE = "https://placehold.co/400x300/f3f4f6/9ca3af?text=No+Image";

// Các lý do hết hàng được định nghĩa sẵn
const OUT_OF_STOCK_REASONS = [
  { value: "out_of_ingredients", label: "Hết nguyên liệu", icon: FiAlertCircle },
  { value: "kitchen_overload", label: "Bếp quá tải", icon: FiAlertTriangle },
  { value: "equipment_issue", label: "Thiết bị gặp sự cố", icon: FiAlertTriangle },
  { value: "quality_issue", label: "Vấn đề chất lượng", icon: FiAlertCircle },
  { value: "seasonal", label: "Hết mùa/Không còn cung cấp", icon: FiAlertCircle },
  { value: "other", label: "Lý do khác", icon: FiAlertCircle },
];

const StatusChangeModal = ({ food, newStatus, isOpen, onClose, onConfirm, loading = false }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Animation khi mở modal
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setImageLoaded(false);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Xử lý đóng modal với animation
  const handleCloseWithAnimation = useCallback(() => {
    if (loading) return; // Không cho đóng khi đang loading
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      setSelectedReason("");
      setCustomNote("");
      setIsClosing(false);
      onClose();
    }, 300);
  }, [onClose, loading]);

  // Xử lý phím ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        handleCloseWithAnimation();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleCloseWithAnimation, loading]);

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

  // Lấy URL ảnh (hỗ trợ cả imageUrl và image từ BE)
  const imageUrl = food.imageUrl || food.image || PLACEHOLDER_IMAGE;

  // Cấu hình hiển thị theo trạng thái mới
  const getStatusConfig = () => {
    switch (newStatus) {
      case "AVAILABLE":
        return {
          icon: FiCheckCircle,
          title: "Xác nhận có sẵn trở lại",
          description: `Bạn có chắc chắn muốn đánh dấu món ăn này là có sẵn?`,
          buttonText: "Xác nhận có sẵn",
          buttonClass: "from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
          iconClass: "text-green-500",
          iconBgClass: "bg-green-100",
          showReasons: false,
        };
      case "UNAVAILABLE":
        return {
          icon: FiAlertTriangle,
          title: "Đánh dấu hết hàng",
          description: `Vui lòng chọn lý do tại sao món ăn này hết hàng:`,
          buttonText: "Xác nhận hết hàng",
          buttonClass: "from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700",
          iconClass: "text-amber-500",
          iconBgClass: "bg-amber-100",
          showReasons: true,
        };
      default:
        return {
          icon: FiAlertCircle,
          title: "Thay đổi trạng thái",
          description: `Xác nhận thay đổi trạng thái cho món ăn này?`,
          buttonText: "Xác nhận",
          buttonClass: "from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
          iconClass: "text-blue-500",
          iconBgClass: "bg-blue-100",
          showReasons: false,
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  // Xử lý xác nhận
  const handleConfirm = () => {
    let note = "";
    if (config.showReasons) {
      const reasonLabel = OUT_OF_STOCK_REASONS.find((r) => r.value === selectedReason)?.label || "";
      note = selectedReason === "other" ? customNote : reasonLabel;
      if (customNote && selectedReason !== "other") {
        note += ` - ${customNote}`;
      }
    }
    onConfirm(food.id, newStatus, note);
  };

  // Kiểm tra form hợp lệ
  const isFormValid =
    !config.showReasons || (selectedReason && (selectedReason !== "other" || customNote.trim()));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay với hiệu ứng blur */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleCloseWithAnimation}
      />

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-2 tablet:p-4">
        <div
          className={`relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden mx-2 tablet:mx-0 transform transition-all duration-300 ease-out ${
            isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
          }`}>
          {/* Header */}
          <div className="relative px-4 py-4 tablet:px-6 tablet:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center">
              <div className={`p-2.5 tablet:p-3 rounded-xl ${config.iconBgClass} mr-3 tablet:mr-4`}>
                <IconComponent className={`w-5 h-5 tablet:w-6 tablet:h-6 ${config.iconClass}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-md tablet:text-base desktop:text-lg font-bold text-gray-900">
                  {config.title}
                </h3>
                <p className="text-sx tablet:text-sm text-gray-500 mt-0.5">
                  Thay đổi trạng thái món ăn
                </p>
              </div>
              <button
                onClick={handleCloseWithAnimation}
                disabled={loading}
                className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">
                <FiX className="w-4 h-4 tablet:w-5 tablet:h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 py-4 tablet:px-6 tablet:py-5">
            {/* Thông tin món ăn */}
            <div className="flex items-center mb-4 tablet:mb-5 p-3 tablet:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-100">
              <div className="relative w-14 h-14 tablet:w-18 tablet:h-18 flex-shrink-0">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-xl" />
                )}
                <img
                  src={imageUrl}
                  alt={food.name}
                  className={`w-full h-full object-cover rounded-xl shadow-md transition-all duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE;
                    setImageLoaded(true);
                  }}
                />
              </div>
              <div className="ml-3 tablet:ml-4 flex-1 min-w-0">
                <h4 className="text-sm tablet:text-md desktop:text-base font-semibold text-gray-900 truncate">
                  {food.name}
                </h4>
                <p className="text-sx tablet:text-sm text-gray-500 truncate">
                  {food.categoryName || food.category || "Chưa phân loại"}
                </p>
                <p className="text-sm tablet:text-md font-bold text-orange-600 mt-1">
                  {food.price?.toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>

            <p className="text-sm tablet:text-md text-gray-600 mb-4 tablet:mb-5 leading-relaxed">
              {config.description}
            </p>

            {/* Chọn lý do nếu cần */}
            {config.showReasons && (
              <div className="space-y-4">
                {/* Radio buttons cho lý do */}
                <div>
                  <label className="block text-sm tablet:text-md font-semibold text-gray-700 mb-3">
                    Chọn lý do hết hàng
                  </label>
                  <div className="space-y-2">
                    {OUT_OF_STOCK_REASONS.map((reason) => (
                      <label
                        key={reason.value}
                        className={`flex items-center p-3 tablet:p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          selectedReason === reason.value
                            ? "border-orange-400 bg-orange-50 shadow-sm"
                            : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100"
                        }`}>
                        <input
                          type="radio"
                          name="reason"
                          value={reason.value}
                          checked={selectedReason === reason.value}
                          onChange={(e) => setSelectedReason(e.target.value)}
                          className="w-4 h-4 text-orange-500 focus:ring-orange-400 focus:ring-offset-0"
                        />
                        <span className="ml-3 text-sm tablet:text-md text-gray-700 font-medium">
                          {reason.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Ghi chú thêm */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    selectedReason ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}>
                  <label className="block text-sm tablet:text-md font-semibold text-gray-700 mb-2">
                    {selectedReason === "other" ? "Nhập lý do cụ thể" : "Ghi chú thêm (tùy chọn)"}
                  </label>
                  <textarea
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder={
                      selectedReason === "other"
                        ? "Vui lòng nhập lý do cụ thể..."
                        : "Nhập ghi chú chi tiết nếu cần..."
                    }
                    rows={3}
                    className="w-full px-3 py-2.5 tablet:px-4 tablet:py-3 text-sm tablet:text-md border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none transition-all duration-200 placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 tablet:px-6 tablet:py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-100 flex flex-col tablet:flex-row justify-end gap-2 tablet:gap-3">
            <button
              onClick={handleCloseWithAnimation}
              disabled={loading}
              className="px-4 py-2.5 tablet:px-5 tablet:py-2.5 text-sm tablet:text-md bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed order-2 tablet:order-1">
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !isFormValid}
              className={`px-4 py-2.5 tablet:px-5 tablet:py-2.5 text-sm tablet:text-md text-white rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center bg-gradient-to-r shadow-md hover:shadow-lg active:scale-[0.98] order-1 tablet:order-2 ${config.buttonClass}`}>
              {loading ? (
                <>
                  <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4 tablet:h-5 tablet:w-5" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <IconComponent className="w-4 h-4 tablet:w-5 tablet:h-5 mr-2" />
                  {config.buttonText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;
