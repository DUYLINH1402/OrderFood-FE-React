import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import userWebSocketClient from "../services/websocket/userWebSocketClient";
import { chatService } from "../services";

/**
 * Custom hook để quản lý chức năng chat cho user
 */
export const useUserChat = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
    isFirst: true,
    isLast: true,
  });

  // Lấy thông tin user từ Redux store
  const { user, token } = useSelector((state) => state.auth);
  const userId = user?.id;

  // Ref để tránh duplicate subscriptions
  const handlersRef = useRef({});

  /**
   * Load lịch sử chat từ API (trang đầu tiên)
   */
  const loadChatHistory = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await chatService.getChatHistory(0, 20);

      // Xử lý response mới với pagination
      if (result && result.messages && Array.isArray(result.messages)) {
        setChatHistory(result.messages);
        setPagination({
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrevious: result.hasPrevious,
          isFirst: result.isFirst,
          isLast: result.isLast,
        });
      } else {
        console.warn("getChatHistory không trả về đúng format:", result);
        setChatHistory([]);
        setPagination({
          currentPage: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
          isFirst: true,
          isLast: true,
        });
      }

      // Cập nhật số lượng tin nhắn chưa đọc
      const unread = await chatService.getUnreadCount();
      setUnreadCount(unread);
    } catch (err) {
      console.error("Lỗi khi load chat history:", err);
      setError("Không thể tải lịch sử chat");
      setChatHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Load thêm tin nhắn cũ hơn (cho infinite scroll)
   */
  const loadMoreMessages = useCallback(async () => {
    if (!userId || isLoadingMore || !pagination.hasNext) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = pagination.currentPage + 1;
      const result = await chatService.getChatHistory(nextPage, 20);
      if (result && result.messages && Array.isArray(result.messages)) {
        // Thêm tin nhắn cũ và sort lại toàn bộ để đảm bảo thứ tự đúng
        setChatHistory((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          const allMessages = [...prevArray, ...result.messages];

          // Sort lại toàn bộ theo timestamp (cũ → mới)
          return allMessages.sort((a, b) => {
            const timeA = new Date(a.timestamp || a.createdAt || 0);
            const timeB = new Date(b.timestamp || b.createdAt || 0);
            return timeA - timeB;
          });
        });

        setPagination({
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrevious: result.hasPrevious,
          isFirst: result.isFirst,
          isLast: result.isLast,
        });
      }
    } catch (err) {
      console.error("Lỗi khi load thêm tin nhắn:", err);
      setError("Không thể tải thêm tin nhắn");
    } finally {
      setIsLoadingMore(false);
    }
  }, [userId, isLoadingMore, pagination.hasNext, pagination.currentPage]);
  /**
   * Gửi tin nhắn đến staff
   * @param {string} message - Nội dung tin nhắn
   * @param {object} replyToMessage - (Optional) Tin nhắn đang được phản hồi
   */
  const sendMessage = useCallback(
    async (message, replyToMessage = null) => {
      if (!message || !message.trim()) {
        setError("Tin nhắn không được để trống");
        return false;
      }

      if (!isConnected) {
        setError("Chưa kết nối đến server");
        return false;
      }

      try {
        // Chuẩn bị options cho chatToStaff
        let messageOptions;

        if (
          replyToMessage &&
          replyToMessage.id &&
          !replyToMessage.id.toString().startsWith("msg_")
        ) {
          // Gửi tin nhắn với thông tin reply
          messageOptions = {
            message: message.trim(),
            replyToMessageId: replyToMessage.id,
            replyContext: {
              text: replyToMessage.text || replyToMessage.content || replyToMessage.message,
              senderName: replyToMessage.staffName || replyToMessage.senderName || "Nhân viên",
              timestamp: replyToMessage.timestamp,
            },
          };
        } else {
          // Gửi tin nhắn thông thường
          messageOptions = message.trim();
        }

        const success = userWebSocketClient.chatToStaff(messageOptions);

        if (success) {
          // Thêm tin nhắn vào local state ngay lập tức để UX tốt hơn
          const tempId = Date.now(); // Temporary ID
          const newMessage = {
            id: tempId,
            message: message.trim(),
            senderId: userId,
            messageType: "USER_TO_STAFF",
            timestamp: new Date(), // Sử dụng Date object trực tiếp
            isRead: true, // Tin nhắn của mình luôn đã đọc
            status: "SENDING", // Trạng thái tạm thời
            // Thêm thông tin reply vào message hiển thị
            replyTo: replyToMessage
              ? {
                  id: replyToMessage.id,
                  text: replyToMessage.text || replyToMessage.content || replyToMessage.message,
                  sender: replyToMessage.sender || "staff",
                  senderName: replyToMessage.staffName || replyToMessage.senderName || "Nhân viên",
                  timestamp: replyToMessage.timestamp,
                }
              : null,
          };

          setChatHistory((prev) => {
            const prevArray = Array.isArray(prev) ? prev : [];
            return [...prevArray, newMessage];
          });

          // Fallback: Cập nhật status thành DELIVERED sau 3 giây nếu không nhận được confirmation
          setTimeout(() => {
            setChatHistory((prev) => {
              const prevArray = Array.isArray(prev) ? prev : [];
              return prevArray.map((msg) =>
                msg.id === tempId && msg.status === "SENDING"
                  ? { ...msg, status: "DELIVERED" }
                  : msg
              );
            });
          }, 3000);

          setError(null);
          return true;
        } else {
          setError("Không thể gửi tin nhắn");
          return false;
        }
      } catch (err) {
        console.error("Lỗi khi gửi tin nhắn:", err);
        setError("Có lỗi xảy ra khi gửi tin nhắn");
        return false;
      }
    },
    [userId, isConnected]
  );

  /**
   * Đánh dấu tin nhắn đã đọc
   */
  const markAsRead = useCallback(async (messageId) => {
    try {
      const success = await chatService.markAsRead(messageId);

      if (success) {
        // Cập nhật local state
        setChatHistory((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return prevArray.map((msg) => (msg.id === messageId ? { ...msg, isRead: true } : msg));
        });

        // Giảm số lượng tin nhắn chưa đọc
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      return success;
    } catch (err) {
      console.error("Lỗi khi đánh dấu tin nhắn đã đọc:", err);
      return false;
    }
  }, []);

  /**
   * Đánh dấu tất cả tin nhắn đã đọc
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await chatService.markAllAsRead();

      if (result.success) {
        // Cập nhật local state
        setChatHistory((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return prevArray.map((msg) => ({ ...msg, isRead: true }));
        });
        setUnreadCount(0);
      }

      return result;
    } catch (err) {
      console.error("Lỗi khi đánh dấu tất cả tin nhắn đã đọc:", err);
      return { success: false, count: 0 };
    }
  }, []);

  /**
   * Parse timestamp từ nhiều định dạng khác nhau thành Date object
   */
  const parseTimestamp = useCallback((timestamp) => {
    if (!timestamp) return new Date();

    // Nếu đã là Date object
    if (timestamp instanceof Date) {
      return isNaN(timestamp.getTime()) ? new Date() : timestamp;
    }

    // Nếu là number (timestamp milliseconds)
    if (typeof timestamp === "number") {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? new Date() : date;
    }

    // Nếu là string
    if (typeof timestamp === "string") {
      // Thử parse định dạng "DD/MM/YYYY HH:mm" hoặc "DD/MM/YYYY, HH:mm"
      const ddmmyyyyMatch = timestamp.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})[,\s]+(\d{1,2}):(\d{2})$/
      );
      if (ddmmyyyyMatch) {
        const [, day, month, year, hour, minute] = ddmmyyyyMatch;
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour),
          parseInt(minute)
        );
        return isNaN(date.getTime()) ? new Date() : date;
      }

      // Thử parse ISO string hoặc các format khác
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? new Date() : date;
    }

    return new Date();
  }, []);

  /**
   * Xử lý tin nhắn mới từ WebSocket
   */
  const handleNewChatMessage = useCallback(
    (data) => {
      console.log("Nhận tin nhắn chat mới:", data);

      // Xử lý replyTo context nếu có từ WebSocket
      let replyTo = null;
      if (data.replyToMessageId || data.replyTo || data.replyContext) {
        replyTo = {
          id: data.replyToMessageId || data.replyTo?.id,
          text:
            data.replyTo?.text ||
            data.replyContext?.originalText ||
            data.replyToText ||
            "Tin nhắn được phản hồi",
          sender: data.replyTo?.sender || data.replyContext?.originalSender || "user",
          senderName:
            data.replyTo?.senderName ||
            data.replyContext?.originalSender ||
            data.replyToSenderName ||
            "Bạn",
          timestamp: data.replyTo?.timestamp || data.replyContext?.originalTimestamp,
        };
      }

      // Tạo message object từ data nhận được
      // Sử dụng parseTimestamp để đảm bảo timestamp nhất quán (Date object)
      const newMessage = {
        id: data.id || data.messageId || Date.now(),
        message: data.message || data.content,
        content: data.message || data.content, // Giữ cả hai để tương thích
        senderId: data.senderId || data.staffId,
        messageType:
          data.messageType ||
          data.type ||
          (data.senderType === "USER" ? "USER_TO_STAFF" : "STAFF_TO_USER"),
        senderName: data.senderName || data.staffName,
        staffName: data.staffName || data.senderName,
        timestamp: parseTimestamp(data.timestamp), // Parse thành Date object
        isRead: false,
        status: "DELIVERED",
        replyTo: replyTo, // Thêm thông tin reply
      };

      // Thêm vào chat history
      setChatHistory((prev) => {
        // Đảm bảo prev là array
        const prevArray = Array.isArray(prev) ? prev : [];

        // Nếu là tin nhắn của user (confirmation từ server)
        if (newMessage.messageType === "USER_TO_STAFF" && newMessage.senderId === userId) {
          // Tìm và cập nhật tin nhắn tạm thời có cùng nội dung
          const tempMessageIndex = prevArray.findIndex(
            (msg) =>
              msg.messageType === "USER_TO_STAFF" &&
              msg.senderId === userId &&
              msg.message === newMessage.message &&
              msg.status === "SENDING"
          );

          if (tempMessageIndex !== -1) {
            // Cập nhật tin nhắn tạm thời với thông tin chính thức từ server
            const updatedMessages = [...prevArray];
            updatedMessages[tempMessageIndex] = {
              ...updatedMessages[tempMessageIndex],
              id: newMessage.id, // ID chính thức từ server
              timestamp: newMessage.timestamp,
              status: "DELIVERED",
            };
            return updatedMessages;
          }
        }

        // Kiểm tra xem tin nhắn đã tồn tại chưa (tránh duplicate)
        const exists = prevArray.some((msg) => msg.id === newMessage.id);
        if (exists) return prevArray;

        return [...prevArray, newMessage];
      });

      // Tăng số lượng tin nhắn chưa đọc nếu là tin nhắn từ staff
      // Tin nhắn từ staff sẽ không có messageType "USER_TO_STAFF"
      if (newMessage.messageType !== "USER_TO_STAFF") {
        setUnreadCount((prev) => prev + 1);
      }

      setError(null);
    },
    [userId]
  );

  /**
   * Khởi tạo WebSocket connection
   */
  useEffect(() => {
    if (!userId || !token) return;

    const initializeWebSocket = async () => {
      try {
        // Kết nối WebSocket nếu chưa kết nối
        if (!userWebSocketClient.isConnected()) {
          await userWebSocketClient.connect(userId, token);
        }

        setIsConnected(userWebSocketClient.isConnected());

        // Đăng ký handler cho tin nhắn chat mới
        if (!handlersRef.current.chatMessage) {
          handlersRef.current.chatMessage = userWebSocketClient.on(
            "chatMessage",
            handleNewChatMessage
          );
        }
      } catch (err) {
        console.error("Lỗi khi khởi tạo WebSocket cho chat:", err);
        setError("Không thể kết nối đến server chat");
        setIsConnected(false);
      }
    };

    initializeWebSocket();

    // Cleanup khi component unmount
    return () => {
      if (handlersRef.current.chatMessage) {
        handlersRef.current.chatMessage();
        handlersRef.current.chatMessage = null;
      }
    };
  }, [userId, token, handleNewChatMessage]);

  /**
   * Load chat history khi component mount
   */
  useEffect(() => {
    if (userId && token) {
      loadChatHistory();
    }
  }, [userId, token, loadChatHistory]);

  /**
   * Theo dõi trạng thái kết nối WebSocket
   */
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(userWebSocketClient.isConnected());
    };

    const interval = setInterval(checkConnection, 5000); // Kiểm tra mỗi 5 giây

    return () => clearInterval(interval);
  }, []);

  return {
    // State
    chatHistory,
    unreadCount,
    isLoading,
    isLoadingMore,
    isConnected,
    error,
    pagination,

    // Actions
    sendMessage,
    markAsRead,
    markAllAsRead,
    loadChatHistory,
    loadMoreMessages,

    // Utilities
    hasUnreadMessages: unreadCount > 0,
    canLoadMore: pagination.hasNext,
    connectionStatus: userWebSocketClient.getConnectionStatus(),
  };
};
