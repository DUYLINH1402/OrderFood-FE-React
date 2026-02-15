import React, { useState } from "react";
import { FiSave, FiBell, FiSmartphone, FiVolume2 } from "react-icons/fi";

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    enablePushNotification: true,
    enableEmailNotification: true,
    enableSmsNotification: false,
    enableSoundAlert: true,
    soundVolume: 70,
    // Thông báo cho Admin
    adminNewOrder: true,
    adminOrderCancel: true,
    adminNewUser: true,
    adminNewReview: true,
    adminLowStock: false,
    adminDailyReport: true,
    // Thông báo cho Nhân viên
    staffNewOrder: true,
    staffOrderReady: true,
    staffCustomerMessage: true,
    // Thông báo cho Khách hàng
    customerOrderUpdate: true,
    customerPromotion: true,
    customerRewardPoints: true,
  });

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // TODO: Gọi API lưu cài đặt thông báo
    console.log("Lưu cài đặt thông báo:", settings);
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

  const NotificationRow = ({ label, desc, field }) => (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
      <div>
        <p className="font-medium text-gray-800">{label}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
      <ToggleSwitch checked={settings[field]} onChange={(val) => handleChange(field, val)} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Kênh thông báo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiBell className="text-orange-500" />
          Kênh thông báo
        </h3>
        <div className="text-sm space-y-4">
          <NotificationRow
            label="Push Notification"
            desc="Thông báo đẩy trên trình duyệt"
            field="enablePushNotification"
          />
          <NotificationRow
            label="Email"
            desc="Gửi thông báo qua email"
            field="enableEmailNotification"
          />
          <NotificationRow
            label="SMS"
            desc="Gửi thông báo qua tin nhắn SMS"
            field="enableSmsNotification"
          />
        </div>
      </div>

      {/* Âm thanh */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiVolume2 className="text-orange-500" />
          Âm thanh thông báo
        </h3>
        <div className="text-sm space-y-4">
          <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100">
            <div>
              <p className="font-medium text-gray-800">Bật âm thanh cảnh báo</p>
              <p className="text-gray-500">Phát âm thanh khi có thông báo mới</p>
            </div>
            <ToggleSwitch
              checked={settings.enableSoundAlert}
              onChange={(val) => handleChange("enableSoundAlert", val)}
            />
          </div>
          {settings.enableSoundAlert && (
            <div className="px-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Âm lượng: {settings.soundVolume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.soundVolume}
                onChange={(e) => handleChange("soundVolume", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Thông báo Admin */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiSmartphone className="text-orange-500" />
          Thông báo cho Admin
        </h3>
        <div className="text-sm space-y-4">
          <NotificationRow
            label="Đơn hàng mới"
            desc="Thông báo khi có đơn hàng mới"
            field="adminNewOrder"
          />
          <NotificationRow
            label="Hủy đơn hàng"
            desc="Thông báo khi khách hàng hủy đơn"
            field="adminOrderCancel"
          />
          <NotificationRow
            label="Thành viên mới"
            desc="Thông báo khi có người dùng đăng ký mới"
            field="adminNewUser"
          />
          <NotificationRow
            label="Đánh giá mới"
            desc="Thông báo khi có đánh giá/phản hồi mới"
            field="adminNewReview"
          />
          <NotificationRow
            label="Báo cáo hàng ngày"
            desc="Gửi báo cáo tổng kết cuối ngày"
            field="adminDailyReport"
          />
        </div>
      </div>

      {/* Thông báo Khách hàng */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông báo cho Khách hàng</h3>
        <div className="text-sm space-y-4">
          <NotificationRow
            label="Cập nhật đơn hàng"
            desc="Thông báo khi trạng thái đơn hàng thay đổi"
            field="customerOrderUpdate"
          />
          <NotificationRow
            label="Khuyến mãi"
            desc="Thông báo về các chương trình giảm giá"
            field="customerPromotion"
          />
          <NotificationRow
            label="Điểm thưởng"
            desc="Thông báo khi tích lũy hoặc sử dụng điểm thưởng"
            field="customerRewardPoints"
          />
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

export default NotificationSettings;
