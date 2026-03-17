import apiClient from "../apiClient";

export const syncCartFromSQL = async (cartItems, token) => {
  return apiClient.post("/api/v1/client/cart/sync", cartItems);
};

export const getUserCartFromSQL = async (token) => {
  const res = await apiClient.get("/api/v1/client/cart");
  return res.data;
};

export const addToCartFromSQL = async (cartItem, token) => {
  return await apiClient.post("/api/v1/client/cart/add", cartItem);
};

export const updateCartFromSQL = async (foodId, variantId, quantity, token) => {
  return apiClient.post("/api/v1/client/cart/update", { foodId, variantId, quantity });
};

export const removeFromCartSQL = async (foodId, variantId, token) => {
  return apiClient.delete("/api/v1/client/cart/remove", {
    params: { foodId, variantId },
  });
};

export const clearCartFromSQL = async (token) => {
  return apiClient.delete("/api/v1/client/cart/clear");
};
