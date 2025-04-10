import React from "react";
import "./styles/DishCard.scss";
import shopping_cart from "../assets/icons/shopping_cart.png";
import LazyImage from "./LazyImage";

const DishCard = ({ name, price, imageUrl, isNew, isFeatured, isBestSeller }) => {
  return (
    <div className="dish-card">
      <div className="card_box">
        {isNew && <span className="is-new-foods"></span>}
        {isFeatured && <span className="is-featured-foods"></span>}
        {isBestSeller && <span className="is-best-seller-foods"></span>}
        <LazyImage src={imageUrl} alt={name} width={250} height={250} />
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
