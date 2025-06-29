import React, { useState, useEffect, useRef } from "react";
import "../../../assets/styles/pages/FoodDetailPage.scss";
import { useParams, useNavigate } from "react-router-dom";
import { getFoodBySlug } from "../../../services/service/foodService";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../store/slices/cartSlice";
import { flyToCart } from "../../../utils/action";
import LoadingPage from "../../../components/Skeleton/LoadingPage";
import { getToken } from "../../../services/auth/authApi";
import { addToCartApi } from "../../../services/service/cartService";
import { addToFavorites, removeFromFavorites } from "../../../services/service/favoriteService";
import { addFavorite, removeFavorite } from "../../../store/slices/favoriteSlice";
import RelatedFoods from "./RelatedFoods";

export default function FoodDetailPage() {
  const { slug } = useParams();
  const [food, setFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const imageRef = useRef();
  const token = getToken();

  const favoriteList = useSelector((state) => state.favorite.list);
  const isFavorite = favoriteList?.some(
    (item) => item.foodId === food?.id && item.variantId === selectedVariantId
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchFood = async () => {
      const data = await getFoodBySlug(slug);
      setFood(data);
      setMainImage(data.imageUrl || data.images?.[0] || "");
      setSelectedPrice(data.price);
    };
    fetchFood();
  }, [slug]);

  const handleAddToCart = async () => {
    window.forceShowHeader?.();

    setTimeout(() => {
      flyToCart(imageRef);
    }, 300);

    const variantObj = food.variants?.find((v) => v.id === selectedVariantId);
    const variantName = variantObj?.name || "Mặc định";

    const cartItem = {
      foodId: food.id,
      slug: food.slug,
      foodName: food.name,
      price: selectedPrice,
      imageUrl: mainImage,
      variant: variantName,
      variantId: selectedVariantId,
      quantity: quantity,
    };

    dispatch(addToCart(cartItem));
    try {
      await addToCartApi(cartItem, token);
    } catch (err) {
      console.error("Lỗi thêm vào giỏ hàng:", err);
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const toggleFavorite = async () => {
    try {
      if (!token) return;

      if (isFavorite) {
        await removeFromFavorites(food.id, selectedVariantId, token);
        dispatch(removeFavorite({ foodId: food.id, variantId: selectedVariantId }));
      } else {
        await addToFavorites(food.id, selectedVariantId, token);
        dispatch(addFavorite({ foodId: food.id, variantId: selectedVariantId }));
      }
    } catch (err) {
      toast.error("Không thể cập nhật yêu thích");
      console.error("Lỗi:", err);
    }
  };

  const handleOrderNow = () => {
    const variantObj = food.variants?.find((v) => v.id === selectedVariantId);
    const variantName = variantObj?.name || "Mặc định";
    const cartItem = {
      foodId: food.id,
      slug: food.slug,
      foodName: food.name,
      price: selectedPrice,
      imageUrl: mainImage,
      variant: variantName,
      variantId: selectedVariantId,
      quantity: quantity,
    };
    navigate("/thanh-toan", { state: { checkoutItems: [cartItem] } });
  };

  if (!food) return <LoadingPage />;

  return (
    <div className="wrap-page" style={{ position: "relative", overflow: "hidden" }}>
      {/* Blob background elements */}
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />
      <div className="bg-blob bg-blob-4" />
      <div className="bg-blob bg-blob-5" />
      <div className="bg-blob bg-blob-6" />
      <div className="food-detail-wrap max-w-6xl mx-auto mt-[160px] pb-16 text-[14px] md:text-[16px] grid grid-cols-1 md:grid-cols-2 gap-10 cart-wrap glass-box">
        <div className="flex relative flex-col items-center">
          {/* <button
            onClick={() => navigate(-1)}
            className="  top-[-70px] left-[0] bg-green-100 text-center w-48 rounded-2xl h-14 relative text-black text-base group border border-[#199b7e]"
            type="button">
            <div className="bg-[#199b7e] rounded-xl h-11 w-1/4 flex items-center justify-center absolute left-1 top-[3px] group-hover:w-[113px] z-10 duration-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1024 1024"
                height="20px"
                width="20px">
                <path d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z" fill="#000000"></path>
                <path
                  d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                  fill="#000000"></path>
              </svg>
            </div>
            <p className="translate-x-2">Quay lại</p>
          </button> */}

          <img
            ref={imageRef}
            src={mainImage}
            alt={food.name}
            className="w-full rounded-2xl shadow-lg object-cover"
          />

          {food.images?.length > 1 && (
            <div className="flex gap-3 mt-4 flex-wrap justify-center">
              {food.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Phụ ${idx}`}
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-20 object-cover rounded-lg shadow-sm cursor-pointer hover:scale-105 transition ${
                    img === mainImage ? "ring-2 ring-green-500" : ""
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-start mb-4">
            <h1 className="sm:text-3xl font-bold text-gray-800">{food.name}</h1>
            <div className="flex space-x-3">
              {token && !(food.variants?.length > 0 && selectedVariantId == null) && (
                <button
                  onClick={toggleFavorite}
                  className="text-xl hover:scale-110 transition"
                  title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}>
                  <i
                    className={
                      isFavorite
                        ? "fa-solid fa-heart text-red-500 p-3 bg-white rounded-full shadow border-2 border-red-500"
                        : "fa-regular fa-heart text-red-500 p-3 bg-white rounded-full shadow border-2 border-red-500 "
                    }></i>
                </button>
              )}
              <button className="text-blue-600 text-xl hover:scale-110 transition" title="Chia sẻ">
                <i className="fa-solid fa-share-nodes p-3 bg-white rounded-full shadow border-2 border-[#2663eb]"></i>
              </button>
            </div>
          </div>

          <p className="text-[#199b7e] sm:text-[25px] text-[20px] font-semibold mb-3">
            {selectedPrice.toLocaleString()}₫
          </p>
          <p className="text-gray-700 mb-5 leading-relaxed">{food.description}</p>

          {food.variants?.length > 0 && (
            <div className="mb-5">
              <h2 className="font-semibold  mb-2">Các biến thể khác:</h2>
              <div className="flex flex-wrap gap-3 ">
                {food.variants.map((v, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedVariantId(v.id);
                      setSelectedPrice(food.price + (v.extraPrice || 0));
                    }}
                    className={`px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition text-sm sm:text-base ${
                      selectedVariantId === v.id
                        ? "bg-green-100 border-green-500 ring-2 ring-green-400"
                        : ""
                    }`}>
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded">
              -
            </button>
            <span className="sm:text-lg">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded">
              +
            </button>
          </div>

          <div className="flex gap-4">
            <button
              className="bg-[#199b7e] hover:bg-green-500 text-white px-6 py-2 rounded-full font-semibold"
              onClick={handleAddToCart}>
              Thêm vào giỏ hàng
            </button>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold"
              onClick={handleOrderNow}>
              Đặt ngay
            </button>
          </div>
        </div>
      </div>

      <RelatedFoods
        categoryId={food.categoryId}
        excludeId={food.id}
        categoryName={food.categoryName}
      />
    </div>
  );
}
