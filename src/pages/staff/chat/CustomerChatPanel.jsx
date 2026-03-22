import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  UserIcon,
  ChatBubbleLeftRightIcon,
  MinusIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { chatApi } from "../../../services/api/chatApi";
import "../../../assets/styles/components/SharedChatStyles.scss";
import "../../../assets/styles/components/CustomerChatPanel.scss";
import ChatReplyInput from "../../../components/Support/ChatMessage/ChatReplyInput";
import ChatMessageItem from "../../../components/Support/ChatMessage/ChatMessageItem";

const CustomerChatPanel = ({
  isOpen,
  onMinimize,
  isMinimized,
  staffWebSocketClient,
  isConnected: connectedFromParent = false,
  onUnreadCountChange,
  serverUnreadCount = 0, // Thêm prop để nhận server count từ parent
}) => {
  // Redux - Lấy thông tin staff
  const staff = useSelector((state) => state.auth.user);

  // Local state
  const [customerChats, setCustomerChats] = useState(new Map()); // Map: userId -> chatData
  const [conversations, setConversations] = useState([]); // Danh sách conversation từ API
  const [activeCustomerId, setActiveCustomerId] = useState(null);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(connectedFromParent);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Mobile view state - "list" hiển thị danh sách, "chat" hiển thị nội dung chat
  const [mobileView, setMobileView] = useState("list");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // State cho reply functionality
  const [replyToMessage, setReplyToMessage] = useState(null); // Tin nhắn đang được reply
  const [isReplyMode, setIsReplyMode] = useState(false);
  const [isSending, setIsSending] = useState(false); // Ngăn gửi duplicate message
  const [showConfirmation, setShowConfirmation] = useState(false); // Thông báo đã gửi tin nhắn

  // State cho lazy loading tin nhắn
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false); // Đang load thêm tin cũ
  const [hasMoreMessages, setHasMoreMessages] = useState({}); // Map: userId -> boolean (còn tin cũ không)
  const [messagePages, setMessagePages] = useState({}); // Map: userId -> page hiện tại (bắt đầu từ 0)

  // Constants cho pagination
  const MESSAGES_PER_PAGE = 10; // Số tin nhắn load mỗi lần (page size)
  const MARK_READ_THROTTLE_MS = 2000; // Throttle thời gian giữa các lần đánh dấu đã đọc (2 giây)

  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null); // Ref cho container để detect scroll
  const chatPanelRef = useRef(null); // Ref cho click outside detection
  const inputRef = useRef(null); // Ref cho input để focus khi reply
  const lastSentMessageRef = useRef(null); // Track tin nhắn cuối để tránh duplicate
  const previousScrollHeightRef = useRef(0); // Lưu scroll height trước khi load thêm
  const lastMarkReadTimeRef = useRef({}); // Map: userId -> timestamp cuối cùng đánh dấu đã đọc
  const isLoadingMoreRef = useRef(false); // Flag để biết đang load thêm tin cũ (không scroll)
  const isInitialScrollRef = useRef(false); // Flag để ngăn load more khi đang scroll xuống bottom lần đầu

  // Refs để tránh stale closure trong WebSocket handlers
  const activeCustomerIdRef = useRef(activeCustomerId);
  const onUnreadCountChangeRef = useRef(onUnreadCountChange);
  const conversationsRef = useRef(conversations);
  const processedMessageIdsRef = useRef(new Set()); // Dedup tin nhắn từ nhiều channel WebSocket

  // Sync refs với state mới nhất (tránh stale closure trong WebSocket handlers)
  useEffect(() => {
    activeCustomerIdRef.current = activeCustomerId;
  }, [activeCustomerId]);
  useEffect(() => {
    onUnreadCountChangeRef.current = onUnreadCountChange;
  }, [onUnreadCountChange]);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Detect mobile screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync trạng thái kết nối từ parent và handle khi vừa reconnect
  useEffect(() => {
    const wasConnected = isConnected;
    setIsConnected(connectedFromParent);

    // Khi kết nối lại sau khi offline, load conversations để sync với server
    if (connectedFromParent && !wasConnected && staff) {
      loadConversations();

      // Sync read status sau khi reconnect để đảm bảo Badge chính xác
      setTimeout(async () => {
        await syncAllConversationsReadStatus();
      }, 1000); // Delay để đảm bảo conversations đã load xong
    } else if (connectedFromParent && staff) {
      // Load conversations lần đầu khi có kết nối
      loadConversations();
    }
  }, [connectedFromParent, staff]);

  // Khởi tạo WebSocket connection và message handlers - luôn hoạt động khi có kết nối
  useEffect(() => {
    if (staffWebSocketClient && connectedFromParent) {
      return initializeWebSocketHandlers();
    }
  }, [staffWebSocketClient, connectedFromParent]);

  // KHÔNG auto scroll khi customerChats thay đổi nữa
  // Việc scroll sẽ được xử lý riêng trong:
  // 1. handleCustomerSelect - khi chọn customer mới
  // 2. handleCustomerMessage - khi nhận tin nhắn mới từ WebSocket
  // 3. sendMessage - khi staff gửi tin nhắn

  // Auto scroll khi chuyển customer (luôn scroll xuống cuối khi mở conversation mới)
  // useEffect này chỉ xử lý khi activeCustomerId thay đổi, không phải khi messages thay đổi
  useEffect(() => {
    if (activeCustomerId && !isInitialScrollRef.current && !isLoadingMoreRef.current) {
      // Delay scroll để đảm bảo messages đã render
      setTimeout(scrollToBottom, 100);
    }
  }, [activeCustomerId]);

  // Xử lý click outside để minimize chat panel (CHỈ trên desktop)
  useEffect(() => {
    if (isMobile) return; // Trên mobile panel chiếm full screen, không cần click outside

    const handleClickOutside = (event) => {
      if (
        chatPanelRef.current &&
        !chatPanelRef.current.contains(event.target) &&
        isOpen &&
        !isMinimized
      ) {
        onMinimize();
      }
    };

    if (isOpen && !isMinimized) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isMinimized, isMobile]);

  // Load danh sách conversation khi component mount hoặc khi reconnect
  useEffect(() => {
    if (staff) {
      // CHỈ restore từ localStorage khi đang chờ API response (để tránh UI trống)
      const showTemporaryDataFromLocalStorage = () => {
        try {
          const savedUnreadData = localStorage.getItem("staff_chat_unread_data");
          if (savedUnreadData) {
            const unreadData = JSON.parse(savedUnreadData);
            const now = Date.now();
            const tenMinutes = 10 * 60 * 1000; // Tăng thời gian lên 10 phút

            // Chỉ hiển thị tạm thời nếu data còn fresh và có unread count
            if (
              unreadData.timestamp &&
              now - unreadData.timestamp < tenMinutes &&
              unreadData.conversations &&
              unreadData.totalUnread > 0 // Chỉ restore khi có unread count
            ) {
              const tempConversations = unreadData.conversations
                .filter((conv) => conv.unreadCount > 0) // Chỉ hiển thị conversations có unread
                .map((conv) => ({
                  userId: conv.userId,
                  user: { name: `Khách hàng ${conv.userId}` },
                  unreadCount: conv.unreadCount || 0,
                  lastMessageTime: new Date(unreadData.timestamp).toISOString(), // Dùng timestamp của unread data
                  lastMessage: null,
                  isTemporary: true, // Đánh dấu là data tạm thời
                }));

              if (tempConversations.length > 0) {
                setConversations(tempConversations);
              }
            }
          }
        } catch (error) {
          console.error("Lỗi khi restore temporary data từ localStorage:", error);
        }
      };

      // Hiển thị data tạm thời trước, sau đó load API (API sẽ override)
      showTemporaryDataFromLocalStorage();

      // LUÔN gọi API để lấy data chính xác (có thể có tin nhắn mới khi staff offline)
      loadConversations();
    }
  }, [staff, connectedFromParent]); // Thêm connectedFromParent để reload khi reconnect

  // Auto refresh unread count và sync read status mỗi 45 giây để đảm bảo Badge chính xác
  useEffect(() => {
    if (!staff) return;

    const intervalId = setInterval(async () => {
      // Luôn refresh unread count và sync read status từ server để đảm bảo Badge chính xác
      // Đặc biệt quan trọng khi có tin nhắn mới từ user khi staff offline
      if (!loading && !loadingMessages) {
        try {
          // Refresh total unread count
          await refreshUnreadCount();

          // Sync read status cho tất cả conversations (nếu có conversations)
          if (conversations.length > 0) {
            await syncAllConversationsReadStatus();
          }
        } catch (error) {
          console.error("Lỗi auto-refresh unread count & read status:", error);
        }
      }
    }, 45000); // 45 giây để tránh quá nhiều API calls

    return () => clearInterval(intervalId);
  }, [staff, loading, loadingMessages, conversations.length]); // Thêm conversations.length để restart interval khi có conversations mới

  // Theo dõi và báo cáo unread count khi conversations thay đổi (CHỈ từ WebSocket real-time)
  useEffect(() => {
    // CHỈ tính và báo cáo từ WebSocket updates, KHÔNG override server count
    if (onUnreadCountChange && connectedFromParent) {
      const totalUnread = conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);

      // CHỈ báo cáo khi có WebSocket updates (tăng từ real-time messages)
      const hasWebSocketUpdates = conversations.some(
        (conv) => !conv.isTemporary && conv.unreadCount > 0
      );

      if (hasWebSocketUpdates) {
        onUnreadCountChange(totalUnread);
      }
    }
  }, [conversations, onUnreadCountChange, connectedFromParent]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      // Báo cáo unread count cuối cùng khi component bị unmount
      if (onUnreadCountChange) {
        const totalUnread = conversations.reduce(
          (total, conv) => total + (conv.unreadCount || 0),
          0
        );
        onUnreadCountChange(totalUnread);
      }
    };
  }, []);

  // Load danh sách conversation từ API
  const loadConversations = async () => {
    setLoading(true);
    try {
      // LUÔN lấy tổng unread count chính xác từ server cho Badge (source of truth)
      const totalUnreadFromServer = await chatApi.getStaffUnreadCount();

      // Lấy danh sách conversations (có thể có slight discrepancy do timing)
      const data = await chatApi.getStaffConversations();
      const newConversations = data.conversations || [];

      // MERGE với conversations hiện tại để KHÔNG MẤT unread count từ WebSocket
      setConversations((prevConversations) => {
        // CHỈ merge với WebSocket data, KHÔNG merge với temporary localStorage data
        const validPrevConversations = prevConversations.filter((conv) => !conv.isTemporary);

        // LUÔN ưu tiên API data (source of truth) khi có
        // Chỉ merge với WebSocket data thực sự (không phải temporary localStorage)
        const merged = newConversations.map((apiConv) => {
          const existingConv = validPrevConversations.find((c) => c.userId === apiConv.userId);
          if (existingConv) {
            // Logic merge unread count:
            // 1. Khi staff vừa online lại: ưu tiên API count (chứa data từ server khi offline)
            // 2. Khi đang online: chọn max để không mất WebSocket real-time updates
            const wsCount = existingConv.unreadCount || 0;
            const apiCount = apiConv.unreadCount || 0;

            // Nếu có WebSocket data hợp lệ (không phải 0) thì merge, ngược lại dùng API
            const finalUnreadCount =
              connectedFromParent && wsCount > 0 ? Math.max(wsCount, apiCount) : apiCount; // Luôn ưu tiên API count khi staff vừa online hoặc WS count = 0

            return {
              ...apiConv,
              unreadCount: finalUnreadCount,
              isTemporary: false, // Đánh dấu không phải temporary
            };
          }
          return { ...apiConv, isTemporary: false };
        });

        // Thêm các conversations từ WebSocket mà API chưa có (chỉ realtime, không phải temporary)
        validPrevConversations.forEach((prevConv) => {
          const existsInApi = merged.find((c) => c.userId === prevConv.userId);
          if (!existsInApi && !prevConv.isTemporary) {
            merged.push({ ...prevConv, isTemporary: false });
          }
        });

        return merged;
      });

      // Báo cáo server count cho Badge ngay lập tức
      if (onUnreadCountChange) {
        onUnreadCountChange(totalUnreadFromServer);
      }

      // Sync read status cho tất cả conversations để đảm bảo Badge chính xác
      setTimeout(() => {
        syncAllConversationsReadStatus();
      }, 500); // Delay ngắn để không block UI
    } catch (error) {
      console.error("Lỗi khi load conversation:", error);
      // Chỉ hiển thị toast error khi không phải auto-refresh
      if (!conversations.length) {
        toast.error("Không thể tải danh sách cuộc trò chuyện");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load tin nhắn chi tiết cho một user (với pagination)
  const loadUserMessages = async (userId, shouldMarkAsRead = false, isLoadMore = false) => {
    // Nếu đang load thêm, sử dụng state riêng
    if (isLoadMore) {
      setLoadingMoreMessages(true);
    } else {
      setLoadingMessages(true);
    }

    try {
      // Xác định page hiện tại (API sử dụng page-based pagination)
      const currentPage = isLoadMore ? messagePages[userId] || 1 : 0;

      console.log(
        `Load tin nhắn user ${userId}: page=${currentPage}, size=${MESSAGES_PER_PAGE}, isLoadMore=${isLoadMore}`
      );

      const data = await chatApi.getUserMessages(userId, currentPage, MESSAGES_PER_PAGE);
      console.log(`API response for user ${userId} messages:`, data);
      if (data.messages && data.messages.length > 0) {
        // Format messages cho display
        const formattedMessages = data.messages.map((msg) => chatApi.formatMessageForDisplay(msg));

        // Sắp xếp tin nhắn theo thời gian tăng dần (cũ nhất trước, mới nhất sau)
        // Điều này đảm bảo hiển thị đúng thứ tự như Facebook Messenger
        formattedMessages.sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          return timeA - timeB;
        });

        // Kiểm tra còn tin nhắn cũ không (nếu trả về đủ số lượng thì có thể còn)
        const hasMore = data.messages.length >= MESSAGES_PER_PAGE;
        setHasMoreMessages((prev) => ({ ...prev, [userId]: hasMore }));

        // Cập nhật page cho lần load tiếp theo
        const nextPage = currentPage + 1;
        setMessagePages((prev) => ({ ...prev, [userId]: nextPage }));

        if (isLoadMore) {
          // Load thêm: prepend tin nhắn cũ vào đầu danh sách
          setCustomerChats((prev) => {
            const newChats = new Map(prev);
            const existingChat = newChats.get(userId);
            if (existingChat) {
              // Tin nhắn cũ (formattedMessages) được thêm vào đầu danh sách
              // Sau đó sắp xếp lại toàn bộ theo thời gian tăng dần
              const allMessages = [...formattedMessages, ...existingChat.messages];

              // Loại bỏ tin nhắn trùng lặp (theo id)
              const uniqueMessages = allMessages.filter(
                (msg, index, self) => index === self.findIndex((m) => m.id === msg.id)
              );

              // Sắp xếp theo thời gian tăng dần (cũ nhất trước, mới nhất sau)
              uniqueMessages.sort((a, b) => {
                const timeA = new Date(a.timestamp).getTime();
                const timeB = new Date(b.timestamp).getTime();
                return timeA - timeB;
              });

              existingChat.messages = uniqueMessages;
            }
            newChats.set(userId, existingChat);
            return newChats;
          });
        } else {
          // Load lần đầu: đếm số tin nhắn chưa đọc
          const unreadMessages = formattedMessages.filter(
            (msg) => !msg.isRead && (msg.sender === "user" || msg.sender?.type === "user")
          );

          // Tạo chat data cho user này
          const chatData = {
            userId: userId,
            user: data.user,
            messages: formattedMessages,
            unreadCount: shouldMarkAsRead ? 0 : unreadMessages.length,
            lastMessage: formattedMessages[formattedMessages.length - 1],
            lastMessageTime: formattedMessages[formattedMessages.length - 1]?.timestamp,
            totalMessages: data.totalMessages || formattedMessages.length, // Tổng số tin nhắn
          };

          // Cập nhật customerChats
          setCustomerChats((prev) => {
            const newChats = new Map(prev);
            newChats.set(userId, chatData);
            return newChats;
          });

          // CHỈ đánh dấu đã đọc khi Staff thực sự mở conversation (shouldMarkAsRead = true)
          if (shouldMarkAsRead && unreadMessages.length > 0) {
            // Lấy danh sách ID tin nhắn chưa đọc
            const unreadMessageIds = unreadMessages
              .map((msg) => msg.id)
              .filter((id) => id && !id.toString().startsWith("msg_"));

            if (unreadMessageIds.length > 0) {
              // Sử dụng batch API staff endpoint để đánh dấu tất cả cùng lúc
              const result = await chatApi.markMessagesAsReadBatchForStaff(unreadMessageIds);

              // Cập nhật flag isRead trong local state
              unreadMessages.forEach((msg) => {
                msg.isRead = true;
              });

              // Cập nhật UI ngay lập tức
              if (onUnreadCountChange) {
                const currentTotal = conversations.reduce(
                  (total, conv) => total + (conv.unreadCount || 0),
                  0
                );
                const estimatedTotal = Math.max(0, currentTotal - result.markedCount);
                onUnreadCountChange(estimatedTotal);
              }

              // Re-fetch unread count từ API để đồng bộ chính xác
              try {
                const totalUnread = await chatApi.getStaffUnreadCount();
                if (onUnreadCountChange) {
                  onUnreadCountChange(totalUnread);
                }
              } catch (error) {
                console.error("Lỗi khi re-fetch unread count:", error);
              }
            }

            // Cập nhật conversation để reset unread count
            setConversations((prev) =>
              prev.map((conv) => (conv.userId === userId ? { ...conv, unreadCount: 0 } : conv))
            );
          }
        }
      } else {
        // Không còn tin nhắn cũ
        setHasMoreMessages((prev) => ({ ...prev, [userId]: false }));
      }
    } catch (error) {
      console.error("Lỗi khi load tin nhắn user:", error);
      if (!isLoadMore) {
        toast.error("Không thể tải tin nhắn");
      }
    } finally {
      if (isLoadMore) {
        setLoadingMoreMessages(false);
      } else {
        setLoadingMessages(false);
        // Set flag để ngăn load more khi đang scroll xuống bottom
        isInitialScrollRef.current = true;
        // Scroll xuống cuối sau khi load tin nhắn lần đầu
        setTimeout(() => {
          scrollToBottom();
          // Reset flag sau khi scroll xong (delay thêm 300ms để đảm bảo scroll hoàn tất)
          setTimeout(() => {
            isInitialScrollRef.current = false;
          }, 300);
        }, 150);
      }
    }
  };

  // Hàm load thêm tin nhắn cũ
  const loadMoreMessages = useCallback(async () => {
    if (!activeCustomerId || loadingMoreMessages || !hasMoreMessages[activeCustomerId]) {
      return;
    }

    // Set flag để ngăn auto scroll khi đang load thêm tin cũ
    isLoadingMoreRef.current = true;

    // Lưu scroll height trước khi load
    const container = messagesContainerRef.current;
    const previousScrollHeight = container ? container.scrollHeight : 0;
    const previousScrollTop = container ? container.scrollTop : 0;

    await loadUserMessages(activeCustomerId, false, true);

    // Khôi phục vị trí scroll sau khi load xong
    // Sử dụng nhiều lần requestAnimationFrame để đảm bảo DOM đã render hoàn toàn
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          const newScrollHeight = messagesContainerRef.current.scrollHeight;
          const scrollDiff = newScrollHeight - previousScrollHeight;
          // Giữ nguyên vị trí xem bằng cách thêm scrollDiff vào scrollTop
          messagesContainerRef.current.scrollTop = previousScrollTop + scrollDiff;
        }
        // Reset flag sau khi đã khôi phục scroll
        setTimeout(() => {
          isLoadingMoreRef.current = false;
        }, 100);
      });
    });
  }, [activeCustomerId, loadingMoreMessages, hasMoreMessages]);

  // Hàm đánh dấu tất cả tin nhắn đã đọc cho customer đang active
  // Gọi khi: click vào khung chat, scroll, hoặc focus vào input
  // Có throttle để tránh gọi API quá nhiều lần
  const markAllMessagesAsReadForActiveCustomer = useCallback(async () => {
    if (!activeCustomerId) return;

    // Kiểm tra throttle - nếu đã gọi trong vòng MARK_READ_THROTTLE_MS thì bỏ qua
    const now = Date.now();
    const lastMarkTime = lastMarkReadTimeRef.current[activeCustomerId] || 0;
    if (now - lastMarkTime < MARK_READ_THROTTLE_MS) {
      return; // Skip nếu chưa đủ thời gian throttle
    }

    const existingChat = customerChats.get(activeCustomerId);
    if (!existingChat) return;

    // Tìm các tin nhắn chưa đọc từ user
    const unreadMessages = existingChat.messages.filter((msg) => {
      const isUserMessage =
        msg.sender === "user" || msg.sender === "customer" || msg.sender?.type === "user";
      return !msg.isRead && isUserMessage;
    });

    // Nếu không có tin nhắn chưa đọc, không cần làm gì
    if (unreadMessages.length === 0) return;

    // Cập nhật thời điểm đánh dấu đã đọc
    lastMarkReadTimeRef.current[activeCustomerId] = now;

    console.log(`Đánh dấu ${unreadMessages.length} tin nhắn đã đọc khi tương tác với chat`);

    // Lấy danh sách ID tin nhắn chưa đọc (loại bỏ temporary IDs)
    const unreadMessageIds = unreadMessages
      .map((msg) => msg.id)
      .filter((id) => id && !id.toString().startsWith("msg_"));

    if (unreadMessageIds.length > 0) {
      try {
        // Gọi batch API staff endpoint để đánh dấu tất cả đã đọc
        const result = await chatApi.markMessagesAsReadBatchForStaff(unreadMessageIds);

        // Cập nhật flag isRead trong local state
        setCustomerChats((prev) => {
          const newChats = new Map(prev);
          const chat = newChats.get(activeCustomerId);
          if (chat) {
            chat.messages = chat.messages.map((msg) => {
              if (unreadMessageIds.includes(msg.id)) {
                return { ...msg, isRead: true };
              }
              return msg;
            });
            chat.unreadCount = 0;
          }
          newChats.set(activeCustomerId, chat);
          return newChats;
        });

        // Cập nhật conversation để reset unread count
        setConversations((prev) =>
          prev.map((conv) =>
            conv.userId === activeCustomerId ? { ...conv, unreadCount: 0 } : conv
          )
        );

        console.log(`Đã đánh dấu ${result.markedCount} tin nhắn đã đọc`);

        // Re-fetch unread count từ API để đồng bộ chính xác
        try {
          const totalUnread = await chatApi.getStaffUnreadCount();
          if (onUnreadCountChange) {
            onUnreadCountChange(totalUnread);
          }
        } catch (error) {
          console.error("Lỗi khi re-fetch unread count:", error);
        }
      } catch (error) {
        console.error("Lỗi khi đánh dấu tin nhắn đã đọc:", error);
      }
    } else {
      // Nếu chỉ có temporary messages, vẫn reset UI
      setCustomerChats((prev) => {
        const newChats = new Map(prev);
        const chat = newChats.get(activeCustomerId);
        if (chat) {
          chat.unreadCount = 0;
        }
        newChats.set(activeCustomerId, chat);
        return newChats;
      });

      setConversations((prev) =>
        prev.map((conv) => (conv.userId === activeCustomerId ? { ...conv, unreadCount: 0 } : conv))
      );
    }
  }, [activeCustomerId, customerChats, onUnreadCountChange]);

  // Xử lý scroll để load thêm tin nhắn cũ VÀ đánh dấu đã đọc
  const handleMessagesScroll = useCallback(
    (e) => {
      const container = e.target;

      // KHÔNG load thêm tin nhắn cũ nếu đang trong quá trình scroll xuống bottom lần đầu
      // hoặc đang load more
      if (isInitialScrollRef.current) {
        return;
      }

      // Khi scroll gần đến đầu container (trong vòng 50px), trigger load thêm
      // Thêm điều kiện: container phải có đủ chiều cao và không đang ở bottom
      const isNearTop = container.scrollTop < 50;
      const hasEnoughContent = container.scrollHeight > container.clientHeight;
      const isNotAtBottom =
        container.scrollTop + container.clientHeight < container.scrollHeight - 50;

      if (
        isNearTop &&
        hasEnoughContent &&
        isNotAtBottom &&
        !loadingMoreMessages &&
        hasMoreMessages[activeCustomerId]
      ) {
        loadMoreMessages();
      }

      // Đánh dấu tất cả tin nhắn đã đọc khi scroll
      markAllMessagesAsReadForActiveCustomer();
    },
    [
      loadingMoreMessages,
      hasMoreMessages,
      activeCustomerId,
      loadMoreMessages,
      markAllMessagesAsReadForActiveCustomer,
    ]
  );

  // Xử lý khi click vào khung tin nhắn
  const handleMessagesContainerClick = useCallback(() => {
    markAllMessagesAsReadForActiveCustomer();
  }, [markAllMessagesAsReadForActiveCustomer]);

  // Xử lý khi focus vào input (bắt đầu nhập tin nhắn)
  const handleInputFocus = useCallback(() => {
    markAllMessagesAsReadForActiveCustomer();
  }, [markAllMessagesAsReadForActiveCustomer]);

  // Sync read status cho tất cả conversations từ server
  const syncAllConversationsReadStatus = async () => {
    try {
      if (conversations.length === 0) return;

      // Nếu đang xem một conversation → mark-as-read trên server trước khi sync
      const currentActive = activeCustomerIdRef.current;
      if (currentActive) {
        try {
          await chatApi.markUserMessagesAsReadForStaff(currentActive);
        } catch (err) {
          console.error("Lỗi khi mark-as-read trước sync:", err);
        }
      }

      const userIds = conversations.map((conv) => conv.userId).filter(Boolean);

      if (userIds.length === 0) return;

      // Gọi batch API để kiểm tra read status
      const readStatusResults = await chatApi.getBatchUserReadStatus(userIds);

      // Cập nhật conversations với read status từ server
      let totalUnreadAfterSync = 0;

      setConversations((prev) => {
        const updated = prev.map((conv) => {
          const readStatus = readStatusResults.find((r) => r.userId === conv.userId);
          if (readStatus) {
            const serverUnreadCount = readStatus.unreadMessages || 0;

            // Conversation đang active → luôn set unread = 0
            // (server có thể chưa kịp cập nhật do race condition)
            const isActive = String(conv.userId) === String(currentActive);
            const finalUnread = isActive ? 0 : serverUnreadCount;
            totalUnreadAfterSync += finalUnread;

            return {
              ...conv,
              unreadCount: finalUnread,
              allMessagesRead: isActive ? true : readStatus.allMessagesRead,
              hasUnreadMessages: isActive ? false : readStatus.hasUnreadMessages,
            };
          }
          return conv;
        });
        return updated;
      });

      // Cập nhật total badge count sau khi sync
      if (onUnreadCountChange) {
        onUnreadCountChange(totalUnreadAfterSync);
      }
    } catch (error) {
      console.error("Lỗi khi sync read status:", error);
    }
  };

  // Sync read status cho một user cụ thể
  const syncUserReadStatus = async (userId) => {
    try {
      const readStatus = await chatApi.getUserReadStatus(userId);

      // Nếu user này đang được staff xem → unread luôn = 0
      const isActive = String(userId) === String(activeCustomerIdRef.current);

      // Cập nhật conversation cụ thể
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.userId === userId) {
            const serverUnreadCount = readStatus.unreadMessages || 0;
            const finalUnread = isActive ? 0 : serverUnreadCount;

            return {
              ...conv,
              unreadCount: finalUnread,
              allMessagesRead: isActive ? true : readStatus.allMessagesRead,
              hasUnreadMessages: isActive ? false : readStatus.hasUnreadMessages,
            };
          }
          return conv;
        });
        return updated;
      });

      return readStatus;
    } catch (error) {
      console.error(`Lỗi khi sync read status user ${userId}:`, error);
      return null;
    }
  };

  // Force refresh chỉ unread count từ server (không cần load conversations)
  const refreshUnreadCount = async () => {
    try {
      const totalUnreadFromServer = await chatApi.getStaffUnreadCount();
      if (onUnreadCountChange) {
        onUnreadCountChange(totalUnreadFromServer);
      }

      return totalUnreadFromServer;
    } catch (error) {
      console.error("Lỗi khi refresh unread count:", error);
      return 0;
    }
  };

  // Force refresh cả unread count và read status từ server
  const forceRefreshAll = async () => {
    try {
      setLoading(true);

      // Trước khi refresh: nếu đang xem conversation, đánh dấu đã đọc trên server trước
      const previousActiveCustomer = activeCustomerId;
      if (previousActiveCustomer) {
        try {
          await chatApi.markUserMessagesAsReadForStaff(previousActiveCustomer);
        } catch (err) {
          console.error("Lỗi khi mark-as-read trước refresh:", err);
        }
      }

      // Lấy tổng unread count chính xác từ server (sau khi đã mark-as-read)
      const totalUnreadFromServer = await chatApi.getStaffUnreadCount();

      // Lấy danh sách conversations MỚI từ API (đã bao gồm unread count chính xác)
      const data = await chatApi.getStaffConversations();
      const newConversations = data.conversations || [];

      // Tính tổng unread từ conversations
      const totalFromConversations = newConversations.reduce(
        (sum, conv) => sum + (conv.unreadCount || 0),
        0
      );

      // FORCE REPLACE - không merge, luôn ưu tiên API data khi force refresh
      setConversations(
        newConversations.map((conv) => ({
          ...conv,
          isTemporary: false,
        }))
      );

      // Báo cáo tổng unread từ conversations thay vì server count riêng
      // Vì getStaffConversations đã gọi getBatchUserReadStatus bên trong
      if (onUnreadCountChange) {
        onUnreadCountChange(totalFromConversations);
      }

      // Reset customerChats để buộc load lại tin nhắn
      setCustomerChats(new Map());
      setActiveCustomerId(null);

      // Reset pagination states
      setHasMoreMessages({});
      setMessagePages({});
    } catch (error) {
      console.error("Lỗi khi force refresh all:", error);
      toast.error("Không thể đồng bộ dữ liệu từ server");
    } finally {
      setLoading(false);
    }
  };

  const initializeWebSocketHandlers = () => {
    if (!staffWebSocketClient) {
      toast.error("Không thể kết nối WebSocket");
      return;
    }

    // Đăng ký các handler để nhận tin nhắn từ khách hàng
    const unsubscribeCustomerMessage = staffWebSocketClient.addMessageHandler(
      "customerMessage",
      handleCustomerMessage
    );

    const unsubscribeUserChatMessage = staffWebSocketClient.addMessageHandler(
      "userChatMessage",
      handleCustomerMessage
    );

    // Đăng ký handler cho phản hồi tin nhắn
    const unsubscribeReplySent = staffWebSocketClient.addMessageHandler(
      "replySent",
      handleReplySent
    );

    // Cleanup khi component unmount
    return () => {
      if (unsubscribeCustomerMessage) unsubscribeCustomerMessage();
      if (unsubscribeUserChatMessage) unsubscribeUserChatMessage();
      if (unsubscribeReplySent) unsubscribeReplySent();
    };
  };

  // Xử lý xác nhận gửi reply thành công
  const handleReplySent = (data) => {
    // Hiển thị thông báo phù hợp
    const message = data.replyToMessageId
      ? "Phản hồi đã được gửi thành công"
      : "Tin nhắn đã được gửi thành công";
  };

  const handleCustomerMessage = (data) => {
    try {
      let messageData;

      if (typeof data === "string") {
        try {
          messageData = JSON.parse(data);
        } catch (parseError) {
          return;
        }
      } else {
        messageData = data;
      }

      // Xử lý các loại tin nhắn khác nhau từ WebSocket
      let customerId, customerName, messageText, messageType;

      if (messageData.type === "USER_CHAT" || messageData.type === "USER_CHAT_REALTIME") {
        // Tin nhắn từ user chat
        customerId = messageData.userId || messageData.userPhone;
        customerName = messageData.userName || messageData.userPhone || `Khách hàng ${customerId}`;
        messageText = messageData.message;
        messageType = messageData.type;
      } else if (messageData.userPhone || messageData.userId) {
        // Tin nhắn trực tiếp
        customerId = messageData.userId || messageData.userPhone || messageData.customerId;
        customerName =
          messageData.userName ||
          messageData.customerName ||
          messageData.userPhone ||
          `Khách hàng ${customerId}`;
        messageText = messageData.message || messageData.content;
      } else {
        return;
      }

      if (!customerId || !messageText) {
        return;
      }

      // Dedup: tin nhắn có thể đến từ cả 2 channel WebSocket (/topic/staff-chat và /user/queue/chat-messages)
      const messageId = messageData.messageId || messageData.id;
      const dedupKey = messageId
        ? String(messageId)
        : `${customerId}_${messageText}_${messageData.timestamp || ""}`;
      if (processedMessageIdsRef.current.has(dedupKey)) {
        return; // Đã xử lý rồi, bỏ qua
      }
      processedMessageIdsRef.current.add(dedupKey);
      // Giữ Set không quá lớn - xóa entry cũ sau 30 giây
      setTimeout(() => processedMessageIdsRef.current.delete(dedupKey), 30000);

      // Đọc activeCustomerId từ ref (luôn là giá trị mới nhất, tránh stale closure)
      const currentActiveCustomerId = activeCustomerIdRef.current;
      const isActiveConversation = String(currentActiveCustomerId) === String(customerId);

      // Xử lý thông tin reply nếu có
      let replyTo = null;
      if (messageData.replyToMessageId || messageData.replyContext) {
        replyTo = {
          id: messageData.replyToMessageId,
          text: messageData.replyContext?.originalText || "Tin nhắn đã bị xóa",
          sender: "staff",
          senderName: messageData.replyContext?.originalSender || "Nhân viên",
          timestamp: messageData.replyContext?.originalTimestamp,
        };
      }

      const newMessage = {
        id: messageId || `msg_${Date.now()}_${Math.random()}`,
        text: messageText,
        sender: "user",
        timestamp: new Date(messageData.timestamp || Date.now()),
        customerName,
        messageType,
        // Giữ isRead: false để markAllMessagesAsReadForActiveCustomer có thể sync server
        isRead: false,
        replyTo: replyTo,
      };

      setCustomerChats((prev) => {
        const newChats = new Map(prev);
        const existingChat = newChats.get(customerId) || {
          customerId,
          customerName,
          messages: [],
          unreadCount: 0,
          lastMessageTime: new Date(),
        };

        // Kiểm tra duplicate trong messages hiện tại
        const isDuplicate = existingChat.messages.some((msg) => msg.id === newMessage.id);
        if (isDuplicate) {
          return prev; // Không thay đổi state nếu tin nhắn đã tồn tại
        }

        // Thêm tin nhắn mới
        existingChat.messages = [...existingChat.messages, newMessage];
        existingChat.lastMessageTime = newMessage.timestamp;

        // Chỉ tăng unread count khi Staff KHÔNG đang xem conversation này
        if (!isActiveConversation) {
          existingChat.unreadCount += 1;
        }
        newChats.set(customerId, existingChat);

        return newChats;
      });

      // Cập nhật conversations để đồng bộ unread count
      setConversations((prev) => {
        const updatedConversations = prev.map((conv) => {
          if (conv.userId === customerId) {
            return {
              ...conv,
              // Chỉ tăng unread khi Staff KHÔNG đang xem conversation này
              unreadCount: isActiveConversation ? 0 : (conv.unreadCount || 0) + 1,
              lastMessageTime: newMessage.timestamp,
              lastMessage: {
                content: messageText,
                timestamp: newMessage.timestamp,
              },
              isTemporary: false,
            };
          }
          return conv;
        });

        // Nếu customer chưa có trong conversations, thêm mới
        const existingConv = prev.find((c) => c.userId === customerId);
        if (!existingConv) {
          updatedConversations.push({
            userId: customerId,
            user: { name: customerName },
            unreadCount: isActiveConversation ? 0 : 1,
            lastMessageTime: newMessage.timestamp,
            lastMessage: {
              content: messageText,
              timestamp: newMessage.timestamp,
            },
            isTemporary: false,
          });
        }

        return updatedConversations;
      });

      // Nếu staff đang xem conversation này → gọi markUserMessagesAsRead để server cũng biết
      if (isActiveConversation) {
        // Dùng markUserMessagesAsRead (lấy TẤT CẢ unread từ server rồi mark) - đáng tin cậy hơn
        // fire-and-forget nhưng gọi API toàn diện
        chatApi
          .markUserMessagesAsReadForStaff(customerId)
          .then(() => {
            // Sau khi server đã mark xong, re-fetch badge count để chính xác
            chatApi
              .getStaffUnreadCount()
              .then((serverCount) => {
                onUnreadCountChangeRef.current?.(serverCount);
              })
              .catch(() => {});
          })
          .catch((err) =>
            console.error("Lỗi auto markUserMessagesAsRead cho active conversation:", err)
          );
      }

      // Cập nhật Badge count
      const onChangeCallback = onUnreadCountChangeRef.current;
      if (onChangeCallback) {
        if (isActiveConversation) {
          // Active conversation → badge không cần tăng, sẽ sync sau markUserMessagesAsRead
        } else {
          // Conversation không active → tính local nhanh rồi sync server
          const currentConversations = conversationsRef.current;
          const localTotal = currentConversations.reduce((total, conv) => {
            if (conv.userId === customerId) {
              return total + ((conv.unreadCount || 0) + 1);
            }
            return total + (conv.unreadCount || 0);
          }, 0);
          const finalTotal = currentConversations.find((c) => c.userId === customerId)
            ? localTotal
            : localTotal + 1;
          onChangeCallback(finalTotal);

          // Sau đó sync với server để chính xác
          setTimeout(async () => {
            try {
              const serverCount = await chatApi.getStaffUnreadCount();
              onUnreadCountChangeRef.current?.(serverCount);
            } catch (error) {
              console.error("Lỗi khi re-fetch server count:", error);
            }
          }, 500);
        }
      }

      // Tự động chọn customer nếu chưa có ai được chọn
      if (!currentActiveCustomerId) {
        setActiveCustomerId(customerId);
      }

      // Scroll xuống bottom nếu tin nhắn mới từ customer đang active
      if (isActiveConversation) {
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error("Lỗi khi xử lý tin nhắn từ khách hàng:", error);
      toast.error("Lỗi khi nhận tin nhắn");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const sendMessage = async (text = input) => {
    // Trim text trước
    const trimmedText = text.trim();
    if (!trimmedText || !isConnected || !activeCustomerId || isSending) return;

    // Kiểm tra duplicate với tin nhắn cuối trong vòng 2 giây
    const now = Date.now();
    const lastSent = lastSentMessageRef.current;
    if (
      lastSent &&
      lastSent.text === trimmedText &&
      lastSent.customerId === activeCustomerId &&
      now - lastSent.time < 2000
    ) {
      return;
    }

    // Set flag để ngăn gửi duplicate
    setIsSending(true);

    const activeChat = customerChats.get(activeCustomerId);
    if (!activeChat) {
      setIsSending(false);
      return;
    }

    // Clear input ngay lập tức AFTER trim để tránh còn lại ký tự
    setInput("");

    // Tạo tin nhắn của staff
    const staffMessage = {
      id: Date.now(),
      text: trimmedText,
      sender: "staff",
      timestamp: new Date(),
      staffName: staff?.fullName || staff?.name || "Nhân viên",
      status: "SENT", // Thêm trạng thái gửi
      replyTo: replyToMessage
        ? {
            id: replyToMessage.id,
            text: replyToMessage.text || replyToMessage.content || replyToMessage.message,
            sender: replyToMessage.sender,
            customerName: replyToMessage.customerName,
            senderName: replyToMessage.customerName || "Khách hàng",
          }
        : null,
    };

    // Thêm tin nhắn vào UI ngay lập tức
    setCustomerChats((prev) => {
      const newChats = new Map(prev);
      const chat = newChats.get(activeCustomerId);
      if (chat) {
        chat.messages.push(staffMessage);
        chat.lastMessageTime = staffMessage.timestamp;
      }
      newChats.set(activeCustomerId, chat);
      return newChats;
    });

    // Scroll xuống bottom sau khi thêm tin nhắn của staff
    setTimeout(scrollToBottom, 100);

    // Reset reply mode
    if (isReplyMode) {
      setIsReplyMode(false);
      setReplyToMessage(null);
    }

    try {
      // Chuẩn bị options cho sendMessageToUser (thống nhất với BE /chat/staff-reply)
      const messageOptions = {
        userId: activeCustomerId,
        message: trimmedText,
      };

      // Nếu đang reply tin nhắn cụ thể, thêm thông tin reply
      if (replyToMessage && replyToMessage.id && !replyToMessage.id.toString().startsWith("msg_")) {
        console.log("Gửi phản hồi cho tin nhắn:", replyToMessage.id);

        messageOptions.replyToMessageId = replyToMessage.id;
        messageOptions.replyContext = {
          text: replyToMessage.text || replyToMessage.content || replyToMessage.message,
          senderName: replyToMessage.customerName || replyToMessage.senderName || "Khách hàng",
          timestamp: replyToMessage.timestamp,
        };
      } else {
        console.log("Gửi tin nhắn thông thường tới user:", activeCustomerId);
      }

      // Gọi method thống nhất
      const success = staffWebSocketClient.sendMessageToUser(messageOptions);

      if (!success) {
        throw new Error("Không thể gửi tin nhắn");
      }

      // Cập nhật trạng thái tin nhắn thành DELIVERED
      setCustomerChats((prev) => {
        const newChats = new Map(prev);
        const chat = newChats.get(activeCustomerId);
        if (chat) {
          const msgIndex = chat.messages.findIndex((msg) => msg.id === staffMessage.id);
          if (msgIndex !== -1) {
            chat.messages[msgIndex].status = "DELIVERED";
          }
        }
        newChats.set(activeCustomerId, chat);
        return newChats;
      });

      // Hiển thị popup thông báo gửi thành công
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000); // Ẩn sau 3 giây

      // Lưu thông tin tin nhắn đã gửi thành công để tránh duplicate
      lastSentMessageRef.current = {
        text: trimmedText,
        customerId: activeCustomerId,
        time: Date.now(),
      };
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");

      // Remove tin nhắn thất bại
      setCustomerChats((prev) => {
        const newChats = new Map(prev);
        const chat = newChats.get(activeCustomerId);
        if (chat) {
          chat.messages = chat.messages.filter((msg) => msg.id !== staffMessage.id);
        }
        newChats.set(activeCustomerId, chat);
        return newChats;
      });

      // Khôi phục text trong input
      setInput(trimmedText);

      // Khôi phục reply mode nếu có
      if (staffMessage.replyTo) {
        setIsReplyMode(true);
        setReplyToMessage(replyToMessage);
      }
    } finally {
      // Reset flag để cho phép gửi tiếp
      setIsSending(false);
    }
  };

  // Xử lý khi user click nút Reply
  const handleReplyToMessage = (message) => {
    console.log("🔄 Reply to message:", message);
    setReplyToMessage(message);
    setIsReplyMode(true);

    // Focus vào input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Hủy reply mode
  const handleCancelReply = () => {
    setReplyToMessage(null);
    setIsReplyMode(false);
  };

  // Quay lại danh sách khách hàng trên mobile
  const handleBackToList = () => {
    setMobileView("list");
  };

  const handleCustomerSelect = async (customerId) => {
    console.log("Staff click vào customer:", customerId);

    // Set flag để ngăn load more khi đang chuyển conversation
    isInitialScrollRef.current = true;

    setActiveCustomerId(customerId);

    // Chuyển sang chat view trên mobile
    if (isMobile) {
      setMobileView("chat");
    }

    // Load tin nhắn cho user này nếu chưa có
    const existingChat = customerChats.get(customerId);
    if (!existingChat || existingChat.messages.length === 0) {
      // Load tin nhắn VÀ đánh dấu đã đọc vì Staff đang mở conversation
      await loadUserMessages(customerId, true);
      // isInitialScrollRef đã được reset trong loadUserMessages
    } else {
      // Nếu đã có tin nhắn trong cache, đánh dấu các tin nhắn chưa đọc
      const unreadMessages = existingChat.messages.filter((msg) => {
        // Support cả 2 format: string và object
        const isUserMessage =
          msg.sender === "user" || msg.sender === "customer" || msg.sender?.type === "user";
        return !msg.isRead && isUserMessage;
      });

      // Chỉ xử lý nếu có tin nhắn chưa đọc
      if (unreadMessages.length > 0) {
        console.log(`Đánh dấu ${unreadMessages.length} tin nhắn đã đọc cho customer:`, customerId);

        // Lấy danh sách ID tin nhắn chưa đọc
        const unreadMessageIds = unreadMessages
          .map((msg) => msg.id)
          .filter((id) => id && !id.toString().startsWith("msg_"));

        if (unreadMessageIds.length > 0) {
          // Sử dụng batch API staff endpoint để đánh dấu tất cả cùng lúc (song song)
          const result = await chatApi.markMessagesAsReadBatchForStaff(unreadMessageIds);

          // Cập nhật flag isRead trong local state
          unreadMessages.forEach((msg) => {
            msg.isRead = true;
          });

          console.log(`Đã đánh dấu ${result.markedCount} tin nhắn`);

          // Cập nhật UI ngay lập tức
          if (onUnreadCountChange) {
            const currentTotal = conversations.reduce(
              (total, conv) => total + (conv.unreadCount || 0),
              0
            );
            const estimatedTotal = Math.max(0, currentTotal - result.markedCount);
            onUnreadCountChange(estimatedTotal);
          }

          // Re-fetch unread count từ API để đồng bộ chính xác
          try {
            const totalUnread = await chatApi.getStaffUnreadCount();
            if (onUnreadCountChange) {
              onUnreadCountChange(totalUnread);
            }
          } catch (error) {
            console.error("Lỗi khi re-fetch unread count:", error);
          }
        }
      }

      // Reset unread count trong customerChats
      setCustomerChats((prev) => {
        const newChats = new Map(prev);
        const chat = newChats.get(customerId);
        if (chat) {
          chat.unreadCount = 0;
        }
        newChats.set(customerId, chat);
        return newChats;
      });

      // Cập nhật conversation để reset unread count
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.userId === customerId) {
            return {
              ...conv,
              unreadCount: 0, // Staff đã xem và đánh dấu đã đọc = 0 badge
            };
          }
          return conv;
        });
        return updated;
      });

      // Scroll xuống cuối để xem tin nhắn mới nhất (khi đã có tin nhắn trong cache)
      setTimeout(() => {
        scrollToBottom();
        // Reset flag sau khi scroll xong
        setTimeout(() => {
          isInitialScrollRef.current = false;
        }, 300);
      }, 150);
    }
  };

  const getActiveChat = () => {
    return activeCustomerId ? customerChats.get(activeCustomerId) : null;
  };

  const getCustomerList = () => {
    // Ưu tiên hiển thị conversations từ API, fallback về customerChats
    if (conversations.length > 0) {
      return conversations.sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );
    }
    return Array.from(customerChats.values()).sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );
  };

  const getTotalUnreadCount = () => {
    // Tính từ conversations local state (bao gồm cả temporary và API data)
    const conversationUnread = conversations.reduce(
      (total, conv) => total + (conv.unreadCount || 0),
      0
    );

    // (để đảm bảo không bỏ sót unread count khi có delay trong sync)
    if (serverUnreadCount > 0 && serverUnreadCount >= conversationUnread) {
      return serverUnreadCount;
    }

    // Nếu có conversations với unread count, dùng giá trị đó
    if (conversations.length > 0 && conversationUnread > 0) {
      return conversationUnread;
    }

    // Fallback: server count nếu có (kể cả khi conversations chưa load)
    if (serverUnreadCount > 0) {
      return serverUnreadCount;
    }

    // Final fallback: tính từ customerChats
    const chatUnread = Array.from(customerChats.values()).reduce(
      (total, chat) => total + (chat.unreadCount || 0),
      0
    );
    return chatUnread;
  };

  if (!isOpen) return null;

  const activeChat = getActiveChat();
  const customerList = getCustomerList();
  const totalUnread = getTotalUnreadCount();

  if (isMinimized) {
    const totalUnread = getTotalUnreadCount();
    return (
      <div className={`floating-chat-button ${!isOpen ? "chat-button-exit" : ""}`}>
        <button onClick={onMinimize} className="chat-button" title="Mở rộng chat">
          <ChatBubbleLeftRightIcon className="w-8 h-8" />
          {totalUnread > 0 && <span className="unread-badge">{totalUnread}</span>}
        </button>
      </div>
    );
  }

  return (
    <div
      ref={chatPanelRef}
      className={`customer-chat-panel ${!isOpen ? "chat-panel-exit" : ""} ${
        isMobile ? "mobile-mode" : ""
      } ${isMobile && mobileView === "chat" ? "mobile-chat-active" : ""}`}>
      {/* Header */}
      <div className="customer-chat-header">
        <div className="header-left">
          {isMobile && mobileView === "chat" ? (
            <button className="mobile-back-btn" onClick={handleBackToList}>
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          ) : (
            <ChatBubbleLeftRightIcon className="w-7 h-7" />
          )}
          <div className="header-info">
            <span className="title">
              {isMobile && mobileView === "chat" && activeCustomerId
                ? (() => {
                    const conv = conversations.find((c) => c.userId === activeCustomerId);
                    return (
                      conv?.user?.name ||
                      conv?.customerName ||
                      activeChat?.user?.name ||
                      activeChat?.customerName ||
                      `Khách hàng ${activeCustomerId}`
                    );
                  })()
                : "Tin nhắn Khách hàng"}
            </span>
            <span className={`status ${isConnected ? "online" : "offline"}`}>
              {isConnected ? "Trực tuyến" : "Ngoại tuyến"}
            </span>
          </div>
        </div>

        <div className="header-actions">
          {isMobile ? (
            <button onClick={onMinimize} title="Đóng" className="mobile-close-btn">
              <XMarkIcon className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={onMinimize} title="Thu nhỏ">
              <MinusIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="customer-chat-body">
        {/* Customer List */}
        <div className="customer-list">
          <div className="customer-list-header">
            <h4>Khách hàng ({customerList.length})</h4>
            <button
              onClick={forceRefreshAll}
              disabled={loading}
              className="refresh-btn"
              title="Đồng bộ tất cả từ server">
              <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="customer-list-content">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>Đang tải...</span>
              </div>
            ) : customerList.length === 0 ? (
              <div className="no-customers">
                <UserIcon className="w-8 h-8" />
                <span>Chưa có tin nhắn nào</span>
              </div>
            ) : (
              customerList.map((item) => {
                // Xử lý data từ conversation hoặc customerChats
                const customerId = item.userId || item.customerId;
                // Lấy tên khách hàng - ưu tiên từ user object, fallback về các trường khác
                const customerName =
                  item.user?.name ||
                  item.customerName ||
                  item.userName ||
                  (customerId ? `Khách hàng ${customerId}` : "Khách hàng");
                const unreadCount = item.unreadCount || 0;
                const lastMessageTime = item.lastMessageTime;
                const lastMessage =
                  item.lastMessage?.content ||
                  item.messages?.[item.messages.length - 1]?.text ||
                  "Nhấn để xem tin nhắn";

                // Lấy avatar từ data - ưu tiên user.avatar, fallback các field khác
                const customerAvatar =
                  item.user?.avatarUrl || item.senderAvatar || item.avatar || null;

                return (
                  <div
                    key={`customer-${customerId}`}
                    className={`customer-item ${
                      String(activeCustomerId) === String(customerId) ? "active" : ""
                    }`}
                    onClick={() => handleCustomerSelect(customerId)}>
                    <div className="customer-avatar">
                      {customerAvatar ? (
                        <img
                          src={customerAvatar}
                          alt={customerName}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "block";
                          }}
                        />
                      ) : null}
                      <UserIcon
                        className="w-6 h-6"
                        style={{ display: customerAvatar ? "none" : "block" }}
                      />
                    </div>
                    <div className="customer-info">
                      <div className="customer-name">
                        {customerName}
                        {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
                      </div>
                      <div className="last-message">
                        {lastMessage.substring(0, 30)}
                        {lastMessage.length > 30 && "..."}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {activeCustomerId ? (
            <>
              {/* Messages */}
              <div
                className="messages-container"
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                onClick={handleMessagesContainerClick}>
                {loadingMessages ? (
                  <div className="loading-messages">
                    <div className="loading-spinner"></div>
                    <span>Đang tải tin nhắn...</span>
                  </div>
                ) : (
                  <div className="messages-content">
                    {/* Hiển thị loading khi đang load thêm tin nhắn cũ */}
                    {loadingMoreMessages && (
                      <div className="loading-more-messages">
                        <div className="loading-spinner-small"></div>
                        <span>Đang tải thêm...</span>
                      </div>
                    )}

                    {/* Hiển thị nút load thêm nếu còn tin nhắn cũ */}
                    {hasMoreMessages[activeCustomerId] && !loadingMoreMessages && (
                      <div className="load-more-container">
                        <button className="load-more-btn" onClick={loadMoreMessages}>
                          Tải tin nhắn cũ hơn
                        </button>
                      </div>
                    )}

                    {activeChat?.messages?.map((message) => (
                      <ChatMessageItem
                        key={message.id}
                        message={message}
                        onReply={handleReplyToMessage}
                        userType="staff" // Staff view - nhìn từ góc độ nhân viên
                        currentUser={staff}
                      />
                    )) || (
                      <div className="no-messages">
                        <ChatBubbleLeftRightIcon className="w-8 h-8" />
                        <span>Chưa có tin nhắn nào</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="chat-input">
                <ChatReplyInput
                  ref={inputRef}
                  input={input}
                  setInput={setInput}
                  onSend={sendMessage}
                  onFocus={handleInputFocus}
                  placeholder={
                    isReplyMode
                      ? "Nhập phản hồi..."
                      : isConnected
                      ? "Nhập tin nhắn..."
                      : "Đang kết nối..."
                  }
                  disabled={!isConnected || isSending}
                  isConnected={isConnected}
                  replyToMessage={replyToMessage}
                  onCancelReply={handleCancelReply}
                  maxLength={1000}
                  className="customer-chat-input"
                />

                {/* Thông báo xác nhận gửi tin nhắn - popup đơn giản */}
                {showConfirmation && (
                  <div className="staff-chat-confirmation">
                    <div className="confirmation-content">
                      <span className="confirmation-text">Tin nhắn đã được gửi</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-active-chat">
              <ChatBubbleLeftRightIcon className="w-12 h-12" />
              <p>Chọn một khách hàng từ danh sách để xem tin nhắn.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerChatPanel;
