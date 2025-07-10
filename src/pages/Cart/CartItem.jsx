import React from "react";
import { useNavigate } from "react-router-dom";
import useInView from "../../hooks/useInView";
import {
  useRemoveAnimation,
  getRemoveAnimationClasses,
  getControlsClasses,
  getRemoveButtonClasses,
} from "../../hooks/useRemoveAnimation";
import LazyImage from "../../components/LazyImage";

const CartItem = ({ item, index, onUpdateQuantity, onRemoveItem }) => {
  const navigate = useNavigate();
  const { isRemoving, handleRemoveWithAnimation } = useRemoveAnimation((foodId, variantId) =>
    onRemoveItem(foodId, variantId)
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
        onClick={() => !isRemoving && navigate(`/mon-an/chi-tiet/${item.slug}`)}>
        <LazyImage
          src={item.imageUrl}
          alt={item.foodName}
          className="w-40 h-40 sm:w-40 sm:h-40 object-cover rounded-md border flex-shrink-0"
        />
        <div className="cart-food-infor ml-3 sm:ml-4 mt-2 sm:mt-0 leading-snug text-sm sm:text-base space-y-1">
          <h2 className="font-semibold text-gray-800 text-base sm:text-lg">{item.foodName}</h2>
          <p className="text-gray-500 text-sm sm:text-base">Cách chế biến: {item.variant}</p>
          <p className="text-gray-600 text-sm sm:text-base">
            Giá: {item.price.toLocaleString()}₫ × {item.quantity}
          </p>
        </div>
      </div>
      <div
        className={`flex items-center gap-2 mt-2 sm:mt-0 self-end sm:self-center ${getControlsClasses(
          isRemoving
        )}`}>
        <button
          onClick={() => onUpdateQuantity(item.foodId, item.variantId, item.quantity - 1)}
          disabled={item.quantity <= 1 || isRemoving}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 transition-all duration-200">
          −
        </button>
        <span className="w-8 h-8 flex items-center justify-center border border-transparent text-sm sm:text-base">
          {item.quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(item.foodId, item.variantId, item.quantity + 1)}
          disabled={isRemoving}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 transition-all duration-200">
          +
        </button>
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

export default CartItem;
