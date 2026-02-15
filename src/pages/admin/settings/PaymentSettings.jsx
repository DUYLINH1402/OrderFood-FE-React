import React, { useState } from "react";
import { FiSave, FiDollarSign, FiCreditCard, FiPercent } from "react-icons/fi";

const PaymentSettings = () => {
  const [settings, setSettings] = useState({
    enableCOD: true,
    enableBankTransfer: true,
    enableMomo: false,
    enableVnpay: false,
    enableZalopay: false,
    bankName: "Vietcombank",
    bankAccount: "1234567890",
    bankOwner: "NGUYEN VAN A",
    momoPhone: "",
    vnpayMerchantId: "",
    vnpaySecretKey: "",
    minOrderAmount: 30000,
    freeShipThreshold: 200000,
    shippingFee: 15000,
    taxRate: 10,
    enableRewardPoints: true,
    pointsPerOrder: 10,
    pointsToVND: 1000,
  });

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // TODO: Gọi API lưu cài đặt thanh toán
    console.log("Lưu cài đặt thanh toán:", settings);
  };

  return (
    <div className="space-y-6">
      {/* Phương thức thanh toán */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiCreditCard className="text-orange-500" />
          Phương thức thanh toán
        </h3>
        <div className="text-sm space-y-4">
          {[
            {
              key: "enableCOD",
              label: "Thanh toán khi nhận hàng (COD)",
              desc: "Khách hàng thanh toán bằng tiền mặt khi nhận hàng",
            },
            {
              key: "enableBankTransfer",
              label: "Chuyển khoản ngân hàng",
              desc: "Khách hàng chuyển khoản trước khi giao hàng",
            },
            {
              key: "enableMomo",
              label: "Ví MoMo",
              desc: "Thanh toán qua ví điện tử MoMo",
            },
            {
              key: "enableVnpay",
              label: "VNPay",
              desc: "Thanh toán qua cổng VNPay",
            },
            {
              key: "enableZalopay",
              label: "ZaloPay",
              desc: "Thanh toán qua ví ZaloPay",
            },
          ].map((method) => (
            <div
              key={method.key}
              className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-800">{method.label}</p>
                <p className="text-sm text-gray-500">{method.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[method.key]}
                  onChange={(e) => handleChange(method.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Thông tin ngân hàng */}
      {settings.enableBankTransfer && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Thông tin tài khoản ngân hàng
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên ngân hàng</label>
              <input
                type="text"
                value={settings.bankName}
                onChange={(e) => handleChange("bankName", e.target.value)}
                className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
              <input
                type="text"
                value={settings.bankAccount}
                onChange={(e) => handleChange("bankAccount", e.target.value)}
                className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chủ tài khoản</label>
              <input
                type="text"
                value={settings.bankOwner}
                onChange={(e) => handleChange("bankOwner", e.target.value)}
                className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* Phí & Thuế */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiDollarSign className="text-orange-500" />
          Phí vận chuyển & Thuế
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đơn hàng tối thiểu (VND)
            </label>
            <input
              type="number"
              value={settings.minOrderAmount}
              onChange={(e) => handleChange("minOrderAmount", Number(e.target.value))}
              className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phí vận chuyển (VND)
            </label>
            <input
              type="number"
              value={settings.shippingFee}
              onChange={(e) => handleChange("shippingFee", Number(e.target.value))}
              className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Miễn phí ship từ (VND)
            </label>
            <input
              type="number"
              value={settings.freeShipThreshold}
              onChange={(e) => handleChange("freeShipThreshold", Number(e.target.value))}
              className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FiPercent className="w-3.5 h-3.5" /> Thuế suất (%)
            </label>
            <input
              type="number"
              value={settings.taxRate}
              onChange={(e) => handleChange("taxRate", Number(e.target.value))}
              className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Điểm thưởng */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Cài đặt điểm thưởng</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableRewardPoints}
              onChange={(e) => handleChange("enableRewardPoints", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>
        {settings.enableRewardPoints && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm tích lũy mỗi đơn hàng
              </label>
              <input
                type="number"
                value={settings.pointsPerOrder}
                onChange={(e) => handleChange("pointsPerOrder", Number(e.target.value))}
                className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">1 Điểm = ? VND</label>
              <input
                type="number"
                value={settings.pointsToVND}
                onChange={(e) => handleChange("pointsToVND", Number(e.target.value))}
                className="text-sm text-gray-500 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        )}
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

export default PaymentSettings;
