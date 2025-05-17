import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  count: Number(localStorage.getItem("cartCount")) || 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addQuantity: (state, action) => {
      state.count += action.payload;
      localStorage.setItem("cartCount", state.count);
    },
    increment: (state) => {
      state.count += 1;
      localStorage.setItem("cartCount", state.count);
    },
    setCartCount: (state, action) => {
      state.count = action.payload;
      localStorage.setItem("cartCount", action.payload);
    },
  },
});

export const { addQuantity, setCartCount } = cartSlice.actions;
export default cartSlice.reducer;
