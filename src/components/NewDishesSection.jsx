import React, { useEffect, useState } from "react";
import DishCard from "./DishCard";
import { getNewFoods } from "../services/service/foodService";
import HorizontalScrollSection from "../utils/action";
import SkeletonSection from "./Skeleton/SkeletonSection";

const NewDishesSection = () => {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getNewFoods(0, 12);
      setDishes(data.content);
    };
    fetchData();
  }, []);
  if (!dishes) return <SkeletonSection />;
  return (
    <HorizontalScrollSection
      title="Món Mới"
      items={dishes}
      renderItem={(dish) => (
        <DishCard
          id={dish.id}
          slug={dish.slug}
          foodName={dish.name}
          price={dish.price}
          imageUrl={dish.imageUrl}
          variants={dish.variants}
          isNew={dish.isNew}
        />
      )}
    />
  );
};

export default NewDishesSection;
