// Component sử dụng Tailwind CSS và Flowbite
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBoxOpen,
  faWallet,
  faGift,
  faTrophy,
  faLock,
  faPhone,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { ProfileTab } from "./ProfileTab";
import OrdersTab from "./OrdersTab";
import ChangePasswordTab from "./ChangePasswordTab";
import ResetPasswordPage from "../ResetPasswordPage";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import PointsTab from "./PointsTab";
import CouponsTab from "./CouponsTab";
import NotificationsTab from "./NotificationsTab";

const tabs = [
  { id: "profile", label: "Hồ sơ cá nhân", icon: faUser },
  { id: "orders", label: "Đơn hàng của tôi", icon: faBoxOpen },
  { id: "notifications", label: "Thông báo", icon: faBell },
  { id: "payment", label: "Thanh toán", icon: faWallet },
  { id: "coupons", label: "Ưu đãi của tôi", icon: faGift },
  { id: "points", label: "Điểm thưởng", icon: faTrophy },
  { id: "change_password", label: "Đổi mật khẩu", icon: faLock },
  { id: "support", label: "Liên hệ / Hỗ trợ", icon: faPhone },
];

export default function ProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [pendingTab, setPendingTab] = useState(null); // tab sẽ chuyển đến
  const [showTabs, setShowTabs] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const accessToken = localStorage.getItem("accessToken");

  // Xử lý query parameter để chuyển đến tab được chỉ định
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get("tab");

    if (tabParam && tabs.some((tab) => tab.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);
  useEffect(() => {
    setShowTabs(true);
    // Hiệu ứng xuất hiện lần đầu cho content bên phải
    setTimeout(() => setShowContent(true), 150);
  }, []);

  // Hiệu ứng cho nội dung bên phải khi đổi tab
  // Chuyển tab mượt: ẩn nội dung cũ, sau đó mới đổi tab và hiện nội dung mới
  useEffect(() => {
    if (pendingTab === null) return;
    setShowContent(false);
    const timeout = setTimeout(() => {
      setActiveTab(pendingTab);
      setShowContent(true);
      setPendingTab(null);

      // Cập nhật URL theo tab hiện tại
      if (pendingTab === "profile") {
        // Nếu chuyển về tab profile, xóa query parameter
        navigate("/ho-so", { replace: true });
      } else {
        // Nếu chuyển sang tab khác, cập nhật query parameter
        navigate(`/ho-so?tab=${pendingTab}`, { replace: true });
      }
    }, 350); // thời gian khớp duration-500 (ẩn xong mới đổi tab)
    return () => clearTimeout(timeout);
  }, [pendingTab, navigate]);

  if (!accessToken) {
    return <Navigate to="/dang-nhap" replace />;
  }
  return (
    <div
      className="content-spacing background-page-container flex flex-col md:flex-row gap-4 text-sm md:text-base rounded-xl "
      // Dùng style để thêm hiệu ứng blob mà k phá giao diện
      style={{ position: "relative", overflow: "hidden" }}>
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />
      <div className="bg-blob bg-blob-4" />
      <div className="bg-blob bg-blob-5" />
      <div className="bg-blob bg-blob-6" />
      <div>
        <ul className="flex flex-col gap-[10px] font-medium w-[250px] ">
          {tabs.map((tab, idx) => (
            <li key={tab.id}>
              <button
                onClick={() => {
                  if (tab.id !== activeTab && pendingTab === null) setPendingTab(tab.id);
                }}
                className={`inline-flex items-center w-full px-4 py-3 rounded-xl transition-all duration-500
                  ${
                    activeTab === tab.id
                      ? "bg-[#199b7e]   text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }
                  ${showTabs ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}
                `}
                style={{ transitionDelay: `${showTabs ? idx * 80 : 0}ms` }}>
                <FontAwesomeIcon icon={tab.icon} className="w-6 h-6 me-6" />
                <span>{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`glass-box flex-1 p-6 bg-gray-50 rounded-xl text-gray-700
          transition-transform transition-opacity duration-500
          ${
            showContent
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-[200%] pointer-events-none"
          }
        `}
        style={{
          transition:
            "transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s cubic-bezier(0.4,0,0.2,1)",
          transitionDelay: showContent ? "120ms" : "0ms",
        }}>
        {activeTab === "profile" && (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hồ sơ cá nhân</h3>
            <ProfileTab />
          </>
        )}
        {activeTab === "orders" && (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Đơn hàng của tôi</h3>
            <OrdersTab />
          </>
        )}
        {activeTab === "notifications" && (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Thông báo</h3>
            <NotificationsTab />
          </>
        )}
        {activeTab === "payment" && (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thanh toán</h3>
            <p>Hiển thị lịch sử giao dịch.</p>
          </>
        )}
        {activeTab === "coupons" && (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ưu đãi của tôi</h3>
            <CouponsTab />
          </>
        )}
        {activeTab === "points" && (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Điểm thưởng</h3>
            <PointsTab />
          </>
        )}
        {activeTab === "change_password" && <ChangePasswordTab />}
        {activeTab === "support" && (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Liên hệ / Hỗ trợ</h3>
            <p>Form gửi yêu cầu hỗ trợ, khiếu nại, góp ý,...</p>
          </>
        )}
      </div>
    </div>
  );
}
