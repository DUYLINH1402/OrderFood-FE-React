const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";

import {
  syncCartFromSQL,
  getUserCartFromSQL,
  updateCartFromSQL,
  removeFromCartSQL,
  clearCartFromSQL,
  addToCartFromSQL,
} from "../api/cartApi";

// ĐỒNG BỘ GIỎ HÀNG SAU KHI LOGIN
export const syncCart = async (cartItems, token) => {
  return useFirebase
    ? await syncCartFromFirebase(cartItems, token)
    : await syncCartFromSQL(cartItems, token);
};

// LẤY GIỎ HÀNG TỪ BE SAU KHI LOGIN
export const getUserCart = async (token) => {
  return useFirebase ? await getUserCartFromFirebase(token) : await getUserCartFromSQL(token);
};

// ĐỒNG BỘ GIỎ HÀNG SAU KHI LOGIN
export const addToCartApi = async (cartItems, token) => {
  return useFirebase
    ? await addToCartFromFirebase(cartItems, token)
    : await addToCartFromSQL(cartItems, token);
};

// CẬP NHẬT SỐ LƯỢNG
export const updateCartApi = async (foodId, variantId, quantity, token) => {
  return useFirebase
    ? await updateCartFromFirebase(foodId, variantId, quantity, token)
    : await updateCartFromSQL(foodId, variantId, quantity, token);
};

// XOÁ 1 MÓN
export const removeCartItemApi = async (foodId, variantId, token) => {
  return useFirebase
    ? await removeFromCartFirebase(foodId, variantId, token)
    : await removeFromCartSQL(foodId, variantId, token);
};

// XOÁ TOÀN BỘ
export const clearCartApi = async (token) => {
  return useFirebase ? await clearCartFromFirebase(token) : await clearCartFromSQL(token);
};
