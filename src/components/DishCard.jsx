import { useNavigate } from "react-router-dom";
import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../assets/styles/components/DishCard.scss";
import { addToCart } from "../store/slices/cartSlice";
import { flyToCart } from "../utils/action";
import FlyImage from "./FlyImage";
import { addToCartApi } from "../services/service/cartService";
import { getToken } from "../services/auth/authApi";
import { addToFavorites, removeFromFavorites } from "../services/service/favoriteService";
import { addFavorite, removeFavorite } from "../store/slices/favoriteSlice";

const DishCard = ({
  foodName,
  id,
  variants,
  price,
  slug,
  imageUrl,
  isNew,
  isFeatured,
  isBestSeller,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const imageRef = useRef();
  const token = getToken();

  const currentVariant = Array.isArray(variants) ? variants[0] : null;
  const variantId = currentVariant?.id || null;
  const variantName = currentVariant?.name || "Mặc định";

  // Lấy danh sách yêu thích từ Redux
  const favoriteList = useSelector((state) => state.favorite.list);
  const isFavorite =
    Array.isArray(favoriteList) &&
    favoriteList.some((item) => item.foodId === id && item.variantId === variantId);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    try {
      if (isFavorite) {
        await removeFromFavorites(id, variantId, token);
        dispatch(removeFavorite({ foodId: id, variantId }));
      } else {
        await addToFavorites(id, variantId, token);
        dispatch(addFavorite({ foodId: id, variantId }));
      }
    } catch (err) {
      console.error("Lỗi cập nhật yêu thích:", err);
    }
  };

  const handleClick = () => {
    navigate(`/mon-an/chi-tiet/${slug}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    window.forceShowHeader?.();

    setTimeout(() => {
      flyToCart(imageRef);
    }, 300);

    const cartItem = {
      foodId: id,
      slug,
      foodName,
      price: currentVariant?.price || price,
      imageUrl,
      variant: variantName,
      variantId: variantId,
      quantity: 1,
    };

    dispatch(addToCart(cartItem));
    try {
      await addToCartApi(cartItem, token);
    } catch (err) {
      console.error("Lỗi thêm vào giỏ hàng:", err);
    }
  };

  return (
    <div className="dish-card cursor-pointer" onClick={handleClick}>
      <div className="card_box relative">
        {token && variants?.length === 0 && (
          <button
            onClick={toggleFavorite}
            className="favorite-icon absolute w-15 h-15 flex items-center justify-center rounded-full shadow border border-red-300 bg-white/90 backdrop-blur-sm hover:scale-110 transition z-10"
            title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}>
            <i
              className={
                isFavorite
                  ? "fa-solid fa-heart text-red-500 p-3 bg-white rounded-full shadow border-2 border-red-500"
                  : "fa-regular fa-heart text-red-500 p-3 bg-white rounded-full shadow border-2 border-red-500 "
              }></i>
          </button>
        )}

        {isNew && <span className="is-new-foods"></span>}
        {isFeatured && <span className="is-featured-foods"></span>}
        {isBestSeller && <span className="is-best-seller-foods"></span>}

        <FlyImage
          ref={imageRef}
          src={imageUrl}
          alt={foodName}
          width={210}
          height={250}
          className="w-full h-[140px] sm:h-[160px] object-cover"
        />

        <h3 title={foodName} className="title-food">
          {foodName}
        </h3>
        <p className="price">{price.toLocaleString()}đ</p>

        <div className="action-wrapper">
          <button
            className="dish-card-action-btn sm:text-sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/mon-an/chi-tiet/${slug}`);
            }}>
            {variants?.length > 0 ? "Tuỳ chọn" : "Đặt ngay"}
            <i className="fa fa-shopping-basket"></i>
          </button>

          <button
            className="shopping-cart-icon"
            onClick={handleAddToCart}
            disabled={variants?.length > 0}
            title={variants?.length > 0 ? "Chọn biến thể trước" : "Thêm vào giỏ hàng"}
            style={variants?.length > 0 ? { opacity: 0.4, pointerEvents: "none" } : {}}>
            <i className="fa-solid fa-cart-arrow-down"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
