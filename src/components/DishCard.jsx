import { useNavigate } from "react-router-dom";
import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import "./styles/DishCard.scss";
import { addToCart } from "../store/slices/cartSlice";
import { flyToCart } from "../utils/action";
import FlyImage from "./FlyImage";

const DishCard = ({
  name,
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

  const currentVariant = Array.isArray(variants) ? variants[0] : null;
  const variantName = currentVariant?.name || "Mặc định";

  const handleClick = () => {
    navigate(`/foods/slug/${slug}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();

    window.forceShowHeader?.();

    setTimeout(() => {
      flyToCart(imageRef);
    }, 300);

    dispatch(
      addToCart({
        foodId: id,
        slug,
        name,
        price: currentVariant?.price || price,
        image: imageUrl,
        variant: variantName,
        quantity: 1,
      })
    );
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
          alt={name}
          width={210}
          height={250}
          className="w-full h-[140px] sm:h-[160px] object-cover"
        />

        <h3 title={name} className="title-food">
          {name}
        </h3>
        <p className="price">{price.toLocaleString()}đ</p>

        <div className="action-wrapper">
          <button className="dish-card-action-btn">
            Đặt ngay
            <i className="fa fa-shopping-basket"></i>
          </button>

          <button className="shopping-cart-icon" onClick={handleAddToCart}>
            <i className="fa-solid fa-cart-arrow-down"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
