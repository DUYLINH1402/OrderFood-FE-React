import React, { useEffect, useState } from "react";
import "../styles/FoodGrid.scss";
import DishCard from "../../components/DishCard";
import {
  getAllFoods,
  getBestSellerFoods,
  getFoodsByCategorySlug,
} from "../../services/service/foodService";

const FoodGrid = ({ slug }) => {
  // console.log("Domain: ", import.meta.env.VITE_API_BASE_URL);
  const [foods, setFoods] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0); // bắt đầu từ 0 (Spring Boot)
  const pageSize = 12;

  useEffect(() => {
    setPage(0); // reset page khi đổi danh mục
  }, [slug]);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        let data;

        if (slug === "best-seller") {
          data = await getBestSellerFoods(page, pageSize);
        } else if (slug) {
          data = await getFoodsByCategorySlug(slug, page, pageSize);
        } else {
          data = await getAllFoods(page, pageSize);
        }

        if (!data?.content) {
          console.error("Dữ liệu không hợp lệ:", data);
          return;
        }

        // console.log("Foods từ BE:", data.content);
        setFoods(data.content);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };
    fetchFoods();
  }, [slug, page]);

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
            slug={food.slug} // slug là duy nhất
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
        {(() => {
          const isMobile = window.innerWidth < 640; // sm breakpoint
          const maxVisible = isMobile ? 3 : 5;
          const half = Math.floor(maxVisible / 2);
          let start = Math.max(0, page - half);
          let end = start + maxVisible;

          if (end > totalPages) {
            end = totalPages;
            start = Math.max(0, end - maxVisible);
          }

          return [...Array(totalPages)].map((_, i) => {
            if (i < start || i >= end) return null;
            return (
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={i === page ? "active" : ""}>
                {i + 1}
              </button>
            );
          });
        })()}

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
