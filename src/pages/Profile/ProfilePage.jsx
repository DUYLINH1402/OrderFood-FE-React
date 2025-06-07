// Chú ý: Component sử dụng Tailwind CSS và Flowbite
// Chú ý: Component sử dụng Tailwind CSS và FontAwesome + class content-spacing trong app.scss
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBoxOpen,
  faWallet,
  faGift,
  faTrophy,
  faLock,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { ProfileTab } from "./ProfileTab";
import ChangePasswordTab from "./ChangePasswordTab";
import ResetPasswordPage from "../../components/ResetPasswordPage";
import { Navigate } from "react-router-dom";

const tabs = [
  { id: "profile", label: "Hồ sơ cá nhân", icon: faUser },
  { id: "orders", label: "Đơn hàng của tôi", icon: faBoxOpen },
  { id: "payment", label: "Thanh toán", icon: faWallet },
  { id: "coupons", label: "Ưu đãi của tôi", icon: faGift },
  { id: "points", label: "Điểm thưởng", icon: faTrophy },
  { id: "change_password", label: "Đổi mật khẩu", icon: faLock },
  { id: "support", label: "Liên hệ / Hỗ trợ", icon: faPhone },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="content-spacing flex flex-col md:flex-row gap-4 text-sm md:text-base rounded-xl shadow-md">
      <ul className="flex flex-col gap-[10px] font-medium w-[250px] ">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <button
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center w-full px-4 py-3 rounded-xl transition-all
                ${
                  activeTab === tab.id
                    ? "bg-[#05bc0b] text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}>
              <FontAwesomeIcon icon={tab.icon} className="w-6 h-6 me-6" />
              <span>{tab.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="flex-1 p-6 bg-gray-50 rounded-xl text-gray-700">
        {activeTab === "profile" && (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hồ sơ cá nhân</h3>
            <ProfileTab />
          </>
        )}
        {activeTab === "orders" && (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Đơn hàng của tôi</h3>
            <p>Danh sách đơn hàng, trạng thái đơn, nút xem chi tiết,...</p>
          </>
        )}
        {activeTab === "payment" && (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thanh toán</h3>
            <p>Hiển thị thông tin MoMo, lịch sử giao dịch.</p>
          </>
        )}
        {activeTab === "coupons" && (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ưu đãi của tôi</h3>
            <p>Danh sách mã giảm giá còn hạn, mã sắp hết hạn,...</p>
          </>
        )}
        {activeTab === "points" && (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Điểm thưởng</h3>
            <p>Số điểm hiện tại, lịch sử tích và sử dụng điểm.</p>
          </>
        )}
        {activeTab === "change_password" && <ChangePasswordTab />}
        {activeTab === "support" && (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Liên hệ / Hỗ trợ</h3>
            <p>Form gửi yêu cầu hỗ trợ, khiếu nại, góp ý,...</p>
            <ResetPasswordPage />
          </>
        )}
      </div>
    </div>
  );
}
