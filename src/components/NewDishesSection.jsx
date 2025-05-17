import React, { useEffect, useState } from "react";
import DishCard from "./DishCard";
import { getNewFoods } from "../services/service/foodService";

const NewDishesSection = () => {
  const [dishes, setDishes] = useState([]);
  const [page, setPage] = useState(0); // bắt đầu từ 0 (Spring Boot)
  const pageSize = 12;

  useEffect(() => {
    const fetchData = async () => {
      const data = await getNewFoods(page, pageSize);
      setDishes(data.content);
    };
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 min-[520px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2 sm:px-3 max-w-[1200px] mx-auto">
      {dishes.map((dish) => (
        <DishCard
          key={dish.id}
          slug={dish.slug}
          name={dish.name}
          price={dish.price}
          imageUrl={dish.imageUrl}
          isNew={dish.isNew}
        />
      ))}
    </div>
  );
};

export default NewDishesSection;
