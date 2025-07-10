import React from "react";
import { Link } from "react-router-dom";
import useInView from "../../hooks/useInView";
import {
  useRemoveAnimation,
  getRemoveAnimationClasses,
  getControlsClasses,
  getRemoveButtonClasses,
} from "../../hooks/useRemoveAnimation";

const FavoriteDishItem = ({ item, onRemove, navigate, index = 0 }) => {
  const { isRemoving, handleRemoveWithAnimation } = useRemoveAnimation((foodId, variantId) =>
    onRemove(foodId, variantId)
  );
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
    rootMargin: "-30px 0px",
  });

  const { className, style } = getRemoveAnimationClasses(isRemoving, inView, index);

  return (
    <li
      ref={ref}
      className={`
        flex flex-col sm:flex-row sm:items-start sm:justify-between 
        gap-3 sm:gap-4 py-4 border-b border-gray-200 
        ${className}
      `}
      style={style}>
      <div
        className={`flex sm:items-center w-full cursor-pointer hover:bg-gray-100 transition duration-200 rounded-lg p-2 ${getControlsClasses(
          isRemoving
        )}`}
        onClick={() => !isRemoving && navigate(`/mon-an/chi-tiet/${item.foodSlug}`)}>
        <img
          src={item.foodImageUrl}
          alt={item.foodName}
          className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-md border flex-shrink-0"
        />
        <div className="ml-3 sm:ml-4 mt-2 sm:mt-0 leading-snug text-sm sm:text-base space-y-1">
          <h2 className="font-semibold text-gray-800 text-base sm:text-lg">{item.foodName}</h2>
          <p className="text-gray-500 text-sm sm:text-base">
            {item.variantName ? `Cách chế biến: ${item.variantName}` : ""}
          </p>
          {item.totalPrice !== undefined && (
            <p className="text-green-600 font-bold text-sm sm:text-base">
              Giá: {item.totalPrice.toLocaleString()}₫
            </p>
          )}
        </div>
      </div>
      <div
        className={`flex items-center gap-2 mt-2 sm:mt-0 self-end sm:self-center ${getControlsClasses(
          isRemoving
        )}`}>
        <Link
          to={`/mon-an/chi-tiet/${item.foodSlug}`}
          className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm sm:text-base whitespace-nowrap transition-all duration-200 ${getControlsClasses(
            isRemoving
          )}`}>
          Xem chi tiết
        </Link>
        <button
          onClick={() => handleRemoveWithAnimation(item.foodId, item.variantId)}
          disabled={isRemoving}
          className={getRemoveButtonClasses(isRemoving)}>
          {isRemoving ? "Đang xóa..." : "Xóa"}
        </button>
      </div>
    </li>
  );
};

export default FavoriteDishItem;
