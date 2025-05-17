import React, { useEffect, useState } from "react";
import DishCard from "./DishCard";
import { getBestSellerFoods } from "../services/service/foodService";

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
    <div className="grid grid-cols-1 min-[520px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2 sm:px-3 max-w-[1200px] mx-auto">
      {bestSellerDishes.map((bestSellerDishes) => (
        <DishCard
          key={bestSellerDishes.id}
          slug={bestSellerDishes.slug}
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
