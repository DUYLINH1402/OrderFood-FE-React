import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeartBroken } from "react-icons/fa";
import { getFavorites, removeFromFavorites } from "../services/service/favoriteService";
import { toast } from "react-toastify";

const FavoriteDishes = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, [token]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await getFavorites(token);
      console.log("Fetched favorites:", res);
      const favoritesArr = Array.isArray(res?.data) ? res.data : [];
      setFavorites(favoritesArr);
    } catch (error) {
      setFavorites([]);
    }
    setLoading(false);
  };

  const handleRemoveFavorite = async (foodId, variantId) => {
    try {
      await removeFromFavorites(foodId, variantId, token);
      setFavorites((prev) =>
        prev.filter((item) => !(item.foodId === foodId && item.variantId === variantId))
      );
      toast.success("Đã xóa khỏi yêu thích!");
    } catch (err) {
      toast.error("Xóa khỏi yêu thích thất bại.");
    }
  };

  return (
    <div className="cart-wrap m-10 max-w-5xl mx-auto p-8 sm:m-10 sm:text-base border border-gray-300 rounded-lg shadow-lg bg-white">
      <h1 className="text-base sm:text-lg font-bold mb-4 text-green-700 flex items-center gap-2">
        <span>❤️</span> Món Yêu Thích ({favorites.length})
      </h1>
      {loading ? (
        <div className="text-center text-gray-500 py-12">Đang tải...</div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg shadow">
          <FaHeartBroken className="text-5xl text-gray-400 mb-4" />
          <p className="text-lg text-gray-600 mb-2">
            Bạn chưa có món nào trong danh sách yêu thích.
          </p>
          <Link
            to="/thuc-don"
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Khám phá thực đơn
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {favorites.map((item) => (
            <li
              key={`${item.foodId}-${item.variantId}`}
              className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 py-4">
              <div
                className="flex sm:items-center w-full cursor-pointer hover:bg-gray-100 transition duration-200 rounded-lg p-2"
                onClick={() => navigate(`/mon-an/chi-tiet/${item.foodSlug}`)}>
                <img
                  src={item.foodImageUrl}
                  alt={item.foodName}
                  className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-md border flex-shrink-0"
                />
                <div className="ml-3 sm:ml-4 mt-2 sm:mt-0 leading-snug text-sm sm:text-base space-y-1">
                  <h2 className="font-semibold text-gray-800 text-base sm:text-lg">
                    {item.foodName}
                  </h2>
                  <p className="text-gray-500 text-sm sm:text-base">
                    {item.variantName ? `Cách chế biến: ${item.variantName}` : ""}
                  </p>
                  {item.totalPrice !== undefined && (
                    <p className="text-green-600 font-bold text-sm sm:text-base">
                      Giá: {item.totalPrice.toLocaleString()}₫
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0 self-end sm:self-center">
                <Link
                  to={`/mon-an/chi-tiet/${item.foodSlug}`}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm sm:text-base whitespace-nowrap">
                  Xem chi tiết
                </Link>
                <button
                  onClick={() => handleRemoveFavorite(item.foodId, item.variantId)}
                  className="text-red-500 hover:underline text-sm sm:text-base">
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FavoriteDishes;
