import React from "react";
import { useParams, Navigate } from "react-router-dom";
import {
  FiSettings,
  FiCreditCard,
  FiMail,
  FiMessageSquare,
  FiBell,
  FiShield,
  FiTool,
} from "react-icons/fi";
import GeneralSettings from "./settings/GeneralSettings";
import PaymentSettings from "./settings/PaymentSettings";
import MailSettings from "./settings/MailSettings";
import ChatbotSettings from "./settings/ChatbotSettings";
import NotificationSettings from "./settings/NotificationSettings";
import SecuritySettings from "./settings/SecuritySettings";

// Mapping tab key -> component và thông tin hiển thị
const SETTING_TABS = {
  general: {
    label: "Cài đặt chung",
    icon: FiSettings,
    component: GeneralSettings,
    description: "Thông tin nhà hàng, giờ mở cửa, ngôn ngữ, tiền tệ",
  },
  payment: {
    label: "Thanh toán",
    icon: FiCreditCard,
    component: PaymentSettings,
    description: "Phương thức thanh toán, phí vận chuyển, điểm thưởng",
  },
  mail: {
    label: "Email",
    icon: FiMail,
    component: MailSettings,
    description: "Cấu hình SMTP, mẫu email tự động",
  },
  chatbot: {
    label: "Chatbot",
    icon: FiMessageSquare,
    component: ChatbotSettings,
    description: "Trợ lý ảo, tin nhắn tự động, câu trả lời nhanh",
  },
  notification: {
    label: "Thông báo",
    icon: FiBell,
    component: NotificationSettings,
    description: "Push notification, email, SMS, âm thanh",
  },
  security: {
    label: "Bảo mật",
    icon: FiShield,
    component: SecuritySettings,
    description: "Mật khẩu, đăng nhập, bảo mật API",
  },
};

const AdminSettings = () => {
  const { tab } = useParams();

  // Nếu không có tab hoặc tab không hợp lệ, redirect về general
  if (!tab || !SETTING_TABS[tab]) {
    return <Navigate to="/admin/settings/general" replace />;
  }

  const currentTab = SETTING_TABS[tab];
  const ActiveComponent = currentTab.component;
  const TabIcon = currentTab.icon;

  return (
    <div>
      {/* Tab title */}
      <div className="mb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
          <TabIcon className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{currentTab.label}</h2>
          <p className="text-sm text-gray-500">{currentTab.description}</p>
        </div>
      </div>

      {/* Tab Content - Overlay tính năng đang phát triển */}
      <div className="relative">
        <div className="pointer-events-none select-none opacity-50">
          <ActiveComponent />
        </div>
        {/* Overlay ngăn tương tác */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1.2px] rounded-xl flex flex-col items-center justify-center z-10">
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 px-10 py-8 flex flex-col items-center gap-3 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-1">
              <FiTool className="w-7 h-7 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Tính năng đang phát triển</h3>
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              Chức năng <span className="font-semibold text-orange-600">{currentTab.label}</span>{" "}
              hiện đang trong quá trình phát triển và sẽ sớm được cập nhật.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
