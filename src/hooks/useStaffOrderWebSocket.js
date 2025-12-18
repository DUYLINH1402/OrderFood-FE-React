import { useEffect, useRef, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import staffOrderWebSocketService from "../services/websocket/StaffOrderWebSocketService";
import { useAuth } from "./auth/useAuth";

/**
 * Hook để quản lý WebSocket connection cho Staff Orders
 * Tự động kết nối khi component mount và ngắt kết nối khi unmount
 */
export const useStaffOrderWebSocket = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    connecting: false,
    error: null,
  });

  // Lấy thông tin user từ Redux store
  const { user, accessToken: token } = useSelector((state) => state.auth);
  const { isAuthenticated } = useAuth();

  // Ref để lưu các handlers và tránh memory leaks
  const handlersRef = useRef(new Map());
  const connectingRef = useRef(false);

  /**
   * Kết nối WebSocket
   */
  const connect = useCallback(async () => {
    if (!isAuthenticated || !user?.id || !token) {
      console.warn("Thiếu authentication, user ID hoặc token:", {
        isAuthenticated,
        userId: user?.id,
        hasToken: !!token,
      });
      return;
    }

    if (connectingRef.current || staffOrderWebSocketService.isConnected()) {
      console.log("WebSocket đang kết nối hoặc đã kết nối");
      return;
    }

    connectingRef.current = true;
    setConnectionStatus((prev) => ({ ...prev, connecting: true, error: null }));
    try {
      await staffOrderWebSocketService.connect(user.id.toString(), token);

      // Subscribe vào các topic sau khi kết nối thành công
      staffOrderWebSocketService.subscribeToOrderUpdates();

      setConnectionStatus({
        connected: true,
        connecting: false,
        error: null,
      });
    } catch (error) {
      console.error("💥 Lỗi kết nối WebSocket:", error);
      setConnectionStatus({
        connected: false,
        connecting: false,
        error: error.message,
      });

      toast.error(`❌ Lỗi kết nối WebSocket: ${error.message}`, {
        position: "top-right",
        autoClose: 8000,
      });
    } finally {
      connectingRef.current = false;
    }
  }, [user?.id, token]);

  /**
   * Ngắt kết nối WebSocket
   */
  const disconnect = useCallback(() => {
    staffOrderWebSocketService.disconnect();
    setConnectionStatus({
      connected: false,
      connecting: false,
      error: null,
    });

    // Clear tất cả handlers
    handlersRef.current.clear();

    console.log(" Đã ngắt kết nối WebSocket");
  }, []);

  /**
   * Thêm handler cho message type
   */
  const addMessageHandler = useCallback((messageType, handler) => {
    const unsubscribe = staffOrderWebSocketService.addMessageHandler(messageType, handler);

    // Lưu unsubscribe function để cleanup sau
    if (!handlersRef.current.has(messageType)) {
      handlersRef.current.set(messageType, new Set());
    }
    handlersRef.current.get(messageType).add(unsubscribe);

    return unsubscribe;
  }, []);

  /**
   * Xóa handler cho message type
   */
  const removeHandlers = useCallback((messageType) => {
    const unsubscribers = handlersRef.current.get(messageType);
    if (unsubscribers) {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      handlersRef.current.delete(messageType);
    }
  }, []);

  /**
   * Xác nhận đã nhận được đơn hàng
   */
  // const acknowledgeOrder = useCallback((orderId) => {
  //   return staffOrderWebSocketService.acknowledgeOrder(orderId);
  // }, []);

  /**
   * Yêu cầu chi tiết đơn hàng
   */
  const requestOrderDetails = useCallback((orderId) => {
    return staffOrderWebSocketService.requestOrderDetails(orderId);
  }, []);

  /**
   * Cập nhật trạng thái đơn hàng
   */
  const updateOrderStatus = useCallback((orderId, orderCode, newStatus, previousStatus) => {
    return staffOrderWebSocketService.updateOrderStatus(
      orderId,
      orderCode,
      newStatus,
      previousStatus
    );
  }, []);

  // Theo dõi authentication state
  useEffect(() => {
    if (!isAuthenticated) {
      // Cleanup khi user logout

      // Clear tất cả handlers
      handlersRef.current.forEach((unsubscribers) => {
        unsubscribers.forEach((unsubscribe) => unsubscribe?.());
      });
      handlersRef.current.clear();

      // Ngắt kết nối
      disconnect();

      // Reset connection status
      setConnectionStatus({
        connected: false,
        connecting: false,
        error: null,
      });
    }
  }, [isAuthenticated, disconnect]);

  // Lắng nghe auth-logout event
  useEffect(() => {
    const handleAuthLogout = () => {
      disconnect();
    };

    window.addEventListener("auth-logout", handleAuthLogout);
    return () => window.removeEventListener("auth-logout", handleAuthLogout);
  }, [disconnect]);

  // Tự động kết nối khi component mount và user authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id && token) {
      connect();
    }

    // Cleanup khi component unmount
    return () => {
      // Clear tất cả handlers
      handlersRef.current.forEach((unsubscribers) => {
        unsubscribers.forEach((unsubscribe) => unsubscribe?.());
      });
      handlersRef.current.clear();

      // Ngắt kết nối
      disconnect();
    };
  }, [isAuthenticated, user?.id, token, connect, disconnect]);

  // Tự động reconnect khi user hoặc token thay đổi (chỉ khi đã authenticated)
  useEffect(() => {
    if (
      isAuthenticated &&
      user?.id &&
      token &&
      !staffOrderWebSocketService.isConnected() &&
      !connectingRef.current
    ) {
      connect();
    }
  }, [isAuthenticated, user?.id, token, connect]);

  return {
    // Trạng thái kết nối
    ...connectionStatus,

    // Các hàm tiện ích
    connect,
    disconnect,
    addMessageHandler,
    removeHandlers,
    // Các hàm gửi message
    requestOrderDetails,
    updateOrderStatus,
  };
};
