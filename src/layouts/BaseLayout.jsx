import React, { useState, useEffect } from "react";
import { useUserWebSocket } from "../services/websocket/useUserWebSocket";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Dropdown, Avatar, Typography } from "antd";
import { UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { FiMenu } from "react-icons/fi";
import { useAuth } from "../hooks/auth/useAuth";
import { logout } from "../store/slices/authSlice";
import { persistor } from "../store";
import { ROLE_NAVIGATION } from "../utils/roleConfig";
import Sidebar from "./Sidebar/Sidebar";
import MobileMenuToggle from "./Sidebar/MobileMenuToggle";
import "./Sidebar/Sidebar.css";
import staff_avatar from "../assets/icons/staff_avatar.png";

const BaseLayout = ({ children, title, subtitle, headerGradient }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, userRole: role } = useAuth();
  // Tự động kết nối WebSocket khi user đăng nhập
  useUserWebSocket();

  // State cho sidebar responsive
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navigation = ROLE_NAVIGATION[role] || [];

  // Lấy thông tin từ user object
  const userRoleName = user?.roleName || "Người dùng";
  const displayTitle = title || `Hệ thống ${userRoleName}`;
  const displaySubtitle = subtitle || "Quản lý nhà hàng";

  // Cấu hình sidebar dựa trên thông tin user và role
  const getThemeByRole = (roleCode) => {
    switch (roleCode) {
      case "ROLE_ADMIN":
        return {
          iconColor: "bg-orange-600",
          activeColors: {
            text: "text-orange-700",
            background: "bg-orange-50",
            border: "border-orange-200",
            icon: "text-orange-600",
          },
        };

      case "ROLE_STAFF":
      default:
        return {
          iconColor: "bg-green-600",
          activeColors: {
            text: "text-green-700",
            background: "bg-green-50",
            border: "border-green-200",
            icon: "text-green-600",
          },
        };
    }
  };

  const roleTheme = getThemeByRole(user?.roleCode);

  const sidebarConfig = {
    title: userRoleName,
    subtitle: displaySubtitle,
    iconColor: roleTheme.iconColor,
    activeColors: roleTheme.activeColors,
  };

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024; // laptop breakpoint
      setIsMobile(mobile);
      // Mở sidebar mặc định trên desktop, đóng trên mobile
      setSidebarOpen(!mobile);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    persistor.purge(); // Xóa persisted state sau khi logout
    navigate("/");
  };

  const handleProfileClick = () => {
    const profilePath = user?.roleCode === "ROLE_ADMIN" ? "/admin/profile" : "/staff/profile";
    navigate(profilePath);
  };

  // Menu items cho dropdown
  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
      onClick: handleProfileClick,
    },
    {
      type: "divider",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: handleProfileClick,
      disabled: true,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
      danger: true,
    },
  ];

  // Default header styles
  const defaultHeaderStyle = {
    background:
      "linear-gradient(90deg, rgba(228, 233, 230, 0.95) 0%, rgba(34, 197, 94, 0.90) 60%, rgba(255, 255, 255, 0.15) 100%)",
    boxShadow: "0 4px 20px 0 rgba(22, 163, 74, 0.15), 0 2px 0 0 #16a34a",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
  };

  const headerStyle = headerGradient || defaultHeaderStyle;

  return (
    <div className="min-h-screen w-full max-w-full bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b backdrop-blur-sm" style={headerStyle}>
        <div className=" px-4 laptop:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Menu button for mobile/tablet */}
              <MobileMenuToggle
                isOpen={sidebarOpen}
                onToggle={toggleSidebar}
                className="laptop:hidden"
              />

              {/* Desktop menu toggle */}
              <button
                onClick={toggleSidebar}
                className="hidden laptop:flex p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
                title="Thu gọn/Mở rộng menu">
                <FiMenu className="w-8 h-8 text-[#374151]" />
              </button>

              {/* Title */}
              <div className="flex items-center space-x-3">
                <div className="hidden tablet:block">
                  <h1 className="text-xl laptop:text-xl font-bold text-[#374151] drop-shadow-sm">
                    {displayTitle}
                  </h1>
                  <p className="text-md laptop:text-base text-[#374151]  hidden laptop:block font-medium">
                    {displaySubtitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 laptop:space-x-4">
              {/* User menu */}
              <Dropdown
                menu={{ items: menuItems }}
                trigger={["click"]}
                placement="bottomRight"
                arrow
                overlayClassName="min-w-[200px]">
                <div className="flex items-center space-x-2 laptop:space-x-3 p-2 rounded-lg hover:bg-white hover:bg-opacity-15 transition-all duration-200 cursor-pointer">
                  <Avatar
                    src={user?.avatarUrl || staff_avatar}
                    icon={<UserOutlined />}
                    size={isMobile ? 32 : 50}
                    className="border-2 border-white border-opacity-40 shadow-sm"
                  />
                  <div className="text-left hidden tablet:block">
                    <Typography.Text className="text-md laptop:text-base font-semibold text-[#374151] block drop-shadow-sm">
                      {user?.fullName || user?.username || "Người dùng"}
                    </Typography.Text>
                    <Typography.Text className="text-sm text-[#374151] text-opacity-85 block font-medium">
                      {user?.roleName || "Người dùng"}
                    </Typography.Text>
                  </div>
                  <svg
                    className="w-4 h-4 text-[#374151] text-opacity-80 hidden laptop:block drop-shadow-sm"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar
        navigation={navigation}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        isMobile={isMobile}
        config={sidebarConfig}
      />

      {/* Main content */}
      <main
        className="transition-all duration-300 ease-in-out min-h-screen p-4 laptop:p-6"
        style={{
          marginLeft: !isMobile && sidebarOpen ? "336px" : "0px", // 320px sidebar + 16px margin
        }}>
        <div className=" mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default BaseLayout;
