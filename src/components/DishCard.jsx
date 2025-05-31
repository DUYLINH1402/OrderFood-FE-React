import { useNavigate } from "react-router-dom";
import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import "./styles/DishCard.scss";
import { addToCart } from "../store/slices/cartSlice";
import { flyToCart } from "../utils/action";
import FlyImage from "./FlyImage";
import { addToCartApi } from "../services/service/cartService";
import { getToken } from "../services/auth/authApi";

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
  const variantName = currentVariant?.foodName || "Mặc định";

  const handleClick = () => {
    navigate(`/foods/slug/${slug}`);
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
      variantId: currentVariant?.id || null,
      quantity: 1,
    };

    dispatch(addToCart(cartItem)); // cập nhật UI ngay
    try {
      await addToCartApi(cartItem, token); // gọi API backend
    } catch (err) {
      console.error("Lỗi thêm vào giỏ hàng:", err);
    }
  };

  return (
    <div className="dish-card cursor-pointer" onClick={handleClick}>
      <div className="card_box">
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
            className="dish-card-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/foods/slug/${slug}`);
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
