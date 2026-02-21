import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiUsers,
  FiMenu,
  FiChevronRight,
  FiChevronDown,
  FiBookOpen,
  FiSettings,
  FiGift,
  FiUser,
  FiMessageSquare,
  FiMail,
  FiCreditCard,
  FiBell,
  FiShield,
  FiDatabase,
} from "react-icons/fi";
import { MdDashboard, MdRestaurantMenu } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { HiOutlineClipboardList, HiOutlineUserGroup } from "react-icons/hi";
import { BiLineChart } from "react-icons/bi";
import useHeaderHeight from "../../hooks/useHeaderHeight";
import "./Sidebar.css";

// Icon mapping
const iconMap = {
  // Admin icons
  dashboard: MdDashboard,
  users: FiUsers,
  staff: HiOutlineUserGroup,
  orders: HiOutlineClipboardList,
  menu: MdRestaurantMenu,
  analytics: BiLineChart,
  promotions: FiGift,
  settings: FiSettings,
  comments: FiMessageSquare,
  contacts: FiMail,
  // Settings sub-icons
  settingsGeneral: FiSettings,
  settingsPayment: FiCreditCard,
  settingsMail: FiMail,
  settingsChatbot: FiMessageSquare,
  settingsNotification: FiBell,
  settingsSecurity: FiShield,
  settingsData: FiDatabase,
  // Staff icons
  reports: BiLineChart,
  customers: FiUser,
  // Common icons
  home: FiHome,
  book: FiBookOpen,
};

const Sidebar = ({ navigation, isOpen, onToggle, isMobile, config }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [expandedMenus, setExpandedMenus] = useState({});

  // Tính toán chính xác height của header
  const headerHeight = useHeaderHeight("header");

  // Tự động mở submenu nếu đang ở trang con
  useEffect(() => {
    navigation.forEach((item) => {
      if (item.children && location.pathname.startsWith(item.path)) {
        setExpandedMenus((prev) => ({ ...prev, [item.path]: true }));
      }
    });
  }, [location.pathname, navigation]);

  // Toggle mở/đóng submenu
  const toggleSubmenu = (path) => {
    setExpandedMenus((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  // Đóng sidebar khi click ra ngoài trên mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onToggle();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isOpen, onToggle]);

  // Đóng sidebar khi thay đổi route trên mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      onToggle();
    }
  }, [location.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: isMobile ? "-100%" : "-328px", // 320px width + 8px margin = 328px
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const backdropVariants = {
    open: {
      opacity: 1,
      visibility: "visible",
    },
    closed: {
      opacity: 0,
      visibility: "hidden",
    },
  };

  // Lấy màu sắc từ config hoặc sử dụng mặc định
  const getActiveStyles = () => {
    const activeColors = config?.activeColors || {};
    return {
      textColor: activeColors.text || "text-blue-700",
      backgroundColor: activeColors.background,
      borderColor: activeColors.border || "border-blue-200",
      iconColor: activeColors.icon || "text-blue-600",
    };
  };

  const activeStyles = getActiveStyles();

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sidebar-backdrop"
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        ref={sidebarRef}
        className={`
          fixed bg-white z-50 rounded-xl overflow-hidden
          ${
            isMobile
              ? "top-0 left-0 w-90 h-screen shadow-2xl"
              : "left-2 w-90 shadow-xl border border-gray-100"
          }
        `}
        style={{
          top: isMobile ? "0px" : `${headerHeight + 8}px`, // Thêm 8px margin từ header
          height: isMobile ? "100vh" : `calc(100vh - ${headerHeight + 16}px)`, // Trừ thêm margin
        }}
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div
              className={`w-8 h-8 ${
                config?.iconColor || "bg-blue-600"
              } rounded-lg flex items-center justify-center`}>
              <FiHome className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {config?.title || "Người dùng"}
              </h3>
              {config?.subtitle && <p className="text-sm text-gray-500">{config.subtitle}</p>}
            </div>
          </div>

          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={onToggle}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <IoClose className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-4 overflow-y-auto" style={{ maxHeight: "calc(100% - 180px)" }}>
          <ul className="space-y-2 sidebar-nav">
            {navigation.map((item, index) => {
              const IconComponent = iconMap[item.icon] || FiMenu;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedMenus[item.path];
              // Item active khi pathname trùng chính xác hoặc là trang con (nếu không có children)
              const isActive = hasChildren
                ? location.pathname.startsWith(item.path)
                : location.pathname === item.path;

              return (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: { delay: index * 0.1 },
                  }}>
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        toggleSubmenu(item.path);
                        // Nếu chưa ở trang settings, navigate đến trang con đầu tiên
                        if (!location.pathname.startsWith(item.path)) {
                          handleNavigation(item.children[0].path);
                        }
                      } else {
                        handleNavigation(item.path);
                      }
                    }}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-lg
                      text-left transition-all duration-200 group sidebar-item
                      ${
                        isActive
                          ? `${activeStyles.textColor} ${activeStyles.backgroundColor} border ${activeStyles.borderColor} shadow-sm`
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}>
                    <div className="flex items-center space-x-3">
                      <IconComponent
                        className={`w-6 h-6 transition-colors ${
                          isActive
                            ? activeStyles.iconColor
                            : "text-gray-500 group-hover:text-gray-700"
                        }`}
                      />
                      <span className="font-medium text-md ">{item.label}</span>
                    </div>

                    {hasChildren ? (
                      <FiChevronDown
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        } ${
                          isActive
                            ? activeStyles.iconColor
                            : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      />
                    ) : (
                      <FiChevronRight
                        className={`w-6 h-6 transition-transform opacity-0 group-hover:opacity-100 ${
                          isActive ? "opacity-100 transform rotate-90" : ""
                        }`}
                      />
                    )}
                  </button>

                  {/* Submenu children */}
                  {hasChildren && (
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
                          {item.children.map((child) => {
                            const ChildIcon = iconMap[child.icon] || FiMenu;
                            const isChildActive = location.pathname === child.path;

                            return (
                              <motion.li
                                key={child.path}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}>
                                <button
                                  onClick={() => handleNavigation(child.path)}
                                  className={`
                                    w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg
                                    text-left transition-all duration-200 text-sm
                                    ${
                                      isChildActive
                                        ? `${activeStyles.textColor} bg-opacity-50 ${activeStyles.backgroundColor} font-medium`
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                                    }
                                  `}>
                                  <ChildIcon
                                    className={`w-6 h-6 flex-shrink-0 ${
                                      isChildActive ? activeStyles.iconColor : "text-gray-400"
                                    }`}
                                  />
                                  <span>{child.label}</span>
                                </button>
                              </motion.li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full notification-dot"></div>
              <span className="text-sx text-gray-600">Đang hoạt động</span>
            </div>
            <p className="text-sx text-gray-500 mt-1">
              Phiên làm việc: {new Date().toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
