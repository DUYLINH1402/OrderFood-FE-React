import React, { useEffect, useState, useRef } from "react";
import DishCard from "../../components/DishCard";
import {
  getAllFoods,
  getBestSellerFoods,
  getFoodsByCategorySlug,
} from "../../services/service/foodService";
import { SkeletonFood } from "../../components/Skeleton/SkeletonFood";
import "../../assets/styles/pages/FoodGrid.scss";
import { useNavigate } from "react-router-dom";
import ScrollRevealContainer from "../../components/ScrollRevealContainer";

// Component cho từng item với scroll reveal animation
function FoodGridItem({ food, index = 0 }) {
  return (
    <ScrollRevealContainer index={index}>
      <DishCard
        id={food.id}
        slug={food.slug}
        foodName={food.name}
        price={food.price}
        imageUrl={food.imageUrl}
        isNew={food.isNew}
        isFeatured={food.isFeatured}
        isBestSeller={food.isBestSeller}
        variants={food.variants}
        status={food.status}
        statusNote={food.statusNote}
      />
    </ScrollRevealContainer>
  );
}

const FoodGrid = ({ slug, categoryNameChain = [] }) => {
  const [foods, setFoods] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0); // bắt đầu từ 0 (Spring Boot)
  const pageSize = 24;
  const navigate = useNavigate();

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
          ? Array.from({ length: pageSize }).map((_, idx) => <SkeletonFood key={idx} />)
          : (foods || []).map((food, index) => (
              <FoodGridItem key={food.id} food={food} index={index} />
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

          return Array.from({ length: totalPages }).map((_, i) => {
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
