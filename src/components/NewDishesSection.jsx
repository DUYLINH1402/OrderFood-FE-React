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
    <div className="dish-card-wrap">
      {dishes.map((dish) => (
        <DishCard
          key={dish.id}
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
