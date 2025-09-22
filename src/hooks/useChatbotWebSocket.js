import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import userWebSocketClient from "../services/websocket/userWebSocketClient";
import {
  setTyping,
  incrementUnreadCount,
  selectSessionId,
  selectIsOpen,
} from "../store/slices/chatbotSlice";

/**
 * Hook để tích hợp WebSocket real-time cho chatbot
 * Sử dụng existing userWebSocketClient để tận dụng connection hiện tại
 */
export const useChatbotWebSocket = () => {
  const dispatch = useDispatch();
  const sessionId = useSelector(selectSessionId);
  const isOpen = useSelector(selectIsOpen);
  const user = useSelector((state) => state.auth.user);

  /**
   * Xử lý khi nhận được thông báo bot đang typing
   */
  const handleBotTyping = useCallback(
    (data) => {
      try {
        // Data format từ backend: { sessionId, isTyping, messageType: "BOT_TYPING" }
        if (data.sessionId === sessionId) {
          dispatch(setTyping(data.isTyping || false));

          // Auto clear typing sau 10 giây để tránh stuck
          if (data.isTyping) {
            setTimeout(() => {
              dispatch(setTyping(false));
            }, 10000);
          }
        }
      } catch (error) {
        console.error("Error handling bot typing:", error);
      }
    },
    [dispatch, sessionId]
  );

  /**
   * Xử lý khi nhận được tin nhắn mới từ bot qua WebSocket
   */
  const handleNewBotMessage = useCallback(
    (data) => {
      try {
        // Data format: { sessionId, messageId, message, timestamp, messageType: "NEW_BOT_MESSAGE" }
        if (data.sessionId === sessionId) {
          // Tắt typing indicator khi có tin nhắn mới
          dispatch(setTyping(false));

          // Tăng unread count nếu chatbot đang đóng
          if (!isOpen) {
            dispatch(incrementUnreadCount());
          }

          // TODO: Có thể dispatch action để thêm message trực tiếp vào state
          // thay vì chờ polling hoặc reload
          // dispatch(addNewBotMessage(data));
        }
      } catch (error) {
        console.error("Error handling new bot message:", error);
      }
    },
    [dispatch, sessionId, isOpen]
  );

  /**
   * Xử lý thông báo chatbot system events
   */
  const handleChatbotSystemEvent = useCallback(
    (data) => {
      try {
        // Data format: { eventType, sessionId, data, messageType: "CHATBOT_SYSTEM" }
        if (data.sessionId === sessionId) {
          switch (data.eventType) {
            case "SESSION_EXPIRED":
              // Session hết hạn - có thể hiển thị thông báo cho user
              console.warn("Chatbot session expired:", data);
              break;
            case "BOT_UNAVAILABLE":
              // Bot không khả dụng
              console.warn("Chatbot unavailable:", data);
              break;
            case "MAINTENANCE":
              // Bảo trì hệ thống
              console.warn("Chatbot maintenance:", data);
              break;
            default:
              console.log("Unknown chatbot system event:", data);
          }
        }
      } catch (error) {
        console.error("Error handling chatbot system event:", error);
      }
    },
    [sessionId]
  );

  /**
   * Gửi thông báo typing status tới server
   */
  const sendTypingStatus = useCallback(
    (isTyping) => {
      if (!sessionId || !userWebSocketClient.connected) {
        return false;
      }

      try {
        userWebSocketClient.publish(
          "/app/chatbot/typing",
          JSON.stringify({
            sessionId,
            userId: user?.id || null,
            isTyping,
            timestamp: new Date().toISOString(),
          }),
          {
            "Content-Type": "application/json",
          }
        );
        return true;
      } catch (error) {
        console.error("Error sending typing status:", error);
        return false;
      }
    },
    [sessionId, user?.id]
  );

  /**
   * Ping chatbot service để maintain connection
   */
  const pingChatbot = useCallback(() => {
    if (!sessionId || !userWebSocketClient.connected) {
      return false;
    }

    try {
      userWebSocketClient.publish(
        "/app/chatbot/ping",
        JSON.stringify({
          sessionId,
          userId: user?.id || null,
          timestamp: new Date().toISOString(),
        }),
        {
          "Content-Type": "application/json",
        }
      );
      return true;
    } catch (error) {
      console.error("Error pinging chatbot:", error);
      return false;
    }
  }, [sessionId, user?.id]);

  // Setup WebSocket message handlers
  useEffect(() => {
    if (!userWebSocketClient || !sessionId) {
      return;
    }

    // Đăng ký các handlers
    const unsubscribeBotTyping = userWebSocketClient.addMessageHandler(
      "botTyping",
      handleBotTyping
    );
    const unsubscribeNewMessage = userWebSocketClient.addMessageHandler(
      "newBotMessage",
      handleNewBotMessage
    );
    const unsubscribeSystemEvent = userWebSocketClient.addMessageHandler(
      "chatbotSystem",
      handleChatbotSystemEvent
    );

    // Ping chatbot định kỳ để maintain session
    const pingInterval = setInterval(() => {
      pingChatbot();
    }, 30000); // Ping every 30 seconds

    // Cleanup khi component unmount hoặc sessionId thay đổi
    return () => {
      unsubscribeBotTyping();
      unsubscribeNewMessage();
      unsubscribeSystemEvent();
      clearInterval(pingInterval);
    };
  }, [sessionId, handleBotTyping, handleNewBotMessage, handleChatbotSystemEvent, pingChatbot]);

  return {
    // Connection status
    isConnected: userWebSocketClient?.connected || false,

    // Actions
    sendTypingStatus,
    pingChatbot,

    // Connection info
    connectionStatus: {
      connected: userWebSocketClient?.connected || false,
      sessionId,
      userId: user?.id || null,
    },
  };
};
