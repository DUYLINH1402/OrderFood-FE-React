import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/icons//logo.webp";
import shopping_cart from "../../assets/icons/shopping_cart.png";
import "../styles/Header.scss";
import LazyImage from "../LazyImage";
import SearchBar from "../SearchBar";

const Header = () => {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY <= 0) {
      setShowHeader(true);
    } else if (currentScrollY > lastScrollY) {
      setShowHeader(false); // lăn xuống -> ẩn
    } else {
      setShowHeader(true); // lăn lên -> hiện
    }

    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`header ${showHeader ? "visible" : "hidden"}`}>
      <div className="header__left">
        <Link to="/" className="header__logo">
          <LazyImage src={logo} alt="Đồng Xanh" width={70} />
        </Link>
      </div>

      <div className="header__right">
        <div className="header__search">
          <SearchBar />
        </div>
        <div className="header__account">
          <Link to="/login" className="btn-login">
            {" "}
            Đăng nhập
          </Link>
        </div>

        <Link to="/cart" className="header__cart">
          <LazyImage src={shopping_cart} alt="Giỏ hàng" className="shopping-cart" />
          <span className="badge">0</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
