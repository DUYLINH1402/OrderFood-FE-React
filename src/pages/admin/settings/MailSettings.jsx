import React, { useState } from "react";
import { FiSave, FiMail, FiSend, FiAlertCircle } from "react-icons/fi";

const MailSettings = () => {
  const [settings, setSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    smtpEncryption: "TLS",
    senderName: "Đông Xanh Restaurant",
    senderEmail: "noreply@dongxanh.vn",
    enableOrderConfirm: true,
    enableOrderStatus: true,
    enableWelcomeEmail: true,
    enablePromoEmail: false,
    enablePasswordReset: true,
  });

  const [testEmail, setTestEmail] = useState("");
  const [testSending, setTestSending] = useState(false);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // TODO: Gọi API lưu cài đặt mail
    console.log("Lưu cài đặt mail:", settings);
  };

  const handleTestEmail = () => {
    if (!testEmail) return;
    setTestSending(true);
    // TODO: Gọi API gửi email test
    console.log("Gửi email test đến:", testEmail);
    setTimeout(() => setTestSending(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Cấu hình SMTP */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiMail className="text-orange-500" />
          Cấu hình SMTP
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
            <input
              type="text"
              value={settings.smtpHost}
              onChange={(e) => handleChange("smtpHost", e.target.value)}
              className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="smtp.gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
            <input
              type="number"
              value={settings.smtpPort}
              onChange={(e) => handleChange("smtpPort", Number(e.target.value))}
              className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản SMTP</label>
            <input
              type="text"
              value={settings.smtpUser}
              onChange={(e) => handleChange("smtpUser", e.target.value)}
              className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="your-email@gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu SMTP</label>
            <input
              type="password"
              value={settings.smtpPassword}
              onChange={(e) => handleChange("smtpPassword", e.target.value)}
              className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="********"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã hóa</label>
            <select
              value={settings.smtpEncryption}
              onChange={(e) => handleChange("smtpEncryption", e.target.value)}
              className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors">
              <option value="TLS">TLS</option>
              <option value="SSL">SSL</option>
              <option value="NONE">Không mã hóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Người gửi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin người gửi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên người gửi</label>
            <input
              type="text"
              value={settings.senderName}
              onChange={(e) => handleChange("senderName", e.target.value)}
              className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email người gửi</label>
            <input
              type="email"
              value={settings.senderEmail}
              onChange={(e) => handleChange("senderEmail", e.target.value)}
              className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Email templates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mẫu email tự động</h3>
        <div className="text-sm space-y-4">
          {[
            {
              key: "enableOrderConfirm",
              label: "Xác nhận đơn hàng",
              desc: "Gửi email khi khách đặt đơn thành công",
            },
            {
              key: "enableOrderStatus",
              label: "Cập nhật trạng thái đơn",
              desc: "Thông báo khi trạng thái đơn hàng thay đổi",
            },
            {
              key: "enableWelcomeEmail",
              label: "Chào mừng thành viên mới",
              desc: "Gửi email khi khách hàng đăng ký tài khoản",
            },
            {
              key: "enablePromoEmail",
              label: "Email khuyến mãi",
              desc: "Gửi email chương trình khuyến mãi cho khách hàng",
            },
            {
              key: "enablePasswordReset",
              label: "Đặt lại mật khẩu",
              desc: "Gửi email khi khách yêu cầu khôi phục mật khẩu",
            },
          ].map((template) => (
            <div
              key={template.key}
              className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-800">{template.label}</p>
                <p className="text-sm text-gray-500">{template.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[template.key]}
                  onChange={(e) => handleChange(template.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Gửi email test */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiSend className="text-orange-500" />
          Gửi email kiểm tra
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <FiAlertCircle className="text-amber-500 w-6 h-6 flex-shrink-0" />
          <p className="text-sm text-gray-500">
            Gửi email test để kiểm tra cấu hình SMTP hoạt động chính xác
          </p>
        </div>
        <div className="flex gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Nhập email nhận test..."
            className="text-sm text-gray-500 flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          />
          <button
            onClick={handleTestEmail}
            disabled={testSending || !testEmail}
            className="text-sm flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            <FiSend className="w-6 h-6" />
            {testSending ? "Đang gửi..." : "Gửi test"}
          </button>
        </div>
      </div>

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

export default MailSettings;
