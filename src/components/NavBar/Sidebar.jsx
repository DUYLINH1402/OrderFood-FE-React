import React from "react";
import "../../assets/styles/components/Sidebar.scss";
import { FontAwesomeIcon, faTimes, faChevronDown } from "../../utils/icons";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation(); // LẤY ROUTE HIỆN TẠI
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "active" : ""}`} onClick={onClose}></div>

      <div className={`sidebar ${isOpen ? "active" : ""}`}>
        <div className="sidebar-header">
          <h2>MENU</h2>
          <button className="close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <ul className="sidebar-menu">
          <li className={isActive("/") ? "active" : ""}>
            <Link to="/" onClick={onClose}>
              TRANG CHỦ
            </Link>
          </li>
          <li className={isActive("/gioi-thieu") ? "active" : ""}>
            <Link to="/gioi-thieu" onClick={onClose}>
              GIỚI THIỆU
            </Link>
          </li>
          <li className={`has-dropdown ${isActive("/mon-an") ? "active" : ""}`}>
            <Link to="/mon-an" onClick={onClose}>
              THỰC ĐƠN
            </Link>
          </li>
          <li className={isActive("/dai-tiec") ? "active" : ""}>
            <Link to="/dai-tiec" onClick={onClose}>
              ĐÃI TIỆC LƯU ĐỘNG
            </Link>
          </li>
          <li className={isActive("/danh-gia-khach-hang") ? "active" : ""}>
            <Link to="/danh-gia-khach-hang" onClick={onClose}>
              ĐÁNH GIÁ CỦA KHÁCH HÀNG
            </Link>
          </li>
          <li className={isActive("/tin-tuc") ? "active" : ""}>
            <Link to="/tin-tuc" onClick={onClose}>
              TIN TỨC
            </Link>
          </li>
          <li className={isActive("/bao-chi") ? "active" : ""}>
            <Link to="/bao-chi" onClick={onClose}>
              BÁO CHÍ & TRUYỀN THÔNG
            </Link>
          </li>

          <li className={`has-dropdown ${isActive("/tich-diem") ? "active" : ""}`}>
            <Link to="/tich-diem" onClick={onClose}>
              TÍCH ĐIỂM - NHẬN QUÀ
            </Link>
          </li>
          <li className={isActive("/lien-he") ? "active" : ""}>
            <Link to="/lien-he" onClick={onClose}>
              LIÊN HỆ
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
