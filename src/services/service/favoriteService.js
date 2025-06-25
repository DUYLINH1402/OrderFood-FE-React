const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";

import {} from "../api/categoriesApi.js";

import { getFavoritesApi, addToFavoritesApi, removeFromFavoritesApi } from "../api/favoriteApi";

// [GET]
export const getFavorites = async (token) => {
  return useFirebase ? [] : await getFavoritesApi(token);
};

// [POST]
export const addToFavorites = async (foodId, variantId, token) => {
  return useFirebase ? null : await addToFavoritesApi(foodId, variantId, token);
};

// [DELETE]
export const removeFromFavorites = async (foodId, variantId, token) => {
  return useFirebase ? null : await removeFromFavoritesApi(foodId, variantId, token);
};
