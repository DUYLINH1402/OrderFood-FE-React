import React from "react";
import useLike, { TARGET_TYPES } from "../../hooks/useLike";
import { toast } from "react-toastify";
import { getToken } from "../../services/auth/authApi";

// Format số lượt like cho hiển thị
const formatLikeCount = (count) => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return count.toString();
};

/**
 * Component LikeButton để hiển thị nút like với số lượng
 * Có thể tái sử dụng cho FOOD, POST, LOG, ...
 * @param {object} props
 * @param {string} props.targetType - Loại đối tượng (FOOD, POST, ...)
 * @param {number} props.targetId - ID của đối tượng
 * @param {number} props.initialLikeCount - Số lượt like ban đầu
 * @param {string} props.className - Custom class cho button
 * @param {string} props.tooltipLike - Text tooltip khi chưa like
 * @param {string} props.tooltipUnlike - Text tooltip khi đã like
 * @param {boolean} props.requireLogin - Có yêu cầu đăng nhập không (mặc định true)
 * @param {string} props.loginMessage - Message khi chưa đăng nhập
 */
const LikeButton = ({
  targetType = TARGET_TYPES.FOOD,
  targetId,
  initialLikeCount = 0,
  className = "",
  tooltipLike = "Thích",
  tooltipUnlike = "Bỏ thích",
  requireLogin = true,
  loginMessage = "Vui lòng đăng nhập để thích",
}) => {
  const token = getToken();

  // Hook quản lý Like
  const { likeCount, hasLiked, isToggling, handleToggleLike } = useLike(
    targetType,
    targetId,
    initialLikeCount
  );

  // Xử lý toggle like với toast notification
  const onToggleLike = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (requireLogin && !token) {
      toast.info(loginMessage);
      return;
    }

    await handleToggleLike(e);
  };

  return (
    <button
      onClick={onToggleLike}
      disabled={isToggling}
      className={`group relative flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 hover:scale-110 ${
        hasLiked
          ? "bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-500/50"
          : "hover:bg-white/80"
      } ${isToggling ? "opacity-70 cursor-wait" : ""} ${className}`}>
      <i
        className={`${
          hasLiked ? "fas text-white" : "far text-gray-700 group-hover:text-rose-500"
        } fa-thumbs-up text-base transition-all duration-300 ${hasLiked ? "scale-110" : ""} ${
          isToggling ? "animate-pulse" : ""
        }`}></i>

      {likeCount > 0 && (
        <span
          className={`text-sm font-bold min-w-[30px] text-center ${
            hasLiked ? "text-white" : "text-gray-700"
          }`}>
          {formatLikeCount(likeCount)}
        </span>
      )}

      {/* Tooltip */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sx px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg pointer-events-none z-10">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        {hasLiked ? tooltipUnlike : tooltipLike}
      </div>
    </button>
  );
};

export { TARGET_TYPES };
export default LikeButton;
