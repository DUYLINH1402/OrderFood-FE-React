// hooks/socket/useUserWebSocket.js
import { useEffect, useState, useCallback, useRef } from "react";
import userWebSocketClient from "./userWebSocketClient";

/**
 * React Hook để quản lý User WebSocket connection
 * Tương tự như useStaffWebSocket nhưng dành cho User
 */
export const useUserWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    isConnecting: false,
    lastError: null,
    reconnectAttempts: 0,
  });

  const isInitialized = useRef(false);
  const userId = useRef(null);
  const token = useRef(null);

  // Cập nhật connection status
  const updateConnectionStatus = useCallback(() => {
    const status = userWebSocketClient.getConnectionStatus();
    setConnectionStatus(status);
    setConnected(status.isConnected);
  }, []);

  /**
   * Khởi tạo kết nối WebSocket
   * @param {string} userIdParam - ID của user
   * @param {string} tokenParam - JWT token
   */
  const initialize = useCallback(
    async (userIdParam, tokenParam) => {
      if (isInitialized.current) {
        return;
      }
      userId.current = userIdParam;
      token.current = tokenParam;
      try {
        console.log(" Đang khởi tạo User WebSocket cho userId:", userIdParam);
        setConnectionStatus((prev) => ({ ...prev, isConnecting: true }));

        await userWebSocketClient.connect(userIdParam, tokenParam);

        isInitialized.current = true;
        updateConnectionStatus();
      } catch (error) {
        console.error(" Lỗi khởi tạo User WebSocket:", error);
        setConnectionStatus((prev) => ({
          ...prev,
          isConnecting: false,
          lastError: error.message,
        }));
      }
    },
    [updateConnectionStatus]
  );

  /**
   * Đăng ký message handler
   * @param {string} messageType - Loại message (orderConfirmed, orderUpdate, etc.)
   * @param {Function} handler - Function xử lý message
   * @returns {Function} Unsubscribe function
   */
  const addMessageHandler = useCallback((messageType, handler) => {
    return userWebSocketClient.addMessageHandler(messageType, handler);
  }, []);

  /**
   * Alias cho addMessageHandler để tương thích
   */
  const on = useCallback(
    (eventType, handler) => {
      return addMessageHandler(eventType, handler);
    },
    [addMessageHandler]
  );

  /**
   * Gửi ping để test kết nối
   */
  const ping = useCallback(() => {
    const success = userWebSocketClient.ping();
    return success;
  }, []);

  /**
   * Gửi tin nhắn chat tới staff
   */
  const chatToStaff = useCallback((message) => {
    const success = userWebSocketClient.chatToStaff(message);
    return success;
  }, []);

  /**
   * Publish message tùy ý
   */
  const publish = useCallback((destination, body, headers) => {
    return userWebSocketClient.publish(destination, body, headers);
  }, []);

  /**
   * Ngắt kết nối
   */
  const disconnect = useCallback(() => {
    userWebSocketClient.disconnect();
    isInitialized.current = false;
    userId.current = null;
    token.current = null;
    setConnected(false);
    setConnectionStatus({
      isConnected: false,
      isConnecting: false,
      lastError: null,
      reconnectAttempts: 0,
    });
  }, []);

  /**
   * Reconnect với thông tin đã lưu
   */
  const reconnect = useCallback(async () => {
    if (!userId.current || !token.current) {
      console.warn(" Không thể reconnect: thiếu userId hoặc token");
      return;
    }

    isInitialized.current = false;
    await initialize(userId.current, token.current);
  }, [initialize]);

  // Auto update connection status mỗi 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      if (isInitialized.current) {
        updateConnectionStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [updateConnectionStatus]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (isInitialized.current) {
        disconnect();
      }
    };
  }, [disconnect]);

  return {
    // Connection state
    connected,
    connectionStatus,

    // Connection methods
    initialize,
    disconnect,
    reconnect,

    // Message handling
    addMessageHandler,
    on, // alias

    // Actions
    ping,
    chatToStaff,
    publish,

    // Utils
    isInitialized: isInitialized.current,
    userId: userId.current,
  };
};
