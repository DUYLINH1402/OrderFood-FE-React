import React, { useEffect, useState } from "react";
import "../styles/FoodGrid.scss";
import DishCard from "../../components/DishCard";
import { getAllFoods, getFoodsByCategory } from "../../services/service/foodService";

const FoodGrid = ({ categoryId }) => {
  const [foods, setFoods] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0); // bắt đầu từ 0 (Spring Boot)
  const pageSize = 12;

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const data = categoryId
          ? await getFoodsByCategory(categoryId, page, pageSize)
          : await getAllFoods(page, pageSize);

        if (!data?.content) {
          console.error("Dữ liệu không hợp lệ:", data);
          return;
        }

        setFoods(data.content);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    fetchFoods();
  }, [categoryId, page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="food-grid-container">
      <div className="food-grid">
        {foods.map((food) => (
          <DishCard
            key={food.id}
            name={food.name}
            price={food.price}
            imageUrl={food.imageUrl}
            isNew={food.isNew}
            isFeatured={food.isFeatured}
            isBestSeller={food.isBestSeller}
          />
        ))}
      </div>
      <div className="pagination">
        <button onClick={() => handlePageChange(0)} disabled={page === 0}>
          {"<<"}
        </button>
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
          {"<"}
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={i === page ? "active" : ""}>
            {i + 1}
          </button>
        ))}
        <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages - 1}>
          {">"}
        </button>
        <button onClick={() => handlePageChange(totalPages - 1)} disabled={page === totalPages - 1}>
          {">>"}
        </button>
      </div>
    </div>
  );
};

export default FoodGrid;
