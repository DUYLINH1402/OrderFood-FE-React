import React from "react";

const WebSocketStatusIndicator = ({ connected, connecting, error, messageCount = 0 }) => {
  const getStatusText = () => {
    if (error) return "Lỗi kết nối";
    if (connected) return "Đã kết nối";
    if (connecting) return "Đang kết nối...";
    return "Chưa kết nối";
  };

  const getStatusIcon = () => {
    if (error) return "⚠️";
    if (connected) return "🟢";
    if (connecting) return "🟡";
    return "⚫";
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <span className="font-medium text-gray-700">
        {getStatusIcon()} {getStatusText()}
      </span>
      {connected && messageCount > 0 && (
        <span className="text-xs text-gray-500">({messageCount} tin nhắn)</span>
      )}
    </div>
  );
};

export default WebSocketStatusIndicator;
