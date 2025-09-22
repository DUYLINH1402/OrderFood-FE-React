// Context quản lý WebSocket cho user
import React, { createContext, useContext, useMemo } from "react";
import { useUserWebSocket } from "./useUserWebSocket";
import { useSelector } from "react-redux";

const UserWebSocketContext = createContext();

export const useUserWebSocketContext = () => useContext(UserWebSocketContext);

export const UserWebSocketProvider = ({ children }) => {
  // Lấy thông tin đăng nhập từ Redux
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userId = useSelector((state) => state.auth.user?.id);
  const accessToken = useSelector((state) => state.auth.accessToken);

  // Khởi tạo WebSocket chỉ 1 lần cho toàn bộ app
  const ws = useUserWebSocket();

  React.useEffect(() => {
    if (isLoggedIn && userId && accessToken) {
      ws.initialize(userId, accessToken);
    } else {
      ws.disconnect();
    }
  }, [isLoggedIn, userId, accessToken, ws.initialize, ws.disconnect]);

  const value = useMemo(() => ({ ...ws }), [ws]);

  return <UserWebSocketContext.Provider value={value}>{children}</UserWebSocketContext.Provider>;
};
