import React, { useState } from "react";
import { FiSave, FiMessageSquare, FiToggleLeft, FiClock, FiEdit3 } from "react-icons/fi";

const ChatbotSettings = () => {
  const [settings, setSettings] = useState({
    enableChatbot: true,
    welcomeMessage: "Xin chào! Tôi là trợ lý ảo của Đông Xanh. Tôi có thể giúp gì cho bạn?",
    offlineMessage:
      "Xin lỗi, hiện tại chúng tôi không trực tuyến. Vui lòng để lại tin nhắn, chúng tôi sẽ phản hồi sớm nhất.",
    autoReplyDelay: 1,
    maxSessionTimeout: 30,
    enableAutoSuggestions: true,
    enableFileUpload: false,
    enableEmoji: true,
    chatPosition: "bottom-right",
    primaryColor: "#f97316",
    enableNotificationSound: true,
    enableTypingIndicator: true,
    quickReplies: ["Xem thực đơn", "Theo dõi đơn hàng", "Liên hệ nhân viên", "Khuyến mãi hiện tại"],
  });

  const [newQuickReply, setNewQuickReply] = useState("");

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const addQuickReply = () => {
    if (newQuickReply.trim()) {
      setSettings((prev) => ({
        ...prev,
        quickReplies: [...prev.quickReplies, newQuickReply.trim()],
      }));
      setNewQuickReply("");
    }
  };

  const removeQuickReply = (index) => {
    setSettings((prev) => ({
      ...prev,
      quickReplies: prev.quickReplies.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    // TODO: Gọi API lưu cài đặt chatbot
    console.log("Lưu cài đặt chatbot:", settings);
  };

  return (
    <div className="space-y-6">
      {/* Bật/Tắt chatbot */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <FiMessageSquare className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Chatbot trợ lý ảo</h3>
              <p className="text-sm text-gray-500">Bật/tắt chatbot trên website</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableChatbot}
              onChange={(e) => handleChange("enableChatbot", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>
      </div>

      {settings.enableChatbot && (
        <>
          {/* Tin nhắn mẫu */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiEdit3 className="text-orange-500" />
              Tin nhắn mẫu
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tin nhắn chào mừng
                </label>
                <textarea
                  value={settings.welcomeMessage}
                  onChange={(e) => handleChange("welcomeMessage", e.target.value)}
                  rows={3}
                  className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tin nhắn ngoài giờ làm việc
                </label>
                <textarea
                  value={settings.offlineMessage}
                  onChange={(e) => handleChange("offlineMessage", e.target.value)}
                  rows={3}
                  className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Cài đặt thời gian */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiClock className="text-orange-500" />
              Thời gian & Hiệu suất
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Độ trễ phản hồi tự động (giây)
                </label>
                <input
                  type="number"
                  value={settings.autoReplyDelay}
                  onChange={(e) => handleChange("autoReplyDelay", Number(e.target.value))}
                  min={0}
                  max={10}
                  className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeout phiên chat (phút)
                </label>
                <input
                  type="number"
                  value={settings.maxSessionTimeout}
                  onChange={(e) => handleChange("maxSessionTimeout", Number(e.target.value))}
                  min={5}
                  max={120}
                  className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Tính năng */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiToggleLeft className="text-orange-500" />
              Tính năng chatbot
            </h3>
            <div className="text-sm space-y-4">
              {[
                {
                  key: "enableAutoSuggestions",
                  label: "Gợi ý tự động",
                  desc: "Hiển thị gợi ý câu hỏi phổ biến",
                },
                {
                  key: "enableFileUpload",
                  label: "Upload file",
                  desc: "Cho phép khách gửi hình ảnh/file trong chat",
                },
                {
                  key: "enableEmoji",
                  label: "Biểu tượng cảm xúc",
                  desc: "Cho phép sử dụng emoji trong chat",
                },
                {
                  key: "enableNotificationSound",
                  label: "Âm thanh thông báo",
                  desc: "Phát âm thanh khi có tin nhắn mới",
                },
                {
                  key: "enableTypingIndicator",
                  label: "Hiệu ứng đang gõ",
                  desc: "Hiển thị trạng thái đang gõ khi bot phản hồi",
                },
              ].map((feature) => (
                <div
                  key={feature.key}
                  className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-800">{feature.label}</p>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[feature.key]}
                      onChange={(e) => handleChange(feature.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Giao diện */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Giao diện chatbot</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vị trí hiển thị
                </label>
                <select
                  value={settings.chatPosition}
                  onChange={(e) => handleChange("chatPosition", e.target.value)}
                  className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors">
                  <option value="bottom-right">Dưới cùng - Bên phải</option>
                  <option value="bottom-left">Dưới cùng - Bên trái</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Màu chủ đạo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Replies */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Câu trả lời nhanh</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {settings.quickReplies.map((reply, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
                  {reply}
                  <button
                    onClick={() => removeQuickReply(index)}
                    className="hover:text-orange-900 transition-colors">
                    x
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={newQuickReply}
                onChange={(e) => setNewQuickReply(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addQuickReply()}
                placeholder="Thêm câu trả lời nhanh..."
                className="text-sm text-gray-500 flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
              <button
                onClick={addQuickReply}
                disabled={!newQuickReply.trim()}
                className="text-sm px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                Thêm
              </button>
            </div>
          </div>
        </>
      )}

      {/* Nút lưu */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="text-sm flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-sm">
          <FiSave className="w-6 h-6" />
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

export default ChatbotSettings;
