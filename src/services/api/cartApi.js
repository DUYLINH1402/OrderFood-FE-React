const BASE_URL = import.meta.env.VITE_API_BASE_URL;
import axios from "axios";

export const syncCartFromSQL = async (cartItems, token) => {
  return axios.post(`${BASE_URL}/api/cart/sync`, cartItems, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getUserCartFromSQL = async (token) => {
  const res = await axios.get(`${BASE_URL}/api/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const addToCartFromSQL = async (cartItem, token) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  return await axios.post(`${BASE_URL}/api/cart/add`, cartItem, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateCartFromSQL = async (foodId, variantId, quantity, token) => {
  return axios.post(
    `${BASE_URL}/api/cart/update`,
    { foodId, variantId, quantity },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const removeFromCartSQL = async (foodId, variantId, token) => {
  return axios.delete(`${BASE_URL}/api/cart/remove`, {
    params: { foodId, variantId },
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const clearCartFromSQL = async (token) => {
  return axios.delete(`${BASE_URL}/api/cart/clear`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
