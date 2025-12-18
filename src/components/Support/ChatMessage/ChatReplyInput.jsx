import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
} from "react";
import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

/**
 * Component chung cho input chat với tính năng reply
 * Sử dụng cho cả Staff và Customer
 */
const ChatReplyInput = forwardRef(
  (
    {
      input,
      setInput,
      onSend,
      onKeyPress,
      onFocus,
      placeholder,
      disabled = false,
      isConnected = true,
      replyToMessage = null,
      onCancelReply = null,
      maxLength = 1000,
      showConnectionWarning = false,
      connectionWarningText = "",
      className = "",
    },
    ref
  ) => {
    const inputRef = useRef(null);
    const [isSending, setIsSending] = useState(false); // State để track và update UI

    // Expose input ref để parent có thể focus
    useImperativeHandle(
      ref,
      () => ({
        focus: () => inputRef.current?.focus(),
        blur: () => inputRef.current?.blur(),
        current: inputRef.current,
      }),
      []
    );

    // Auto focus khi component mount
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        autoResizeTextarea(inputRef.current);
      }
    }, []);

    // Auto resize khi input thay đổi
    useEffect(() => {
      if (inputRef.current) {
        // Nếu input empty, force reset height
        if (!input.trim()) {
          inputRef.current.style.height = "40px";
          inputRef.current.style.overflowY = "hidden";
        } else {
          autoResizeTextarea(inputRef.current);
        }
      }
    }, [input]);

    // Focus lại khi bắt đầu reply
    useEffect(() => {
      if (replyToMessage && inputRef.current) {
        inputRef.current.focus();
      }
    }, [replyToMessage]);

    // Force sync input value với textarea để đảm bảo clear hoàn toàn
    useEffect(() => {
      if (inputRef.current && inputRef.current.value !== input) {
        inputRef.current.value = input;
      }

      // Reset sending flag khi input được clear (tin nhắn đã gửi thành công)
      if (!input.trim() && isSending) {
        setIsSending(false);
      }
    }, [input, isSending]);

    const handleInputChange = (e) => {
      const textarea = e.target;
      setInput(textarea.value);
      autoResizeTextarea(textarea);
    };

    const autoResizeTextarea = (textarea) => {
      // Reset height để tính toán chính xác
      textarea.style.height = "auto";

      // Tính chiều cao cần thiết
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10);
      const maxHeight = lineHeight * 3; // Giới hạn 3 hàng

      // Set height, nhưng không vượt quá 3 hàng
      textarea.style.height = Math.min(scrollHeight, maxHeight) + "px";

      // Hiển thị scrollbar nếu vượt quá 3 hàng
      textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    };

    const handleSend = useCallback(() => {
      const trimmedInput = input.trim();
      if (!trimmedInput || !isConnected || disabled || isSending) {
        return;
      }

      // Set flag để ngăn gọi lại trong khi đang xử lý
      setIsSending(true);

      // Gọi onSend
      onSend(trimmedInput);

      // Reset flag sau một khoảng thời gian ngắn để cho phép gửi tin nhắn tiếp theo
      // HOẶC sẽ được reset sớm hơn khi input được clear trong useEffect
      setTimeout(() => {
        setIsSending(false);
      }, 1000); // Backup timeout để đảm bảo luôn được reset
    }, [input, isConnected, disabled, isSending, onSend]);

    const handleKeyDown = (e) => {
      // Hủy reply khi nhấn Escape
      if (e.key === "Escape" && replyToMessage && onCancelReply) {
        e.preventDefault();
        onCancelReply();
        return;
      }

      // Xử lý Enter để gửi tin nhắn
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        e.stopPropagation(); // Ngăn event bubbling
        handleSend();
        return;
      }

      // Gọi handler từ parent nếu có (cho các key khác)
      if (onKeyPress && e.key !== "Enter") {
        onKeyPress(e);
      }
    };

    return (
      <div className={`chat-reply-input ${className}`}>
        {/* Reply Preview */}
        {replyToMessage && (
          <div className="reply-preview">
            <div className="reply-preview-content">
              <div className="reply-info">
                <span className="reply-label">Đang phản hồi:</span>
              </div>
              <div className="reply-message">
                {(
                  replyToMessage.text ||
                  replyToMessage.content ||
                  replyToMessage.message ||
                  ""
                ).substring(0, 100)}
                {(replyToMessage.text || replyToMessage.content || replyToMessage.message || "")
                  .length > 100 && "..."}
              </div>
            </div>
            {onCancelReply && (
              <button
                onClick={onCancelReply}
                className="reply-cancel-btn"
                title="Hủy phản hồi (Esc)">
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Input Container */}
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            placeholder={placeholder}
            className="input-field auto-resize"
            rows={1}
            maxLength={maxLength}
            disabled={disabled || !isConnected || isSending}
            style={{
              resize: "none",
              overflowY: "hidden",
              minHeight: "40px",
              maxHeight: "120px", // ~3 hàng
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !isConnected || disabled || isSending}
            className="send-btn"
            title={replyToMessage ? "Gửi phản hồi" : "Gửi tin nhắn"}>
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Connection Warning */}
        {showConnectionWarning && (
          <div className="connection-warning">
            <span>{connectionWarningText}</span>
          </div>
        )}
      </div>
    );
  }
);

ChatReplyInput.displayName = "ChatReplyInput";

export default ChatReplyInput;
