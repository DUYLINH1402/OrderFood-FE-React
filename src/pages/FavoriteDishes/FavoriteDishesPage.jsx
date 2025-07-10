import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeartBroken } from "react-icons/fa";
import { getFavorites, removeFromFavorites } from "../../services/service/favoriteService";
import { toast } from "react-toastify";
import "../../assets/styles/main.scss";
import { SkeletonFood } from "../../components/Skeleton/SkeletonFood";
import FavoriteDishItem from "./FavoriteDishItem";

const FavoriteDishesPage = () => {
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
      // toast.success("Đã xóa khỏi yêu thích!");
    } catch (err) {
      toast.error("Xóa khỏi yêu thích thất bại.");
    }
  };

  return (
    <div className="wrap-page" style={{ position: "relative", overflow: "hidden" }}>
      {/* Blob background elements */}
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />
      <div className="bg-blob bg-blob-4" />
      <div className="bg-blob bg-blob-5" />
      <div className="bg-blob bg-blob-6" />
      <div className="cart-wrap m-10 max-w-5xl mx-auto p-8 sm:m-10 sm:text-base glass-box">
        <h1 className="text-base sm:text-lg font-bold mb-4 text-green-700 flex items-center justify-center gap-2">
          Món Yêu Thích ({favorites.length})
        </h1>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-3xl">
              {Array.from({ length: 1 }).map((_, idx) => (
                <SkeletonFood key={idx} />
              ))}
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FaHeartBroken className="text-5xl text-gray-400 mb-4" />
            <p className="text-md sm:text-base text-gray-600 mb-2">
              Bạn chưa có món nào trong danh sách yêu thích.
            </p>
            <Link
              to="/mon-an"
              className="text-md sm:text-base mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Khám phá thực đơn
            </Link>
          </div>
        ) : (
          <ul className="space-y-0">
            {(favorites || []).map((item, index) => (
              <FavoriteDishItem
                key={`${item.foodId}-${item.variantId}`}
                item={item}
                onRemove={handleRemoveFavorite}
                navigate={navigate}
                index={index}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FavoriteDishesPage;
