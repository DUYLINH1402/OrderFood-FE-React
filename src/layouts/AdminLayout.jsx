import React from "react";
import { useRole } from "../hooks/auth/useAuth";
import { ROLE_NAVIGATION, ROLE_THEMES } from "../utils/roleConfig";

const AdminLayout = ({ children }) => {
  const { role } = useRole();
  const navigation = ROLE_NAVIGATION[role] || [];
  const theme = ROLE_THEMES[role] || {};

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/src/assets/icons/logo.webp" alt="Logo" className="h-8 w-8" />
              <h1 className="text-xl font-semibold text-gray-900">Quản trị hệ thống</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick stats */}
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                <span>
                  Đơn hàng hôm nay: <strong className="text-green-600">25</strong>
                </span>
                <span>
                  Doanh thu: <strong className="text-blue-600">2.5M VNĐ</strong>
                </span>
              </div>

              {/* Notification */}
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5-5v5z"
                  />
                </svg>
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <img
                  src="/src/assets/icons/user_avatar.png"
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">Quản trị viên</span>
              </div>
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
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors">
                  <span className="mr-3">⚙️</span>
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
