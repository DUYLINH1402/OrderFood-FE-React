import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  sendMessageToChatbot,
  generateSessionId,
  getUserContext,
} from "../../services/service/chatbotService";

// Async thunks

/**
 * Gửi tin nhắn tới chatbot
 */
export const sendChatMessage = createAsyncThunk(
  "chatbot/sendMessage",
  async ({ message, sessionId }, { rejectWithValue }) => {
    try {
      const chatData = {
        message: message.trim(),
        sessionId,
        userId: null, // Sẽ được lấy từ token ở backend
        userContext: getUserContext(),
      };

      const response = await sendMessageToChatbot(chatData);

      if (!response.success) {
        return rejectWithValue(response.message || "Không thể gửi tin nhắn");
      }

      return {
        userMessage: {
          id: `user_${Date.now()}`,
          text: message,
          sender: "user",
          timestamp: new Date().toISOString(),
        },
        botMessage: {
          id: response.data.messageId || `bot_${Date.now()}`,
          text: response.data.message || response.data.response,
          sender: "bot",
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi không xác định");
    }
  }
);

// Initial state
const initialState = {
  // Chat state
  messages: [],
  sessionId: null,

  // Loading states
  isLoading: false,

  // Error states
  error: null,

  // UI states
  isOpen: false,
  unreadCount: 0,

  // Chat settings
  settings: {
    enableSound: true,
    enableNotifications: true,
    autoScroll: true,
  },
};

// Slice
const chatbotSlice = createSlice({
  name: "chatbot",
  initialState,
  reducers: {
    // UI Actions
    openChatbot: (state) => {
      state.isOpen = true;
      state.unreadCount = 0;
    },

    closeChatbot: (state) => {
      state.isOpen = false;
    },

    // Session management
    initializeSession: (state, action) => {
      const userId = action.payload?.userId;
      state.sessionId = generateSessionId(userId);
      state.messages = [
        {
          id: "welcome",
          text: "Xin chào! Tôi là FooBot trợ lý ảo của Đồng Xanh. Bạn cần hỗ trợ gì nhỉ?",
          sender: "bot",
          timestamp: new Date().toISOString(),
          isWelcome: true,
        },
      ];
      state.error = null;
    },

    clearSession: (state) => {
      state.sessionId = null;
      state.messages = [];
      state.error = null;
      state.unreadCount = 0;
    },

    // Message actions
    addUserMessage: (state, action) => {
      const { text } = action.payload;
      const userMessage = {
        id: `user_${Date.now()}`,
        text,
        sender: "user",
        timestamp: new Date().toISOString(),
      };
      state.messages.push(userMessage);
    },

    addLoadingMessage: (state) => {
      const loadingMessage = {
        id: `loading_${Date.now()}`,
        text: "",
        sender: "bot",
        timestamp: new Date().toISOString(),
        isLoading: true,
      };
      state.messages.push(loadingMessage);
    },

    replaceLoadingMessage: (state, action) => {
      const { text } = action.payload;
      const loadingIndex = state.messages.findIndex((msg) => msg.isLoading);
      if (loadingIndex !== -1) {
        state.messages[loadingIndex] = {
          id: `bot_${Date.now()}`,
          text,
          sender: "bot",
          timestamp: new Date().toISOString(),
          isLoading: false,
        };
      }
    },

    removeLoadingMessage: (state) => {
      state.messages = state.messages.filter((msg) => !msg.isLoading);
    },

    // Quick replies
    addQuickReply: (state, action) => {
      const { text } = action.payload;
      const userMessage = {
        id: `user_${Date.now()}`,
        text,
        sender: "user",
        timestamp: new Date().toISOString(),
        isQuickReply: true,
      };
      state.messages.push(userMessage);
    },

    // Settings
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // Send message cases
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isLoading = false;

        // Replace loading message with bot response
        const loadingIndex = state.messages.findIndex((msg) => msg.isLoading);
        if (loadingIndex !== -1) {
          state.messages[loadingIndex] = action.payload.botMessage;
        } else {
          // Fallback: add bot message if no loading message found
          state.messages.push(action.payload.botMessage);
        }

        // Increment unread count if chatbot is closed
        if (!state.isOpen) {
          state.unreadCount += 1;
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;

        // Replace loading message with error message
        const loadingIndex = state.messages.findIndex((msg) => msg.isLoading);
        if (loadingIndex !== -1) {
          state.messages[loadingIndex] = {
            id: `error_${Date.now()}`,
            text: "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
            sender: "bot",
            timestamp: new Date().toISOString(),
            isError: true,
          };
        } else {
          // Fallback: add error message if no loading message found
          state.messages.push({
            id: `error_${Date.now()}`,
            text: "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
            sender: "bot",
            timestamp: new Date().toISOString(),
            isError: true,
          });
        }
      });
  },
});

// Export actions
export const {
  openChatbot,
  closeChatbot,
  initializeSession,
  clearSession,
  addUserMessage,
  addLoadingMessage,
  replaceLoadingMessage,
  removeLoadingMessage,
  addQuickReply,
  updateSettings,
  clearError,
} = chatbotSlice.actions;

// Selectors
export const selectChatbotState = (state) => state.chatbot;
export const selectMessages = (state) => state.chatbot.messages;
export const selectIsOpen = (state) => state.chatbot.isOpen;
export const selectIsLoading = (state) => state.chatbot.isLoading;
export const selectSessionId = (state) => state.chatbot.sessionId;
export const selectUnreadCount = (state) => state.chatbot.unreadCount;
export const selectChatbotError = (state) => state.chatbot.error;
export const selectChatbotSettings = (state) => state.chatbot.settings;

export default chatbotSlice.reducer;
