import React, { useEffect, useState } from "react";
import DishCard from "./DishCard";
import { getFeaturedFoods } from "../services/service/foodService";

const FeaturedDishesSection = () => {
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [page, setPage] = useState(0); // bắt đầu từ 0 (Spring Boot)
  const pageSize = 12;

  useEffect(() => {
    const fetchData = async () => {
      const data = await getFeaturedFoods(page, pageSize);
      setFeaturedDishes(data.content);
    };
    fetchData();
  }, []);
  return (
    <div className="grid grid-cols-1 min-[520px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2 sm:px-3 max-w-[1200px] mx-auto">
      {featuredDishes.map((featuredDishes) => (
        <DishCard
          key={featuredDishes.id}
          slug={featuredDishes.slug}
          name={featuredDishes.name}
          price={featuredDishes.price}
          imageUrl={featuredDishes.imageUrl}
          isFeatured={featuredDishes.isFeatured}
        />
      ))}
    </div>
  );
};

export default FeaturedDishesSection;
