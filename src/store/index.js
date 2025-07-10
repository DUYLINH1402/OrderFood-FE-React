import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";
import favoriteReducer from "./slices/favoriteSlice";
import pointsReducer from "./slices/pointsSlice";

import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // mặc định: localStorage
import { combineReducers } from "redux";

// Gộp nhiều reducer lại
const rootReducer = combineReducers({
  cart: cartReducer,
  auth: authReducer,
  favorite: favoriteReducer,
  points: pointsReducer,
});

// Cấu hình persist (chỉ persist cart, auth hoặc toàn bộ tuỳ chọn)
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "auth", "favorite", "points"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
