import React from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ToastContainer position="top-center" autoClose={2000} />
        <AppRoutes />
      </PersistGate>
    </Provider>
  );
}

export default App;
