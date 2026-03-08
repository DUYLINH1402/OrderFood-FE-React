import React from "react";
import { Modal } from "antd";

// Icon đồng hồ thông báo ngoài giờ
const ClockIcon = () => (
  <div className="relative">
    <div className="absolute inset-0 animate-ping rounded-full bg-orange-400 opacity-20"></div>
    <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
      <svg
        className="w-12 h-12 md:w-14 md:h-14 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    </div>
  </div>
);

/**
 * Modal thông báo ngoài giờ phục vụ
 * Hiển thị khi khách hàng cố gắng đặt hàng ngoài giờ hoạt động
 */
export default function ClosedHoursModal({ isOpen, onClose }) {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      closable={false}
      destroyOnClose>
      <div className="flex flex-col items-center text-center py-6 px-4">
        <ClockIcon />

        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mt-6 mb-3">
          Nhà hàng đã ngưng nhận đơn
        </h3>

        <p className="text-sm md:text-base text-gray-600 mb-2 leading-relaxed">
          Hiện tại đã ngoài giờ phục vụ, chúng tôi không thể xử lý đơn hàng lúc này.
        </p>

        <div className="bg-orange-50 border border-orange-200 rounded-lg px-5 py-3 mb-4 w-full">
          <p className="text-sm md:text-base font-semibold text-orange-700 mb-1">
            Giờ nhận đơn hàng
          </p>
          <p className="text-base md:text-lg font-bold text-orange-600">07:00 — 22:00 mỗi ngày</p>
        </div>

        <p className="text-sm md:text-base text-gray-500 mb-5 leading-relaxed">
          Quý khách vui lòng quay lại đặt hàng trong khung giờ phục vụ. Xin lỗi vì sự bất tiện này!
        </p>

        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-sm md:text-base font-semibold shadow-md transition-all duration-200"
          onClick={onClose}>
          Đã hiểu
        </button>
      </div>
    </Modal>
  );
}
