import React from "react";
import { useParams, useNavigate } from "react-router-dom";

import "./styles/DishCard.scss";
import LazyImage from "./LazyImage";

const DishCard = ({ name, price, slug, imageUrl, isNew, isFeatured, isBestSeller }) => {
  const navigate = useNavigate();
  // console.log("Slug trong DishCard:", slug);

  const handleClick = () => {
    navigate(`/foods/slug/${slug}`);
  };

  return (
    <div className="dish-card cursor-pointer" onClick={handleClick}>
      <div className="card_box">
        {isNew && <span className="is-new-foods"></span>}
        {isFeatured && <span className="is-featured-foods"></span>}
        {isBestSeller && <span className="is-best-seller-foods"></span>}
        <LazyImage
          src={imageUrl}
          alt={name}
          width={210}
          height={250}
          className="w-full h-[140px] sm:h-[160px] object-cover"
        />
        <h3 title={name} className="title-food">
          {name}{" "}
        </h3>
        <p className="price">{price.toLocaleString()}đ</p>
        <div className="action-wrapper">
          <button className="dish-card-action-btn">
            Đặt ngay
            <i className="fa fa-shopping-basket"></i>
          </button>
          <button className="shopping-cart-icon">
            <i class="fa-solid fa-cart-arrow-down"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
