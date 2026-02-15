import React, { useState } from "react";
import { FiSave, FiShield, FiLock, FiUserCheck, FiAlertTriangle } from "react-icons/fi";

const SecuritySettings = () => {
  const [settings, setSettings] = useState({
    // Mật khẩu
    minPasswordLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSpecialChar: false,
    passwordExpireDays: 90,
    // Đăng nhập
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    enableTwoFactor: false,
    sessionTimeout: 60,
    enableRememberMe: true,
    // Bảo mật API
    enableRateLimit: true,
    rateLimitPerMinute: 60,
    enableCors: true,
    allowedOrigins: "https://dongxanh.vn",
    // Logs
    enableAuditLog: true,
    logRetentionDays: 30,
    enableLoginLog: true,
  });

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // TODO: Gọi API lưu cài đặt bảo mật
    console.log("Lưu cài đặt bảo mật:", settings);
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Chính sách mật khẩu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiLock className="text-orange-500" />
          Chính sách mật khẩu
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Độ dài tối thiểu</label>
            <input
              type="number"
              value={settings.minPasswordLength}
              onChange={(e) => handleChange("minPasswordLength", Number(e.target.value))}
              min={6}
              max={32}
              className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hết hạn sau (ngày)
            </label>
            <input
              type="number"
              value={settings.passwordExpireDays}
              onChange={(e) => handleChange("passwordExpireDays", Number(e.target.value))}
              min={0}
              className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
            <p className="text-sx text-gray-400 mt-1">Đặt 0 để không bắt buộc đổi mật khẩu</p>
          </div>
        </div>
        <div className="text-sm space-y-3">
          {[
            {
              key: "requireUppercase",
              label: "Yêu cầu chữ hoa",
              desc: "Mật khẩu phải có ít nhất 1 ký tự viết hoa",
            },
            {
              key: "requireNumber",
              label: "Yêu cầu chữ số",
              desc: "Mật khẩu phải có ít nhất 1 chữ số",
            },
            {
              key: "requireSpecialChar",
              label: "Yêu cầu ký tự đặc biệt",
              desc: "Mật khẩu phải chứa ký tự đặc biệt (!@#$...)",
            },
          ].map((rule) => (
            <div
              key={rule.key}
              className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-800">{rule.label}</p>
                <p className="text-sm text-gray-500">{rule.desc}</p>
              </div>
              <ToggleSwitch
                checked={settings[rule.key]}
                onChange={(val) => handleChange(rule.key, val)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Đăng nhập & Phiên */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiUserCheck className="text-orange-500" />
          Đăng nhập & Phiên làm việc
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lần đăng nhập sai tối đa
            </label>
            <input
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) => handleChange("maxLoginAttempts", Number(e.target.value))}
              min={3}
              max={10}
              className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thời gian khóa tài khoản (phút)
            </label>
            <input
              type="number"
              value={settings.lockoutDuration}
              onChange={(e) => handleChange("lockoutDuration", Number(e.target.value))}
              min={1}
              className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hết hạn phiên sau (phút)
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleChange("sessionTimeout", Number(e.target.value))}
              min={5}
              className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
        </div>
        <div className="text-sm space-y-3">
          <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-gray-800">Xác thực hai yếu tố (2FA)</p>
              <p className="text-sm text-gray-500">Bắt buộc sử dụng OTP khi đăng nhập</p>
            </div>
            <ToggleSwitch
              checked={settings.enableTwoFactor}
              onChange={(val) => handleChange("enableTwoFactor", val)}
            />
          </div>
          <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-gray-800">Ghi nhớ đăng nhập</p>
              <p className="text-sm text-gray-500">Cho phép người dùng chọn "Nhớ mật khẩu"</p>
            </div>
            <ToggleSwitch
              checked={settings.enableRememberMe}
              onChange={(val) => handleChange("enableRememberMe", val)}
            />
          </div>
        </div>
      </div>

      {/* Bảo mật API */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiShield className="text-orange-500" />
          Bảo mật API
        </h3>
        <div className="text-sm space-y-4">
          <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-gray-800">Giới hạn request</p>
              <p className="text-sm text-gray-500">Giới hạn số lượng request mỗi phút</p>
            </div>
            <ToggleSwitch
              checked={settings.enableRateLimit}
              onChange={(val) => handleChange("enableRateLimit", val)}
            />
          </div>
          {settings.enableRateLimit && (
            <div className="px-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số request tối đa / phút
              </label>
              <input
                type="number"
                value={settings.rateLimitPerMinute}
                onChange={(e) => handleChange("rateLimitPerMinute", Number(e.target.value))}
                min={10}
                className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
          )}
          <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-gray-800">CORS</p>
              <p className="text-sm text-gray-500">Bật Cross-Origin Resource Sharing</p>
            </div>
            <ToggleSwitch
              checked={settings.enableCors}
              onChange={(val) => handleChange("enableCors", val)}
            />
          </div>
          {settings.enableCors && (
            <div className="px-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domain được phép
              </label>
              <input
                type="text"
                value={settings.allowedOrigins}
                onChange={(e) => handleChange("allowedOrigins", e.target.value)}
                className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="https://example.com"
              />
              <p className="text-sx text-gray-400 mt-1">Nhiều domain cách nhau bằng dấu phẩy</p>
            </div>
          )}
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiAlertTriangle className="text-orange-500" />
          Nhật ký hệ thống
        </h3>
        <div className="text-sm space-y-4">
          <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-gray-800">Nhật ký hoạt động</p>
              <p className="text-gray-500">Ghi lại tất cả thao tác quản trị</p>
            </div>
            <ToggleSwitch
              checked={settings.enableAuditLog}
              onChange={(val) => handleChange("enableAuditLog", val)}
            />
          </div>
          <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-gray-800">Nhật ký đăng nhập</p>
              <p className="text-sm text-gray-500">Ghi lại lịch sử đăng nhập của người dùng</p>
            </div>
            <ToggleSwitch
              checked={settings.enableLoginLog}
              onChange={(val) => handleChange("enableLoginLog", val)}
            />
          </div>
          {settings.enableAuditLog && (
            <div className="px-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lưu log trong (ngày)
              </label>
              <input
                type="number"
                value={settings.logRetentionDays}
                onChange={(e) => handleChange("logRetentionDays", Number(e.target.value))}
                min={7}
                className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
          )}
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

export default SecuritySettings;
