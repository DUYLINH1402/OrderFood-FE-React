import React from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store";
import "react-toastify/dist/ReactToastify.css";
import "./assets/styles/components/ScrollToTop.scss";
import "./assets/styles/components/SupportFloating.scss";
import AuthLoader from "./routes/AuthLoader";
import { ConfirmProvider } from "./components/ConfirmModal";
import { UserWebSocketProvider } from "./services/websocket/UserWebSocketProvider";
import AudioEnabler from "./components/AudioEnabler";
import SupportFloating from "./components/Support/SupportFloating";
import ScrollToTop from "./components/Support/ScrollToTop";

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
        <ConfirmProvider>
          <UserWebSocketProvider>
            <AudioEnabler>
              <AuthLoader>
                <AppRoutes />
                <SupportFloating />
                <ScrollToTop />
              </AuthLoader>
            </AudioEnabler>
          </UserWebSocketProvider>
        </ConfirmProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
