import { useEffect, useRef, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import staffChatWebSocketService from "../services/websocket/StaffChatWebSocketService";

/**
 * Hook để quản lý WebSocket connection cho Staff Chat
 * Tự động kết nối khi component mount và ngắt kết nối khi unmount
 */
export const useStaffChatWebSocket = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    connecting: false,
    error: null,
  });

  // Lấy thông tin user từ Redux store
  const { user, accessToken: token } = useSelector((state) => state.auth);
  const isAuthenticated = !!user && !!token;

  // Ref để lưu các handlers và tránh memory leaks
  const handlersRef = useRef(new Map());
  const connectingRef = useRef(false);

  /**
   * Kết nối WebSocket
   */
  const connect = useCallback(async () => {
    if (!isAuthenticated || !user?.id || !token) {
      console.warn("Thiếu authentication, user ID hoặc token cho staff chat:", {
        isAuthenticated,
        userId: user?.id,
        hasToken: !!token,
      });
      return;
    }

    if (connectingRef.current || staffChatWebSocketService.isConnected()) {
      console.log("Staff Chat WebSocket đang kết nối hoặc đã kết nối");
      return;
    }

    connectingRef.current = true;
    setConnectionStatus((prev) => ({ ...prev, connecting: true, error: null }));

    try {
      await staffChatWebSocketService.connect(user.id.toString(), token);

      setConnectionStatus({
        connected: true,
        connecting: false,
        error: null,
      });
    } catch (error) {
      console.error(" Lỗi kết nối Staff Chat WebSocket:", error);
      setConnectionStatus({
        connected: false,
        connecting: false,
        error: error.message,
      });

      toast.error("Không thể kết nối chat. Vui lòng thử lại sau.");
    } finally {
      connectingRef.current = false;
    }
  }, [isAuthenticated, user?.id, token]);

  /**
   * Ngắt kết nối WebSocket
   */
  const disconnect = useCallback(() => {
    console.log("🔌 Đang ngắt kết nối Staff Chat WebSocket...");
    staffChatWebSocketService.disconnect();
    setConnectionStatus({
      connected: false,
      connecting: false,
      error: null,
    });
  }, []);

  /**
   * Thêm message handler
   */
  const addMessageHandler = useCallback((messageType, handler) => {
    const unsubscribe = staffChatWebSocketService.addMessageHandler(messageType, handler);

    // Lưu unsubscribe function để cleanup sau này
    if (!handlersRef.current.has(messageType)) {
      handlersRef.current.set(messageType, new Set());
    }
    handlersRef.current.get(messageType).add(unsubscribe);

    return unsubscribe;
  }, []);

  /**
   * Gửi tin nhắn đến customer
   */
  const sendMessageToCustomer = useCallback((userId, message) => {
    if (!staffChatWebSocketService.isConnected()) {
      toast.error("Chưa kết nối chat. Vui lòng thử lại sau.");
      return false;
    }

    return staffChatWebSocketService.sendMessageToCustomer(userId, message);
  }, []);

  /**
   * Lấy danh sách staff online
   */
  const getOnlineStaff = useCallback(() => {
    if (!staffChatWebSocketService.isConnected()) {
      return false;
    }

    return staffChatWebSocketService.getOnlineStaff();
  }, []);

  /**
   * Lấy trạng thái service
   */
  const getServiceStatus = useCallback(() => {
    return staffChatWebSocketService.getStatus();
  }, []);

  // Tự động kết nối khi có đủ thông tin
  useEffect(() => {
    if (isAuthenticated && user?.id && token && user.roleCode === "ROLE_STAFF") {
      connect();
    } else {
      disconnect();
    }
  }, [isAuthenticated, user?.id, user?.roleCode, token, connect, disconnect]);

  // Setup connection status handler
  useEffect(() => {
    const unsubscribeConnectionStatus = staffChatWebSocketService.addMessageHandler(
      "connectionStatus",
      (status) => {
        setConnectionStatus((prev) => ({
          ...prev,
          connected: status.connected,
          error: status.error || null,
        }));
      }
    );

    return unsubscribeConnectionStatus;
  }, []);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      // Cleanup tất cả handlers
      handlersRef.current.forEach((unsubscribers) => {
        unsubscribers.forEach((unsubscribe) => {
          try {
            unsubscribe();
          } catch (error) {
            console.error(" Lỗi khi cleanup handler:", error);
          }
        });
      });
      handlersRef.current.clear();

      // Ngắt kết nối
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection status
    connected: connectionStatus.connected,
    connecting: connectionStatus.connecting,
    error: connectionStatus.error,

    // Actions
    connect,
    disconnect,
    addMessageHandler,
    sendMessageToCustomer,
    getOnlineStaff,
    getServiceStatus,

    // Service instance (để truy cập trực tiếp nếu cần)
    service: staffChatWebSocketService,
  };
};
