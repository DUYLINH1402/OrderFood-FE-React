import { createSlice } from "@reduxjs/toolkit";

const favoriteSlice = createSlice({
  name: "favorite",
  initialState: {
    list: [],
  },
  reducers: {
    setFavorites: (state, action) => {
      state.list = action.payload;
    },
    addFavorite: (state, action) => {
      state.list.push(action.payload);
    },
    removeFavorite: (state, action) => {
      state.list = state.list.filter(
        (item) =>
          !(item.foodId === action.payload.foodId && item.variantId === action.payload.variantId)
      );
    },
  },
});

export const { setFavorites, addFavorite, removeFavorite } = favoriteSlice.actions;
export default favoriteSlice.reducer;
