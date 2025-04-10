import React, { useEffect, useState } from "react";
import DishCard from "./DishCard";
import { getBestSellerFoods } from "../services/service/foodService";

const FavoriteDishesSection = () => {
  const [bestSellerDishes, setBestSellerDishes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getBestSellerFoods();
      setBestSellerDishes(data);
    };
    fetchData();
  }, []);

  return (
    <div className="dish-card-wrap">
      {bestSellerDishes.map((bestSellerDishes) => (
        <DishCard
          key={bestSellerDishes.id}
          name={bestSellerDishes.name}
          price={bestSellerDishes.price}
          imageUrl={bestSellerDishes.imageUrl}
          isBestSeller={bestSellerDishes.isBestSeller}
        />
      ))}
    </div>
  );
};

export default FavoriteDishesSection;
