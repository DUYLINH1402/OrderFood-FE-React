import React, { useEffect, useState } from "react";
import DishCard from "../../components/DishCard";
import { getNewFoods } from "../../services/service/foodService";
import HorizontalScrollSection from "../../utils/action";
import SkeletonSection from "../../components/Skeleton/SkeletonSection";

const NewDishesSection = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getNewFoods(0, 12);
      setDishes(data.content);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <SkeletonSection />;

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
          status={dish.status}
          statusNote={dish.statusNote}
        />
      )}
    />
  );
};

export default NewDishesSection;
