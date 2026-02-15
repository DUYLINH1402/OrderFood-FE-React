import React, { useState, useEffect, useCallback } from "react";
import { FiX, FiTrash2, FiAlertTriangle, FiLoader } from "react-icons/fi";

const PLACEHOLDER_IMAGE = "https://placehold.co/400x300/f3f4f6/9ca3af?text=No+Image";

const DeleteFoodModal = ({ food, isOpen, onClose, onConfirm, loading = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Animation
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setConfirmText("");
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
      setConfirmText("");
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

  // Handle confirm
  const handleConfirm = () => {
    if (confirmText.toLowerCase() !== "xoa") return;
    onConfirm(food.id);
  };

  if (!isOpen && !isClosing) return null;
  if (!food) return null;

  const imageUrl = food.imageUrl || food.image || PLACEHOLDER_IMAGE;
  const canDelete = confirmText.toLowerCase() === "xoa";

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
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden transform transition-all duration-300 ease-out ${
            isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
          }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FiTrash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Xóa món ăn</h2>
                  <p className="text-sm text-white/80">Hành động này không thể hoàn tác</p>
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
          <div className="p-6">
            {/* Warning */}
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
              <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Cảnh báo!</p>
                <p className="text-sm text-red-600 mt-1">
                  Bạn sắp xóa món ăn này khỏi hệ thống. Hành động này không thể hoàn tác và tất cả
                  dữ liệu liên quan sẽ bị mất.
                </p>
              </div>
            </div>

            {/* Food Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
              <img
                src={imageUrl}
                alt={food.name}
                className="w-16 h-16 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = PLACEHOLDER_IMAGE;
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{food.name}</h4>
                <p className="text-sm text-gray-500">{food.categoryName || "Chua phan loai"}</p>
                <p className="text-sm font-medium text-orange-600">
                  {food.price?.toLocaleString("vi-VN")} VNĐ
                </p>
              </div>
            </div>

            {/* Confirm Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhập <span className="font-bold text-red-600">"xoa"</span> để xác nhận
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder='Nhap "xoa" de xac nhan...'
                className="text-sx w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-2.5 border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50">
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading || !canDelete}
                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-sm text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {loading ? (
                  <>
                    <FiLoader className="w-6 h-6 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-6 h-6" />
                    Xóa món ăn
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

export default DeleteFoodModal;
