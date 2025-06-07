import React, { useEffect, useState } from "react";
import "../styles/FoodGrid.scss";
import DishCard from "../../components/DishCard";
import {
  getAllFoods,
  getBestSellerFoods,
  getFoodsByCategorySlug,
} from "../../services/service/foodService";
import { SkeletonFood } from "../../components/Skeleton/SkeletonFood";

const FoodGrid = ({ slug }) => {
  const [foods, setFoods] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0); // bắt đầu từ 0 (Spring Boot)
  const pageSize = 12;

  useEffect(() => {
    setPage(0); // reset page khi đổi danh mục
  }, [slug]);

  useEffect(() => {
    const fetchFoods = async () => {
      setIsLoading(true);
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

        setFoods(data.content);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFoods();
  }, [slug, page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      //  Scroll lên đầu trang
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="food-grid-container">
      <div className="food-grid">
        {isLoading
          ? [...Array(pageSize)].map((_, idx) => <SkeletonFood key={idx} />)
          : foods.map((food) => (
              <DishCard
                key={food.id}
                id={food.id}
                slug={food.slug}
                foodName={food.name}
                price={food.price}
                imageUrl={food.imageUrl}
                isNew={food.isNew}
                isFeatured={food.isFeatured}
                isBestSeller={food.isBestSeller}
              />
            ))}
      </div>
      <div className="pagination sm:text-base">
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
