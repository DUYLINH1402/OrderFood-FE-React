import { useSelector, useDispatch } from "react-redux";
import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/CartPage.scss";
import { removeFromCart, updateQuantity, clearCart } from "../store/slices/cartSlice";

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((state) => state.cart.items);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="cart-wrap m-10 max-w-5xl mx-auto p-50 sm:m-10 sm:text-base border border-gray-300 rounded-lg shadow-lg bg-white">
      <h1 className="text-sm sm:text-xl font-bold mb-4 text-gray-800">
        Giỏ hàng của bạn ({items.length} món)
      </h1>

      {items.length === 0 ? (
        <p className="text-gray-600">Chưa có món nào trong giỏ.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li
                key={`${item.foodId}-${item.variant}`}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 py-4">
                <div
                  className="flex sm:items-center w-full cursor-pointer hover:bg-gray-100 transition duration-200 rounded-lg p-2"
                  onClick={() => navigate(`/foods/slug/${item.slug}`)}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md border flex-shrink-0"
                  />
                  <div className="cart-food-infor ml-3 sm:ml-4 mt-2 sm:mt-0 leading-snug text-sm sm:text-base space-y-1">
                    <h2 className="font-semibold text-gray-800">{item.name}</h2>
                    <p className="text-gray-500">Cách chế biến: {item.variant}</p>
                    <p className="text-gray-600">
                      Giá: {item.price.toLocaleString()}₫ × {item.quantity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2  sm:mt-0 self-end sm:self-center ">
                  <button
                    onClick={() =>
                      dispatch(
                        updateQuantity({
                          foodId: item.foodId,
                          variant: item.variant,
                          quantity: item.quantity - 1,
                        })
                      )
                    }
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                    −
                  </button>
                  <span className="w-6 text-center text-sm sm:text-base">{item.quantity}</span>
                  <button
                    onClick={() =>
                      dispatch(
                        updateQuantity({
                          foodId: item.foodId,
                          variant: item.variant,
                          quantity: item.quantity + 1,
                        })
                      )
                    }
                    className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-100">
                    +
                  </button>
                  <button
                    onClick={() =>
                      dispatch(
                        removeFromCart({
                          foodId: item.foodId,
                          variant: item.variant,
                        })
                      )
                    }
                    className="text-red-500 hover:underline text-sm sm:text-base">
                    Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={() => dispatch(clearCart())}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">
              Xóa toàn bộ
            </button>
            <p className="text-sm sm:text-base text-gray-800">
              Tổng cộng: <span className="font-bold">{totalPrice.toLocaleString()}₫</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
