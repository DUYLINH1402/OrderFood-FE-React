import { useSelector, useDispatch } from "react-redux";
import React from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/pages/CartPage.scss";
import "../assets/styles/main.scss";
import { removeFromCart, updateQuantity, clearCart } from "../store/slices/cartSlice";
import { getToken } from "../services/auth/authApi";
import { clearCartApi, removeCartItemApi, updateCartApi } from "../services/service/cartService";
import { toast } from "react-toastify";
import { LazyLoadImage } from "react-lazy-load-image-component";
import LazyImage from "../components/LazyImage";

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((state) => state.cart.items);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const token = getToken();
  const isLoggedIn = !!token;

  const handleUpdateQuantity = async (foodId, variantId, quantity) => {
    const item = items.find((i) => i.foodId === foodId && i.variantId === variantId);
    const oldQuantity = item?.quantity ?? 1;

    dispatch(updateQuantity({ foodId, variantId, quantity }));

    if (!isLoggedIn) {
      // Không gọi API nếu chưa đăng nhập
      return;
    }

    try {
      await updateCartApi(foodId, variantId, quantity, token);
    } catch (err) {
      console.error("Lỗi cập nhật số lượng:", err);
      toast.error("Cập nhật số lượng thất bại.");
      dispatch(updateQuantity({ foodId, variantId, quantity: oldQuantity }));
    }
  };

  const handleRemoveItem = async (foodId, variantId) => {
    const removedItem = items.find((i) => i.foodId === foodId && i.variantId === variantId);
    dispatch(removeFromCart({ foodId, variantId }));

    if (!isLoggedIn) return;

    try {
      await removeCartItemApi(foodId, variantId, token);
    } catch (err) {
      console.error("Lỗi xóa món:", err);
      toast.error("Xóa món thất bại.");
      dispatch(updateQuantity({ foodId, variantId, quantity: removedItem.quantity }));
    }
  };

  const handleClearCart = async () => {
    const backupItems = [...items];
    dispatch(clearCart());

    if (!isLoggedIn) return;

    try {
      await clearCartApi(token);
    } catch (err) {
      console.error("Lỗi xóa toàn bộ:", err);
      toast.error("Xóa toàn bộ giỏ hàng thất bại.");
      backupItems.forEach((item) => {
        dispatch(updateQuantity(item));
      });
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
      <div className="m-10 max-w-5xl mx-auto p-50 sm:m-10 sm:text-base glass-box">
        <h1 className="text-base sm:text-lg font-bold mb-4 text-gray-800">
          Giỏ hàng của bạn ({items.length} món)
        </h1>
        {items.length === 0 ? (
          <p className="text-gray-600">Chưa có món nào trong giỏ.</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li
                  key={`${item.foodId}-${item.variantId}`}
                  className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 py-4">
                  <div
                    className="flex sm:items-center w-full cursor-pointer hover:bg-gray-100 transition duration-200 rounded-lg p-2"
                    onClick={() => navigate(`/mon-an/chi-tiet/${item.slug}`)}>
                    <LazyImage
                      src={item.imageUrl}
                      alt={item.foodName}
                      className="w-40 h-40 sm:w-40 sm:h-40 object-cover rounded-md border flex-shrink-0"
                    />
                    <div className="cart-food-infor ml-3 sm:ml-4 mt-2 sm:mt-0 leading-snug text-sm sm:text-base space-y-1">
                      <h2 className="font-semibold text-gray-800 text-base sm:text-lg">
                        {item.foodName}
                      </h2>
                      <p className="text-gray-500 text-sm sm:text-base">
                        Cách chế biến: {item.variant}
                      </p>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Giá: {item.price.toLocaleString()}₫ × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0 self-end sm:self-center">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.foodId, item.variantId, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                      −
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center border border-transparent text-sm sm:text-base">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.foodId, item.variantId, item.quantity + 1)
                      }
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100">
                      +
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.foodId, item.variantId)}
                      className="text-red-500 hover:underline text-sm sm:text-base">
                      Xóa
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-base text-gray-800 font-bold mb-2 sm:mb-0 text-center w-full sm:w-auto">
                Tổng cộng: <span className="font-bold">{totalPrice.toLocaleString()}₫</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center justify-center">
                <button
                  onClick={handleClearCart}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm sm:text-base w-full sm:w-auto">
                  Xóa toàn bộ
                </button>
                <button
                  onClick={() => {
                    // Truyền đầy đủ thông tin variant khi sang trang thanh toán
                    const checkoutItems = items.map((item) => ({
                      foodId: item.foodId,
                      slug: item.slug,
                      foodName: item.foodName,
                      price: item.price,
                      imageUrl: item.imageUrl,
                      variant: item.variant, // Cách chế biến
                      variantId: item.variantId,
                      quantity: item.quantity,
                    }));
                    navigate("/thanh-toan", { state: { checkoutItems } });
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm sm:text-base w-full sm:w-auto whitespace-nowrap"
                  disabled={items.length === 0}>
                  Thanh toán
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
