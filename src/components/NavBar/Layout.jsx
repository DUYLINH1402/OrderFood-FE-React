// Layout cho trang chính (User)
import React, { useState } from "react";
import { UserWebSocketProvider } from "../../services/websocket/UserWebSocketProvider";
import { Outlet, Link, useLocation } from "react-router-dom";
import "../../assets/styles/components/Layout.scss";
import Footer from "./Footer";
import Header from "./Header";
import { FontAwesomeIcon, faBars } from "../../utils/icons";
import Sidebar from "./Sidebar";
import ScrollToTop from "../../utils/ScrollToTop";
import GuideModal from "../GuideModal/GuideModal";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  // Kiểm tra có phải trang checkout không
  const isCheckoutPage =
    location.pathname.includes("/checkout") || location.pathname.includes("/thanh-toan");

  return (
    <UserWebSocketProvider>
      <div className="layout min-h-screen flex flex-col">
        <ScrollToTop />
        <header className="layout__header">
          <Header />
        </header>
        <div className="layout__sidebar">
          <button
            onClick={() => setSidebarOpen(true)}
            className="menu-button flex items-center gap-2 px-3 py-2 text-sm sm:text-base sm:px-4 sm:py-2.5 lg:text-lg bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
            <FontAwesomeIcon icon={faBars} className="text-lg sm:text-xl lg:text-2xl" />
            <span className="hidden md:inline">Menu</span>
          </button>

          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
        <main className="layout__main flex-grow ">
          <Outlet />
        </main>

        <footer className="layout__footer">
          <Footer />
        </footer>

        {/* GuideModal luôn hiển thị FAB, chỉ auto-open ở checkout */}
        <GuideModal autoOpen={isCheckoutPage} />
      </div>
    </UserWebSocketProvider>
  );
};

export default Layout;
