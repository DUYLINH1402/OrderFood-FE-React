import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/icons//logo.webp";
import shopping_cart from "../../assets/icons/shopping_cart.png";
import user_avatar from "../../assets/icons/user_avatar.png";
import "../../assets/styles/components/Header.scss";
import LazyImage from "../LazyImage";
import SearchBar from "../SearchBar";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { clearCart } from "../../store/slices/cartSlice";
const Header = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const authUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownMounted, setDropdownMounted] = useState(false);
  const dropdownRef = useRef(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const [hideLoginCart, setHideLoginCart] = useState(false);

  useEffect(() => {
    if (isSearchExpanded && window.innerWidth < 768) {
      setTimeout(() => setHideLoginCart(true), 300); // sau animation
    } else {
      setHideLoginCart(false);
    }
  }, [isSearchExpanded]);

  // Bỏ chức năng ẩn hiện header khi scroll

  // useEffect(() => {
  //   window.forceShowHeader = () => setShowHeader(true);
  // }, []);
  //
  // useEffect(() => {
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, [lastScrollY]);

  // Click ngoài avatar dropdown thì tự đóng
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Logout
  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart()); // xoá Redux cart + localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  useEffect(() => {
    let timer;
    if (dropdownOpen) {
      setDropdownMounted(true);
    } else {
      timer = setTimeout(() => setDropdownMounted(false), 200); // khớp với duration Tailwind
    }
    return () => clearTimeout(timer);
  }, [dropdownOpen]);
  // console.log("User:", authUser);
  return (
    <header className="header ">
      <div className="header__left">
        <Link to="/" className="header__logo">
          <LazyImage src={logo} alt="Đồng Xanh" width={60} />
        </Link>
      </div>
      <div className="header__center"></div>
      <div className="header__right">
        <div className="header__search p-3 cursor-pointer relative">
          <SearchBar setIsSearchExpanded={setIsSearchExpanded} />
        </div>
        {isSearchExpanded && window.innerWidth < 768 ? null : (
          <div
            className={`
  header__account relative transition-opacity duration-1000
  ${isSearchExpanded && window.innerWidth < 768 ? "opacity-0 pointer-events-none" : "opacity-100"}
  ${hideLoginCart ? "hidden" : ""}
`}
            ref={dropdownRef}>
            {authUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <img
                  src={authUser.avatarUrl || user_avatar}
                  alt="avatar"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border object-cover cursor-pointer"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                />
                {dropdownMounted && (
                  <div
                    className={`absolute sm:right-[-75px] sm:top-[6rem] right-[-90px] top-20 w-80 sm:w-[250px] bg-white shadow-2xl rounded-xl border border-gray-200 z-50 overflow-hidden text-sm transform transition-all duration-200 ease-out
                        ${
                          dropdownOpen
                            ? "opacity-100 translate-y-0 scale-95"
                            : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                        }`}>
                    {/* Header user info */}
                    <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
                      <img
                        src={authUser.avatarUrl || user_avatar}
                        alt="avatar"
                        className="w-12 h-12 sm:w-20 sm:h-20 rounded-full border object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 sm:text-base text-sm line-clamp-1 break-all">
                          {authUser.fullName || authUser.username}
                        </span>
                        <span className="text-gray-500 text-sm">@{authUser.username}</span>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="flex flex-col">
                      <Link
                        to="/ho-so"
                        onClick={() => setDropdownOpen(false)} // Đóng dropdown
                        className="px-4 py-3 hover:bg-gray-50 transition text-gray-700  sm:text-base text-sm">
                        Trang cá nhân
                      </Link>
                      <Link
                        to="/yeu-thich"
                        onClick={() => setDropdownOpen(false)} // Đóng dropdown
                        className="px-4 py-3 hover:bg-gray-50 transition text-gray-700  sm:text-base text-sm">
                        Món Yêu thích
                      </Link>
                      <Link
                        to="ho-so?tab=orders"
                        onClick={() => setDropdownOpen(false)} // Đóng dropdown
                        className="px-4 py-3 hover:bg-gray-50 transition text-gray-700  sm:text-base text-sm">
                        Đơn hàng của tôi
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={() => {
                          setDropdownOpen(false); // Đóng dropdown
                          handleLogout(); // Rồi mới logout
                        }}
                        className="text-left px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition  sm:text-base text-sm">
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/dang-nhap" className="btn-login whitespace-nowrap">
                Đăng nhập
              </Link>
            )}
          </div>
        )}

        <Link
          to="/gio-hang"
          className={`header__cart relative transition-opacity duration-1000
  ${isSearchExpanded && window.innerWidth < 768 ? "opacity-0 pointer-events-none" : "opacity-100"}
  ${hideLoginCart ? "hidden" : ""}
`}>
          <LazyImage src={shopping_cart} alt="Giỏ hàng" className="shopping-cart" />
          <span className="badge">{cartItems?.length || 0}</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
