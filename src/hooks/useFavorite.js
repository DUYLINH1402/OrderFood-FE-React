// src/hooks/useFavorite.js
// Custom hook mẫu cho danh sách yêu thích với Redux store
import { useSelector, useDispatch } from "react-redux";
import { addFavorite, removeFavorite } from "../store/slices/favoriteSlice";

export function useFavorite() {
  const favorites = useSelector((state) => state.favorite.items);
  const dispatch = useDispatch();

  const add = (item) => dispatch(addFavorite(item));
  const remove = (id) => dispatch(removeFavorite(id));

  return {
    favorites,
    addFavorite: add,
    removeFavorite: remove,
  };
}
