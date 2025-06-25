import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFoodsByCategoryID } from "../../../services/service/foodService";
import SkeletonSection from "../../../components/Skeleton/SkeletonSection";

export default function RelatedFoods({ categoryId, excludeId, categoryName }) {
  const [relatedFoods, setRelatedFoods] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [listHeight, setListHeight] = useState("auto");
  const listRef = useRef(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      const cacheKey = `related-${categoryId}`;
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached);
        setRelatedFoods(parsed.filter((item) => item.id !== excludeId));
        setIsLoading(false);
        return;
      }

      try {
        const res = await getFoodsByCategoryID(categoryId);
        const filtered = res.content?.filter((item) => item.id !== excludeId) || [];
        setRelatedFoods(filtered);
        // Lưu vào sessionStorage để sử dụng lại tránh gọi API nhiều lần
        sessionStorage.setItem(cacheKey, JSON.stringify(res.content || []));
      } catch (err) {
        console.error("Lỗi tải món liên quan:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [categoryId, excludeId]);

  useEffect(() => {
    if (!listRef.current) return;
    if (showAll) {
      setListHeight(`${listRef.current.scrollHeight}px`);
    } else {
      const card = listRef.current.querySelector(".related-card");
      if (card) {
        const height = card.offsetHeight;
        setListHeight(`${height + 5}px`);
      }
    }
  }, [showAll, relatedFoods]);

  if (isLoading) return <SkeletonSection />;
  if (relatedFoods.length === 0) return null;

  return (
    <div className="m-16 col-span-2">
      <h2 className="font-bold mb-4 text-gray-800 text-sm laptop:text-lg">
        Gợi ý món khác từ "{categoryName}"
      </h2>
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: listHeight }}>
        <div ref={listRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {relatedFoods.map((item) => (
            <div
              key={item.id}
              className="related-card cursor-pointer hover:shadow-lg border rounded-xl p-3 transition hover:scale-105"
              onClick={() => navigate(`/foods/slug/${item.slug}`)}>
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-64 object-cover rounded-md mb-2"
              />
              <h3 className="font-semibold text-gray-700 text-sm laptop:text-base">{item.name}</h3>
              <p className="text-[#199b7e] font-semibold text-sm laptop:text-base">
                {item.price.toLocaleString()}₫
              </p>
            </div>
          ))}
        </div>
      </div>

      {relatedFoods.length > 5 && (
        <span className="flex justify-center text-center mt-4">
          <button
            className="btn w-fit p-4 text-white font-semibold hover:opacity-80 text-sm laptop:text-base"
            onClick={() => setShowAll(!showAll)}>
            {showAll ? "Thu gọn" : "Xem thêm"}
          </button>
        </span>
      )}
    </div>
  );
}
