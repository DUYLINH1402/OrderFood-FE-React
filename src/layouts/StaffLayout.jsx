import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Dropdown, Avatar, Typography } from "antd";
import { UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { useAuth } from "../hooks/auth/useAuth";
import { logout } from "../store/slices/authSlice";
import { ROLE_NAVIGATION, ROLE_THEMES } from "../utils/roleConfig";
import staff_avatar from "../assets/icons/staff_avatar.png";

const { Text } = Typography;

const StaffLayout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, userRole: role } = useAuth();

  const navigation = ROLE_NAVIGATION[role] || [];
  const theme = ROLE_THEMES[role] || {};

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/staff/profile");
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/src/assets/icons/logo.webp" alt="Logo" className=" w-12" />
              <h1 className="text-xl font-semibold text-gray-900">Quản lý nhà hàng</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notification */}
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5-5v5zM9 17H4l5-5v5z"
                  />
                </svg>
              </button>

              {/* User menu */}
              <Dropdown
                menu={{ items: menuItems }}
                trigger={["click"]}
                placement="bottomRight"
                arrow
                overlayClassName="min-w-[200px]">
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <Avatar
                    src={user?.avatar || staff_avatar}
                    icon={<UserOutlined />}
                    size={32}
                    className="border border-gray-200"
                  />
                  <div className="text-left">
                    <Text className="text-sm font-medium text-gray-700 block">
                      {user?.name || user?.username || "Nhân viên"}
                    </Text>
                    <Text className="text-xs text-gray-500 block">
                      {user?.roleName || "Nhân viên"}
                    </Text>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400"
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

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {navigation.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <span className="mr-3">📊</span>
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default StaffLayout;
