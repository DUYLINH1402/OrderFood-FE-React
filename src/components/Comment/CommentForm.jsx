import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getToken } from "../../services/auth/authApi";

/**
 * Form nhập bình luận
 * Dùng cho cả comment mới và reply
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback khi submit (content) => Promise
 * @param {Function} props.onCancel - Callback khi hủy
 * @param {string} props.placeholder - Placeholder cho textarea
 * @param {string} props.submitText - Text nút submit
 * @param {string} props.initialValue - Giá trị ban đầu (khi edit)
 * @param {boolean} props.isSubmitting - Đang gửi request
 * @param {boolean} props.autoFocus - Tự động focus
 * @param {boolean} props.isReply - Là reply form
 * @param {string} props.replyToUser - Tên user đang reply
 */
const CommentForm = ({
  onSubmit,
  onCancel,
  placeholder = "Viết bình luận...",
  submitText = "Gửi",
  initialValue = "",
  isSubmitting = false,
  autoFocus = false,
  isReply = false,
  replyToUser = "",
}) => {
  const [content, setContent] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const token = getToken();
  const navigate = useNavigate();
  const location = useLocation();

  // Xử lý chuyển đến trang đăng nhập và ghi nhớ vị trí hiện tại
  const handleLoginRedirect = () => {
    const currentPath = location.pathname + location.search;
    localStorage.setItem("redirectAfterLogin", currentPath);
    navigate("/dang-nhap");
  };

  // Auto focus khi mount
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent || isSubmitting) return;

    try {
      await onSubmit(trimmedContent);
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (err) {
      // Error handled by parent
    }
  };

  const handleKeyDown = (e) => {
    // Submit khi Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit(e);
    }
    // Cancel khi Escape
    if (e.key === "Escape" && onCancel) {
      onCancel();
    }
  };

  // Nếu chưa đăng nhập
  if (!token) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <button
          onClick={handleLoginRedirect}
          className="flex text-md items-center justify-center gap-2 text-gray-600 hover:text-green-600 transition-colors duration-200 cursor-pointer w-full group">
          <i className="fas fa-sign-in-alt group-hover:scale-110 transition-transform duration-200"></i>
          <span className="group-hover:underline">Vui lòng đăng nhập để bình luận</span>
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Reply indicator */}
      {isReply && replyToUser && (
        <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
          <i className="fas fa-reply text-green-600"></i>
          <span>
            Đang trả lời <span className="font-medium text-gray-800">{replyToUser}</span>
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="ml-auto text-gray-400 hover:text-gray-600 transition-colors">
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      )}

      {/* Textarea container */}
      <div
        className={`relative bg-white rounded-xl border-2 transition-all duration-200 ${
          isFocused ? "border-green-400 shadow-md" : "border-gray-200 hover:border-gray-300"
        }`}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSubmitting}
          maxLength={2000}
          rows={isReply ? 2 : 3}
          className="w-full px-4 py-3 bg-transparent text-gray-800 placeholder-gray-400 resize-none focus:outline-none text-sm leading-relaxed"
        />

        {/* Footer với actions */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
          {/* Character count */}
          <div className="flex items-center gap-3 text-sx text-gray-400">
            <span>{content.length}/2000</span>
            <span className="hidden sm:inline">Ctrl + Enter để gửi</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50">
                Hủy
              </button>
            )}
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  <span>{submitText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
