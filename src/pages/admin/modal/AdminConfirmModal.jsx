import React from "react";
import { FiAlertTriangle, FiX, FiLoader } from "react-icons/fi";

/**
 * AdminConfirmModal - Modal xác nhận cho Admin
 * @param {boolean} isOpen - Trạng thái mở/đóng modal
 * @param {function} onClose - Callback khi đóng modal
 * @param {function} onConfirm - Callback khi xác nhận
 * @param {string} title - Tiêu đề modal
 * @param {string} message - Nội dung thông báo
 * @param {string} confirmText - Text nút xác nhận (default: "Xác nhận")
 * @param {string} cancelText - Text nút hủy (default: "Hủy")
 * @param {string} type - Loại modal: "danger" | "warning" | "info" (default: "danger")
 * @param {boolean} loading - Trạng thái loading
 */
const AdminConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "danger",
  loading = false,
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      buttonBg: "bg-red-500 hover:bg-red-600",
    },
    warning: {
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      buttonBg: "bg-yellow-500 hover:bg-yellow-600",
    },
    info: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      buttonBg: "bg-blue-500 hover:bg-blue-600",
    },
  };

  const currentStyle = typeStyles[type] || typeStyles.danger;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-12 h-12 ${currentStyle.iconBg} rounded-full flex items-center justify-center`}>
              <FiAlertTriangle className={`w-6 h-6 ${currentStyle.iconColor}`} />
            </div>
            <div className="flex-1 pt-1">
              <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${currentStyle.buttonBg}`}>
            {loading ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminConfirmModal;
