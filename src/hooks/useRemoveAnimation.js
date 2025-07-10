import { useState } from "react";

/**
 * Custom hook để xử lý animation khi xóa item
 * @param {Function} onRemove - Function được gọi sau khi animation hoàn thành
 * @param {number} delay - Thời gian delay trước khi gọi onRemove (ms)
 * @returns {Object} - { isRemoving, handleRemoveWithAnimation }
 */
export const useRemoveAnimation = (onRemove, delay = 500) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveWithAnimation = (...args) => {
    setIsRemoving(true);
    // Delay để animation có thời gian chạy trước khi xóa thật
    setTimeout(() => {
      onRemove(...args);
    }, delay);
  };

  return {
    isRemoving,
    handleRemoveWithAnimation,
  };
};

/**
 * Tạo CSS classes cho animation xóa
 * @param {boolean} isRemoving - Trạng thái đang xóa
 * @param {boolean} inView - Trạng thái hiển thị trong viewport
 * @param {number} index - Index để stagger animation
 * @returns {Object} - { className, style }
 */
export const getRemoveAnimationClasses = (isRemoving, inView, index = 0) => {
  const className = `
    transition-all duration-500 ease-out
    ${isRemoving ? "opacity-0 scale-95 -translate-x-12 max-h-0 mb-0 py-0 overflow-hidden" : ""}
    ${inView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}
  `;

  const style = {
    transitionDelay: isRemoving ? "0s" : `${index * 0.1}s`,
    maxHeight: isRemoving ? "0px" : "500px",
  };

  return { className, style };
};

/**
 * Tạo CSS classes cho controls khi đang xóa
 * @param {boolean} isRemoving - Trạng thái đang xóa
 * @returns {string} - CSS classes
 */
export const getControlsClasses = (isRemoving) => {
  return `${isRemoving ? "pointer-events-none opacity-50" : ""}`;
};

/**
 * Tạo CSS classes cho button xóa
 * @param {boolean} isRemoving - Trạng thái đang xóa
 * @returns {string} - CSS classes
 */
export const getRemoveButtonClasses = (isRemoving) => {
  return `text-sm sm:text-base transition-all duration-200 ${
    isRemoving
      ? "text-gray-400 cursor-not-allowed"
      : "text-red-500 hover:text-red-700 hover:underline"
  }`;
};
