import React, { useEffect, useState } from "react";
import { useUserWebSocket } from "../services/websocket/useUserWebSocket";
import { useSelector } from "react-redux";

export const MyComponent = () => {
  const {
    connected,
    connectionStatus,
    initialize,
    addMessageHandler,
    ping,
    chatToStaff,
    disconnect,
    reconnect,
  } = useUserWebSocket();

  const [logs, setLogs] = useState([]);
  // Lấy userId từ Redux hoặc localStorage
  const reduxUserId = useSelector((state) => state.auth?.user?.id || state.auth?.user?.userId);
  const localUserId = localStorage.getItem("userId");
  const [testUserId, setTestUserId] = useState(reduxUserId || localUserId || "");
  const [chatMessage, setChatMessage] = useState("Xin chào staff!");
  const [isInitialized, setIsInitialized] = useState(false);

  // Hàm thêm log
  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-14), { timestamp, message, type }]);
  };

  // Khởi tạo WebSocket
  const handleInitialize = async () => {
    if (isInitialized) {
      addLog("WebSocket đã được khởi tạo rồi!", "warning");
      return;
    }

    // Lấy userId mới nhất từ Redux hoặc localStorage
    const currentUserId = reduxUserId || localStorage.getItem("userId") || testUserId;
    if (!currentUserId) {
      addLog("❌ Không tìm thấy userId. Vui lòng đăng nhập!", "error");
      return;
    }

    try {
      addLog(`Đang khởi tạo WebSocket cho user: ${currentUserId}`, "info");
      await initialize(currentUserId, "fake-jwt-token");
      setTestUserId(currentUserId);
      setIsInitialized(true);
      addLog("✅ Khởi tạo WebSocket thành công!", "success");
    } catch (error) {
      addLog(`❌ Lỗi khởi tạo: ${error.message}`, "error");
    }
  };

  // Đăng ký các event handlers
  useEffect(() => {
    if (!connected) return;

    const unsubscribers = [];

    // Handler cho welcome message từ /user/{userId}/queue/order-updates khi register
    const unsubWelcome = addMessageHandler("orderUpdate", (data) => {
      console.log("📋 Nhận message từ /user/{userId}/queue/order-updates:", data);

      if (data.type === "WELCOME") {
        addLog(`🎉 Welcome: ${data.message}`, "success");
        alert(`Chào mừng! ${data.message}`);
      } else if (data.type === "ORDER_STATUS_UPDATE") {
        addLog(`📋 Order Update: ${data.orderId} - ${data.status} - ${data.message}`, "info");
        alert(`Cập nhật đơn hàng ${data.orderId}: ${data.message}\nTrạng thái: ${data.status}`);
      } else {
        addLog(`📋 Order Update: ${JSON.stringify(data)}`, "info");
      }
    });
    unsubscribers.push(unsubWelcome);

    // Handler cho staff chat từ /topic/staff-chat (nếu user có subscribe)
    const unsubStaffChat = addMessageHandler("staffChat", (data) => {
      console.log("💬 Nhận chat từ staff:", data);
      addLog(`💬 Staff Chat: ${data}`, "info");
    });
    unsubscribers.push(unsubStaffChat);

    // Handler cho pong từ /topic/user-pong
    const unsubPong = addMessageHandler("pong", (data) => {
      console.log("🏓 Nhận pong từ /topic/user-pong:", data);
      addLog(`🏓 Pong: ${data}`, "success");
    });
    unsubscribers.push(unsubPong);

    // Handler cho broadcast notifications từ /topic/user-notifications
    const unsubNotification = addMessageHandler("notification", (data) => {
      console.log("🔔 Nhận broadcast notification:", data);
      addLog(`🔔 Broadcast: ${JSON.stringify(data)}`, "info");
    });
    unsubscribers.push(unsubNotification);

    // Cleanup khi component unmount hoặc connection thay đổi
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [connected, addMessageHandler]);

  // Test ping - gửi đến /app/user/ping
  const handlePing = () => {
    const success = ping();
    if (success) {
      addLog("🏓 Đã gửi ping đến /app/user/ping", "info");
    } else {
      addLog("❌ Gửi ping thất bại", "error");
    }
  };

  // Test chat to staff - gửi đến /app/user/chat-to-staff
  const handleChatToStaff = () => {
    const success = chatToStaff(chatMessage);
    if (success) {
      addLog(`💬 Đã gửi chat đến /app/user/chat-to-staff: "${chatMessage}"`, "info");
    } else {
      addLog("❌ Gửi chat thất bại", "error");
    }
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Test tình huống giả lập khi staff thay đổi trạng thái đơn hàng
  const simulateOrderStatusChange = () => {
    addLog("🎭 Mô phỏng: Staff đang thay đổi trạng thái đơn hàng...", "info");
    addLog("📋 Kênh /user/{userId}/queue/order-updates sẽ nhận message khi có thay đổi", "info");
    addLog("⏳ Chờ staff thay đổi trạng thái đơn hàng trong admin panel", "warning");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl text-center font-bold mb-6">
        <span className={connected ? "text-green-600" : "text-red-600"}>User WebSocket Test</span>
      </h1>

      {/* Connection Status */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Connection Status</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Connected:</strong>
            <span className={connected ? "text-green-600 ml-2" : "text-red-600 ml-2"}>
              {connected ? "✅ Đã kết nối" : "❌ Chưa kết nối"}
            </span>
          </div>
          <div>
            <strong>Connecting:</strong>
            <span className="ml-2">
              {connectionStatus.isConnecting ? "🔄 Đang kết nối..." : "⏹️ Không"}
            </span>
          </div>
          <div>
            <strong>Reconnect Attempts:</strong>
            <span className="ml-2">{connectionStatus.reconnectAttempts}</span>
          </div>
          <div>
            <strong>Last Error:</strong>
            <span className="ml-2 text-red-600">{connectionStatus.lastError || "Không có"}</span>
          </div>
        </div>
      </div>

      {/* Available WebSocket Channels */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3 text-blue-800">📡 Các kênh WebSocket có sẵn</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <span className="w-4 h-4 bg-green-400 rounded-full mr-3"></span>
            <code className="bg-blue-100 px-2 py-1 rounded">
              /user/{testUserId}/queue/order-updates
            </code>
            <span className="ml-2 text-gray-600">- Nhận thông báo cập nhật đơn hàng</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-yellow-400 rounded-full mr-3"></span>
            <code className="bg-blue-100 px-2 py-1 rounded">/topic/user-pong</code>
            <span className="ml-2 text-gray-600">- Nhận pong response</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-purple-400 rounded-full mr-3"></span>
            <code className="bg-blue-100 px-2 py-1 rounded">/topic/staff-chat</code>
            <span className="ml-2 text-gray-600">- Nhận tin nhắn từ staff</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-red-400 rounded-full mr-3"></span>
            <code className="bg-blue-100 px-2 py-1 rounded">/topic/user-notifications</code>
            <span className="ml-2 text-gray-600">- Nhận thông báo broadcast</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">Controls</h2>

        {/* User ID Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">User ID:</label>
          <input
            type="text"
            value={testUserId}
            onChange={(e) => setTestUserId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full max-w-xs"
            placeholder="User ID sẽ tự động lấy từ Redux hoặc localStorage nếu đã đăng nhập"
            disabled={!!reduxUserId || !!localUserId}
          />
          {(!testUserId || testUserId === "") && (
            <div className="text-red-500 text-xs mt-1">Vui lòng đăng nhập để lấy userId!</div>
          )}
        </div>

        {/* Connection Buttons */}
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={handleInitialize}
            disabled={isInitialized}
            className={`px-4 py-2 rounded ${
              isInitialized
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}>
            🚀 Initialize WebSocket
          </button>

          <button
            onClick={reconnect}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded">
            🔄 Reconnect
          </button>

          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded">
            🔌 Disconnect
          </button>
        </div>

        {/* Test Actions */}
        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold mb-3 text-green-800">🧪 Test Actions</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ping Test */}
            <div className="border border-green-200 p-3 rounded">
              <h4 className="font-medium mb-2">🏓 Test Ping/Pong</h4>
              <p className="text-sm text-gray-600 mb-3">
                Gửi ping đến <code>/app/user/ping</code> và nhận pong từ{" "}
                <code>/topic/user-pong</code>
              </p>
              <button
                onClick={handlePing}
                disabled={!connected}
                className={`w-full px-4 py-2 rounded ${
                  !connected
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}>
                🏓 Send Ping
              </button>
            </div>

            {/* Chat Test */}
            <div className="border border-green-200 p-3 rounded">
              <h4 className="font-medium mb-2">💬 Test Chat to Staff</h4>
              <p className="text-sm text-gray-600 mb-2">
                Gửi tin nhắn đến <code>/app/user/chat-to-staff</code>
              </p>
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-2"
                placeholder="Tin nhắn gửi staff"
              />
              <button
                onClick={handleChatToStaff}
                disabled={!connected}
                className={`w-full px-4 py-2 rounded ${
                  !connected
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-500 hover:bg-indigo-600 text-white"
                }`}>
                💬 Send to Staff
              </button>
            </div>
          </div>
        </div>

        {/* Order Updates Simulation */}
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-orange-800">📋 Test Order Updates</h3>
          <p className="text-sm text-gray-600 mb-3">
            Kênh <code>/user/{testUserId}/queue/order-updates</code> sẽ nhận message khi:
            <br />• User register (nhận welcome message)
            <br />• Staff thay đổi trạng thái đơn hàng từ admin panel
          </p>
          <button
            onClick={simulateOrderStatusChange}
            disabled={!connected}
            className={`px-4 py-2 rounded ${
              !connected
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}>
            🎭 Simulate Order Status Change
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Event Logs</h2>
          <button
            onClick={clearLogs}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">
            Clear Logs
          </button>
        </div>

        <div className="h-80 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-yellow-400">[{log.timestamp}]</span>{" "}
                <span
                  className={
                    log.type === "error"
                      ? "text-red-400"
                      : log.type === "success"
                      ? "text-green-400"
                      : log.type === "warning"
                      ? "text-yellow-400"
                      : "text-white"
                  }>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
        <h3 className="font-semibold text-blue-800">🎯 Hướng dẫn test:</h3>
        <ol className="mt-2 text-blue-700 text-sm space-y-1">
          <li>
            1. <strong>Khởi tạo:</strong> Nhập User ID và click "Initialize WebSocket"
          </li>
          <li>
            2. <strong>Kiểm tra kết nối:</strong> Đợi kết nối thành công (màu xanh)
          </li>
          <li>
            3. <strong>Test Ping:</strong> Click "Send Ping" để test kênh ping/pong
          </li>
          <li>
            4. <strong>Test Chat:</strong> Gửi tin nhắn đến staff để test chat
          </li>
          <li>
            5. <strong>Test Order Updates:</strong> Kênh này sẽ tự động nhận message khi:
          </li>
          <li className="ml-4">• Vừa register (nhận welcome message)</li>
          <li className="ml-4">• Staff thay đổi trạng thái đơn hàng trong admin panel</li>
          <li>
            6. <strong>Xem logs:</strong> Theo dõi logs để kiểm tra các message nhận được
          </li>
        </ol>
      </div>
    </div>
  );
};
