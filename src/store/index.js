// import { configureStore } from "@reduxjs/toolkit";
// import cartReducer from "./slices/cartSlice";

// export const store = configureStore({
//   reducer: {
//     cart: cartReducer,
//   },
// });

import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // mặc định: localStorage

const persistConfig = {
  key: "cart",
  storage,
};

const persistedCartReducer = persistReducer(persistConfig, cartReducer);

export const store = configureStore({
  reducer: {
    cart: persistedCartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // tránh warning với redux-persist
    }),
});

export const persistor = persistStore(store);
