import { createSlice } from "@reduxjs/toolkit";

const initialCart = JSON.parse(localStorage.getItem("cartItems")) || [];

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: initialCart },
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      // tìm xem đã có món cùng foodId + variant chưa
      const exist = state.items.find(
        (i) => i.foodId === newItem.foodId && i.variant === newItem.variant
      );
      if (exist) {
        exist.quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
      }
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { foodId, variant, quantity } = action.payload;
      const item = state.items.find((i) => i.foodId === foodId && i.variant === variant);
      if (item) item.quantity = quantity;
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      const { foodId, variant } = action.payload;
      state.items = state.items.filter((i) => !(i.foodId === foodId && i.variant === variant));
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem("cartItems");
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
