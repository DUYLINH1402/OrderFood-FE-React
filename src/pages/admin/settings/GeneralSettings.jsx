import React, { useState } from "react";
import { FiSave, FiGlobe, FiClock, FiMapPin, FiPhone } from "react-icons/fi";

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    restaurantName: "Đông Xanh Restaurant",
    phone: "0123 456 789",
    email: "contact@dongxanh.vn",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    openTime: "07:00",
    closeTime: "22:00",
    timezone: "Asia/Ho_Chi_Minh",
    language: "vi",
    currency: "VND",
    maintenanceMode: false,
  });

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // TODO: Gọi API lưu cài đặt chung
    console.log("Lưu cài đặt chung:", settings);
  };

  return (
    <div className="space-y-6">
      {/* Thông tin nhà hàng */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiGlobe className="text-orange-500" />
          Thông tin nhà hàng
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Tên nhà hàng</label>
            <input
              type="text"
              value={settings.restaurantName}
              onChange={(e) => handleChange("restaurantName", e.target.value)}
              className="text-sm w-full px-4 py-2.5 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1">
                <FiPhone className="w-5 h-5" /> Số điện thoại
              </span>
            </label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="text-sm w-full px-4 py-2.5 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Email liên hệ</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="text-sm w-full px-4 py-2.5 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1">
                <FiMapPin className="w-5 h-5" /> Địa chỉ
              </span>
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="text-sm w-full px-4 py-2.5 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Thời gian hoạt động */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiClock className="text-orange-500" />
          Thời gian hoạt động
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Giờ mở cửa</label>
            <input
              type="time"
              value={settings.openTime}
              onChange={(e) => handleChange("openTime", e.target.value)}
              className="text-sm w-full px-4 py-2.5 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Giờ đóng cửa</label>
            <input
              type="time"
              value={settings.closeTime}
              onChange={(e) => handleChange("closeTime", e.target.value)}
              className="text-sm w-full px-4 py-2.5 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Múi giờ</label>
            <select
              value={settings.timezone}
              onChange={(e) => handleChange("timezone", e.target.value)}
              className="text-sm w-full px-4 py-2.5 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors">
              <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
              <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
              <option value="Asia/Singapore">Singapore (GMT+8)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ngôn ngữ & Tiền tệ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ngôn ngữ & Tiền tệ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              Ngôn ngữ mặc định
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleChange("language", e.target.value)}
              className="text-sm w-full px-4 py-2.5 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors">
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Đơn vị tiền tệ</label>
            <select
              value={settings.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              className="text-sm w-full px-4 py-2.5 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors">
              <option value="VND">VND - Việt Nam Đồng</option>
              <option value="USD">USD - US Dollar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chế độ bảo trì */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Chế độ bảo trì</h3>
            <p className="text-base text-gray-500 mt-1">
              Khi bật, khách hàng sẽ không thể truy cập website
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
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

export default GeneralSettings;
