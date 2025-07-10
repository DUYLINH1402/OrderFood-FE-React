import apiClient from "../apiClient";

export const getToken = () => {
  const token = localStorage.getItem("accessToken");
  return token || null;
};

// API to get favorites
export const getFavoritesApi = () => {
  return apiClient.get("/api/favorites");
};

export const addToFavoritesApi = (foodId, variantId) => {
  return apiClient.post("/api/favorites", {
    foodId,
    variantId: variantId ?? null,
  });
};

export const removeFromFavoritesApi = (foodId, variantId) => {
  return apiClient.delete("/api/favorites", {
    data: {
      foodId,
      variantId: variantId ?? null,
    },
  });
};
