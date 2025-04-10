import React, { useEffect, useState } from "react";
import DishCard from "./DishCard";
import { getNewFoods } from "../services/service/foodService";

const NewDishesSection = () => {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getNewFoods();
      setDishes(data);
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
