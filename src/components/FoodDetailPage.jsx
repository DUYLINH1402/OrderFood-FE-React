import React, { useState, useEffect, useRef } from "react";
import "./styles/FoodDetailPage.scss";
import { useParams } from "react-router-dom";
import { getFoodBySlug } from "../services/service/foodService";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addQuantity } from "../store/slices/cartSlice";

export default function FoodDetailPage() {
  const { slug } = useParams();
  const [food, setFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const dispatch = useDispatch();
  const imageRef = useRef();
  const tingSound = new Audio(
    "https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.wav"
  );
  tingSound.volume = 1;

  useEffect(() => {
    const fetchFood = async () => {
      const data = await getFoodBySlug(slug);
      setFood(data);
      setMainImage(data.imageUrl || data.images?.[0] || "");
      setSelectedPrice(data.price);
    };
    fetchFood();
  }, [slug]);

  const handleAddToCart = () => {
    dispatch(addQuantity(quantity)); // đúng duy nhất ở đây
    flyToCart();
  };

  // Tạo hiệu ứng bay đến giỏ hàng
  const flyToCart = () => {
    const cartIcon = document.querySelector(".header__cart");
    const image = imageRef.current;

    if (!cartIcon || !image) return;

    const imgRect = image.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    const clone = image.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.zIndex = "9999";
    clone.style.left = imgRect.left + "px";
    clone.style.top = imgRect.top + "px";
    clone.style.width = imgRect.width + "px";
    clone.style.height = imgRect.height + "px";
    clone.style.transition = "all 0.8s ease-in-out";
    clone.style.borderRadius = "12px";

    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.left = cartRect.left + "px";
      clone.style.top = cartRect.top + "px";
      clone.style.width = "20px";
      clone.style.height = "20px";
      clone.style.opacity = "0.5";
    });

    clone.addEventListener("transitionend", () => {
      clone.remove();
      cartIcon.classList.add("cart-bounce");
      setTimeout(() => cartIcon.classList.remove("cart-bounce"), 500);
    });
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  if (!food) return <div className="text-center mt-10">Đang tải món ăn...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-[150px] pb-16 text-[14px] md:text-[16px] grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Vùng ảnh bên trái */}
      <div className="flex flex-col items-center">
        {/* Nút quay lại */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-2 left-2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 transition"
          title="Quay lại">
          <i className="fa-solid fa-arrow-left text-gray-600"></i>
        </button>
        {/* Ảnh chính */}
        <img
          ref={imageRef}
          src={mainImage}
          alt={food.name}
          className="w-full max-w-md rounded-2xl shadow-lg object-cover"
        />

        {/* Ảnh phụ nếu có */}
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

      {/* Vùng thông tin bên phải */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-800">{food.name}</h1>
          <div className="flex space-x-3">
            {/* Nút yêu thích */}
            <button className="text-red-500 text-xl hover:scale-110 transition">
              <i className="fa-regular fa-heart"></i>
            </button>
            {/* Nút chia sẻ */}
            <button className="text-blue-600 text-xl hover:scale-110 transition">
              <i className="fa-solid fa-share-nodes"></i>
            </button>
          </div>
        </div>

        <p className="text-green-600 text-2xl font-semibold mb-3">
          {selectedPrice.toLocaleString()}₫
        </p>
        <p className="text-gray-700 mb-5 leading-relaxed">{food.description}</p>

        {/* Thành phần */}
        {food.ingredients?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Thành phần:</h2>
            <ul className="list-disc list-inside text-gray-600">
              {food.ingredients.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Biến thể nếu có */}
        {food.variants?.length > 0 && (
          <div className="mb-5">
            <h2 className="font-semibold mb-2">Các biến thể khác:</h2>
            <div className="flex flex-wrap gap-3">
              {food.variants.map((v, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedVariantId(v.id);
                    setSelectedPrice(food.price + (v.extraPrice || 0));
                  }}
                  className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition text-sm">
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Điều khiển số lượng */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => handleQuantityChange(-1)}
            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded">
            -
          </button>
          <span className="text-lg font-medium">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(1)}
            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded">
            +
          </button>
        </div>

        {/* Nút hành động */}
        <div className="flex gap-4">
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-semibold"
            onClick={handleAddToCart}>
            Thêm vào giỏ hàng
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold">
            Đặt ngay
          </button>
        </div>
      </div>
    </div>
  );
}
