import React, { useEffect, useState } from "react";
import DishCard from "./DishCard";
import { getBestSellerFoods } from "../services/service/foodService";
import HorizontalScrollSection from "../utils/action";

const FavoriteDishesSection = () => {
  const [bestSellerDishes, setBestSellerDishes] = useState([]);
  const [page, setPage] = useState(0); // bắt đầu từ 0 (Spring Boot)
  const pageSize = 12;

  useEffect(() => {
    const fetchData = async () => {
      const data = await getBestSellerFoods(page, pageSize);
      setBestSellerDishes(data.content);
    };
    fetchData();
  }, []);

  return (
    <HorizontalScrollSection
      items={bestSellerDishes}
      renderItem={(dish) => (
        <DishCard
          key={dish.id}
          id={dish.id}
          slug={dish.slug}
          foodName={dish.name}
          price={dish.price}
          imageUrl={dish.imageUrl}
          variants={dish.variants}
          isBestSeller={dish.isBestSeller}
        />
      )}
    />
  );
};
export default FavoriteDishesSection;
