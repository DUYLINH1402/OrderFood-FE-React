const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";

import {} from "../api/categoriesApi.js";

import { getFavoritesApi, addToFavoritesApi, removeFromFavoritesApi } from "../api/favoriteApi";

// [GET]
export const getFavorites = async () => {
  return useFirebase ? [] : await getFavoritesApi();
};

// [POST]
export const addToFavorites = async (foodId, variantId) => {
  return useFirebase ? null : await addToFavoritesApi(foodId, variantId);
};

// [DELETE]
export const removeFromFavorites = async (foodId, variantId) => {
  return useFirebase ? null : await removeFromFavoritesApi(foodId, variantId);
};
