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
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 lg:p-8 shadow-sm">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div>
            <h2 className="font-bold text-gray-800 text-base lg:text-xl">Gợi ý món khác</h2>
            <p className="text-gray-500 text-sx lg:text-sm">Từ danh mục "{categoryName}"</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
            <i className="fas fa-utensils text-white text-sx"></i>
          </div>
          <span>{relatedFoods.length} món</span>
        </div>
      </div>

      {/* Foods Grid */}
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: listHeight }}>
        <div
          ref={listRef}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 lg:gap-6">
          {(relatedFoods || []).map((item) => {
            const isUnavailable = item.status === "UNAVAILABLE";
            return (
              <div
                key={item.id}
                onClick={() => !isUnavailable && navigate(`/mon-an/chi-tiet/${item.slug}`)}
                className={`related-card group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 ${
                  isUnavailable
                    ? "opacity-70 cursor-not-allowed"
                    : "cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-green-200"
                }`}>
                {/* Image Container */}
                <div className="relative overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className={`w-full h-32 sm:h-40 lg:h-44 object-cover transition-transform duration-500 ${
                      isUnavailable ? "grayscale-[40%]" : "group-hover:scale-110"
                    }`}
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Unavailable Badge */}
                  {isUnavailable && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="bg-red-600 text-white text-sx px-3 py-1.5 rounded-full font-semibold shadow-lg">
                        <i className="fa-solid fa-ban mr-1.5"></i>
                        Hết hàng
                      </div>
                    </div>
                  )}

                  {/* Quick View Button */}
                  {!isUnavailable && (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sx font-medium text-green-600 shadow-md">
                        <i className="fas fa-eye mr-1"></i>
                        Xem
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 lg:p-4">
                  <h3
                    className={`font-semibold text-sm lg:text-base line-clamp-2 mb-2 transition-colors duration-200 ${
                      isUnavailable ? "text-gray-400" : "text-gray-800 group-hover:text-green-600"
                    }`}>
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p
                      className={`font-bold text-sm lg:text-base ${
                        isUnavailable ? "text-gray-400" : "text-green-600"
                      }`}>
                      {item.price.toLocaleString()}₫
                    </p>
                    {!isUnavailable && (
                      <div className="w-7 h-7 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-green-500 transition-colors duration-300">
                        <i className="fas fa-arrow-right text-sx text-green-600 group-hover:text-white transition-colors duration-300"></i>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Show More Button */}
      {relatedFoods.length > 5 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-0.5">
            <span className="text-sm lg:text-base">
              {showAll ? "Thu gọn" : `Xem thêm ${relatedFoods.length - 5} món`}
            </span>
            <i
              className={`fas ${
                showAll ? "fa-chevron-up" : "fa-chevron-down"
              } text-sm transition-transform duration-300 group-hover:translate-y-0.5`}></i>
          </button>
        </div>
      )}
    </div>
  );
}
