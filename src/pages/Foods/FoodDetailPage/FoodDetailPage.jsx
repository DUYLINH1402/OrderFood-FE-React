import React, { useState, useEffect, useRef } from "react";
import "../../../assets/styles/pages/FoodDetailPage.scss";
import { useParams, useNavigate } from "react-router-dom";
import { getFoodBySlug } from "../../../services/service/foodService";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../store/slices/cartSlice";
import { flyToCart } from "../../../utils/action";
import SpinnerCube from "../../../components/Skeleton/SpinnerCube";
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
  const [imageLoading, setImageLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const imageRef = useRef();
  const token = getToken();

  const favoriteList = useSelector((state) => state.favorite.list);
  const isFavorite =
    Array.isArray(favoriteList) &&
    favoriteList.some((item) => item.foodId === food?.id && item.variantId === selectedVariantId);

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
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error("Lỗi thêm vào giỏ hàng:", err);
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const toggleFavorite = async () => {
    try {
      if (!token) {
        toast.info("Vui lòng đăng nhập để sử dụng tính năng này");
        return;
      }

      if (isFavorite) {
        await removeFromFavorites(food.id, selectedVariantId, token);
        dispatch(removeFavorite({ foodId: food.id, variantId: selectedVariantId }));
        toast.success("Đã bỏ khỏi danh sách yêu thích");
      } else {
        await addToFavorites(food.id, selectedVariantId, token);
        dispatch(addFavorite({ foodId: food.id, variantId: selectedVariantId }));
        toast.success("Đã thêm vào danh sách yêu thích");
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

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  if (!food)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <SpinnerCube />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 mt-20">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => navigate("/")}
              className="hover:text-green-600 transition-colors duration-200">
              Trang chủ
            </button>
            <i className="fas fa-chevron-right text-xs"></i>
            <button
              onClick={() => navigate("/menu")}
              className="hover:text-green-600 transition-colors duration-200">
              Thực đơn
            </button>
            <i className="fas fa-chevron-right text-xs"></i>
            <span className="text-gray-900 font-medium">{food.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8">
              <div className="sticky top-8">
                <div className="relative overflow-hidden rounded-xl bg-white shadow-lg">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  )}
                  <img
                    ref={imageRef}
                    src={mainImage}
                    alt={food.name}
                    onLoad={handleImageLoad}
                    className="w-full h-96 object-cover transition-transform duration-500 hover:scale-105"
                    style={{ display: imageLoading ? "none" : "block" }}
                  />

                  {/* Image overlay with actions */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    {token && !(food.variants?.length > 0 && selectedVariantId == null) && (
                      <button
                        onClick={toggleFavorite}
                        className="group bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-110"
                        title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}>
                        <i
                          className={`${
                            isFavorite
                              ? "fas fa-heart text-base text-red-500"
                              : "far fa-heart text-base text-gray-600 group-hover:text-red-500"
                          } transition-colors duration-300`}></i>
                      </button>
                    )}
                    <button
                      className="group text-base bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-110"
                      title="Chia sẻ">
                      <i className="fas fa-share-nodes text-gray-600 group-hover:text-blue-500 transition-colors duration-300"></i>
                    </button>
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {food.images?.length > 1 && (
                  <div className="mt-6">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {food.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setMainImage(img);
                            setImageLoading(true);
                          }}
                          className={`flex-shrink-0 relative overflow-hidden rounded-lg transition-all duration-300 ${
                            img === mainImage
                              ? "ring-3 ring-green-500 ring-offset-2 shadow-lg transform scale-105"
                              : "hover:shadow-md hover:scale-102 opacity-70 hover:opacity-100"
                          }`}>
                          <img
                            src={img}
                            alt={`${food.name} ${idx + 1}`}
                            className="w-16 h-16 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Information */}
            <div className="p-8 lg:p-12">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="mb-6">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                    {food.name}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-green-600">
                        {selectedPrice.toLocaleString()}₫
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="fas fa-star text-sm"></i>
                      ))}
                      {/* <span className="text-gray-600 text-sm ml-2">(4.9)</span> */}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <p className="text-gray-700 leading-relaxed text-base">{food.description}</p>
                </div>

                {/* Variants */}
                {food.variants?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-18 font-semibold text-gray-900 mb-4">Chọn phiên bản:</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {food.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => {
                            setSelectedVariantId(variant.id);
                            setSelectedPrice(food.price + (variant.extraPrice || 0));
                          }}
                          className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-sm text-left ${
                            selectedVariantId === variant.id
                              ? "border-green-500 bg-green-50 shadow-md transform scale-105"
                              : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                          }`}>
                          <div className="font-medium text-gray-900">{variant.name}</div>
                          {variant.extraPrice > 0 && (
                            <div className="text-sm text-green-600 mt-1">
                              +{variant.extraPrice.toLocaleString()}₫
                            </div>
                          )}
                          {selectedVariantId === variant.id && (
                            <div className="absolute top-2 right-2">
                              <i className="fas fa-check-circle text-green-500"></i>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mb-8">
                  <h3 className="text-18 font-semibold text-gray-900 mb-4">Số lượng:</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-3 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                        <i className="fas fa-minus text-gray-600"></i>
                      </button>
                      <span className="px-6 py-3 font-semibold text-lg min-w-[60px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="p-3 hover:bg-gray-200 transition-colors duration-200">
                        <i className="fas fa-plus text-gray-600"></i>
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      Tổng:{" "}
                      <span className="font-semibold text-green-600 text-lg">
                        {(selectedPrice * quantity).toLocaleString()}₫
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={food.variants?.length > 0 && selectedVariantId == null}
                      className="group relative overflow-hidden bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      <i className="fas fa-shopping-cart group-hover:scale-110 transition-transform duration-300"></i>
                      <span>Thêm vào giỏ</span>
                    </button>
                    <button
                      onClick={handleOrderNow}
                      disabled={food.variants?.length > 0 && selectedVariantId == null}
                      className="text-sm group relative overflow-hidden bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      <i className="fas fa-bolt group-hover:scale-110 transition-transform duration-300"></i>
                      <span>Đặt ngay</span>
                    </button>
                  </div>

                  {food.variants?.length > 0 && selectedVariantId == null && (
                    <p className="text-center text-amber-600 text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <i className="fas fa-info-circle mr-2"></i>
                      Vui lòng chọn phiên bản trước khi đặt hàng
                    </p>
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-shipping-fast text-green-600"></i>
                      <span>Giao hàng nhanh</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-shield-alt text-blue-600"></i>
                      <span>Đảm bảo chất lượng</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <RelatedFoods
            categoryId={food.categoryId}
            excludeId={food.id}
            categoryName={food.categoryName}
          />
        </div>
      </div>
    </div>
  );
}
