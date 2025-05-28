import React from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import AuthLoader from "./routes/AuthLoader";

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ToastContainer
          position="top-center" // Vị trí hiển thị (có thể đổi thành 'bottom-right', 'top-center', ...)
          autoClose={2000} // Thời gian tự động đóng (2 giây)
          hideProgressBar={false} // Hiển thị/thêm thanh progress
          newestOnTop={true} // Toast mới nhất sẽ hiển thị trên cùng
          closeOnClick // Cho phép đóng khi click vào
          rtl={false} // Không bật chế độ RTL (hữu ích khi dùng tiếng Ả Rập)
          pauseOnFocusLoss // Tạm dừng khi mất focus
          draggable // Có thể kéo thả
          pauseOnHover // Tạm dừng khi hover
          theme="colored" // Chế độ giao diện ('light', 'dark', 'colored')
        />
        <AuthLoader>
          <AppRoutes /> {/* Bọc router bên trong AuthLoader */}
        </AuthLoader>
      </PersistGate>
    </Provider>
  );
}

export default App;
