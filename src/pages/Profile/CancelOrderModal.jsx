import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle, faSpinner, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { X } from "lucide-react";

/**
 * CancelOrderModal - Modal xác nhận hủy đơn hàng
 * @param {boolean} isOpen - Trạng thái mở/đóng modal
 * @param {function} onClose - Callback khi đóng modal
 * @param {function} onConfirm - Callback khi xác nhận hủy (nhận cancelReason)
 * @param {string} orderCode - Mã đơn hàng cần hủy
 * @param {boolean} loading - Trạng thái đang xử lý
 * @param {string} error - Thông báo lỗi (nếu có)
 */
const CancelOrderModal = ({
  isOpen,
  onClose,
  onConfirm,
  orderCode,
  loading = false,
  error = null,
}) => {
  const [cancelReason, setCancelReason] = useState("");
  const [validationError, setValidationError] = useState("");
  const textareaRef = useRef(null);

  // Các lý do hủy gợi ý
  const suggestedReasons = [
    "Đặt nhầm món",
    "Thay đổi địa chỉ giao hàng",
    "Muốn đặt thêm món khác",
    "Thay đổi phương thức thanh toán",
  ];

  // Reset state khi modal mở
  useEffect(() => {
    if (isOpen) {
      setCancelReason("");
      setValidationError("");
      // Focus vào textarea khi modal mở
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Xử lý khi chọn lý do gợi ý
  const handleSelectSuggestion = (reason) => {
    setCancelReason(reason);
    setValidationError("");
  };

  // Xử lý khi thay đổi textarea
  const handleReasonChange = (e) => {
    setCancelReason(e.target.value);
    if (e.target.value.trim()) {
      setValidationError("");
    }
  };

  // Xử lý xác nhận hủy
  const handleConfirm = () => {
    const trimmedReason = cancelReason.trim();

    if (!trimmedReason) {
      setValidationError("Vui lòng nhập lý do hủy đơn hàng");
      textareaRef.current?.focus();
      return;
    }

    if (trimmedReason.length < 5) {
      setValidationError("Lý do hủy phải có ít nhất 5 ký tự");
      textareaRef.current?.focus();
      return;
    }

    onConfirm(trimmedReason);
  };

  // Xử lý click vào backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  // Xử lý phím Enter/Escape
  const handleKeyDown = (e) => {
    if (e.key === "Escape" && !loading) {
      onClose();
    }
    if (e.key === "Enter" && e.ctrlKey && !loading) {
      handleConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Hủy đơn hàng</h3>
              <p className="text-sm text-gray-500">#{orderCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Thông báo cảnh báo */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
            </p>
          </div>

          {/* Lý do gợi ý */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn nhanh lý do:
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestedReasons.map((reason, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSuggestion(reason)}
                  disabled={loading}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 disabled:opacity-50 ${
                    cancelReason === reason
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-white text-gray-600 border-gray-300 hover:border-red-300 hover:bg-red-50"
                  }`}>
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea nhập lý do */}
          <div className="mb-4">
            <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-2">
              Lý do hủy đơn hàng <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={textareaRef}
              id="cancelReason"
              value={cancelReason}
              onChange={handleReasonChange}
              disabled={loading}
              placeholder="Nhập lý do hủy đơn hàng của bạn..."
              rows={3}
              className={`w-full text-sm px-4 py-3 border rounded-lg resize-none transition-all duration-200 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                validationError
                  ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                  : "border-gray-300 focus:ring-red-200 focus:border-red-400"
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {validationError ? (
                <p className="text-sm text-red-500">{validationError}</p>
              ) : (
                <p className="text-sx text-gray-400">Ctrl + Enter để xác nhận</p>
              )}
              <span className="text-sx text-gray-400">{cancelReason.length}/200</span>
            </div>
          </div>

          {/* Hiển thị lỗi từ API */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Đóng
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !cancelReason.trim()}
            className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md">
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin" />
                Đang hủy...
              </>
            ) : (
              <>Xác nhận hủy</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
