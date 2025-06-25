import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getToken = () => {
  const token = localStorage.getItem("accessToken");
  return token || null;
};

// API to get favorites
export const getFavoritesApi = (token) => {
  return axios.get(`${BASE_URL}/api/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
export const addToFavoritesApi = (foodId, variantId, token) => {
  return axios.post(
    `${BASE_URL}/api/favorites`,
    {
      foodId,
      variantId: variantId ?? null,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", //  Bắt buộc để tránh lỗi 400
      },
    }
  );
};

export const removeFromFavoritesApi = (foodId, variantId, token) => {
  return axios.delete(`${BASE_URL}/api/favorites`, {
    data: {
      foodId,
      variantId: variantId ?? null,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json", //  Cực kỳ quan trọng
    },
  });
};
