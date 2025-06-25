// src/hooks/useCart.js
// Custom hook mẫu cho giỏ hàng với Redux store
import { useSelector, useDispatch } from "react-redux";
import { addToCart, removeFromCart, clearCart } from "../store/slices/cartSlice";

export function useCart() {
  const cartItems = useSelector((state) => state.cart.items);
  const total = useSelector((state) => state.cart.total);
  const dispatch = useDispatch();

  const add = (item) => dispatch(addToCart(item));
  const remove = (id) => dispatch(removeFromCart(id));
  const clear = () => dispatch(clearCart());

  return {
    cartItems,
    total,
    addToCart: add,
    removeFromCart: remove,
    clearCart: clear,
  };
}
