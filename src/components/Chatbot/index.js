// Main chatbot components
export { default as Chatbot } from "./Chatbot";
export { default as ChatbotFAB } from "./ChatbotFAB";
export { default as ChatbotDemo } from "./ChatbotDemo";

// Sub-components
export { default as MessageItem } from "./MessageItem";
export { default as TypingIndicator } from "./TypingIndicator";
export { default as QuickReplies } from "./QuickReplies";
export { default as ChatHistory } from "./ChatHistory";

// Redux slice and actions
export {
  // Actions
  openChatbot,
  closeChatbot,
  initializeSession,
  clearSession,
  sendChatMessage,
  loadChatHistory,
  addQuickReply,
  updateSettings,
  clearError,

  // Selectors
  selectChatbotState,
  selectMessages,
  selectIsOpen,
  selectIsLoading,
  selectSessionId,
  selectChatbotError,
  selectChatbotSettings,
} from "../../store/slices/chatbotSlice";

// Services
export {
  sendMessageToChatbot,
  getChatHistory,
  generateSessionId,
  getUserContext,
} from "../../services/service/chatbotService";
