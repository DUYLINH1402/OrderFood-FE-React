import React from "react";
import "../styles/Sidebar.scss";
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
          <li className={isActive("/about") ? "active" : ""}>
            <Link to="/about" onClick={onClose}>
              GIỚI THIỆU
            </Link>
          </li>
          <li className={isActive("/") ? "active" : ""}>
            <Link to="/" onClick={onClose}>
              TRANG CHỦ
            </Link>
          </li>
          <li className={`has-dropdown ${isActive("/foods") ? "active" : ""}`}>
            <Link to="/foods" onClick={onClose}>
              THỰC ĐƠN
            </Link>
          </li>
          <li>
            <Link to="#" onClick={onClose}>
              ĐÁNH GIÁ CỦA KHÁCH HÀNG <FontAwesomeIcon icon={faChevronDown} />
            </Link>
          </li>
          <li>
            <Link to="#" onClick={onClose}>
              TÍCH ĐIỂM - NHẬN QUÀ
            </Link>
          </li>
          <li>
            <Link to="#" onClick={onClose}>
              LÀM THIỆN NGUYỆN CÙNG ĐỒNG XANH
            </Link>
          </li>
          <li className="has-dropdown">
            <Link to="#" onClick={onClose}>
              TÀI NGUYÊN - KIẾN THỨC <FontAwesomeIcon icon={faChevronDown} />
            </Link>
          </li>
          <li>
            <Link to="#" onClick={onClose}>
              TIN TỨC
            </Link>
          </li>
          <li>
            <Link to="#" onClick={onClose}>
              LIÊN HỆ
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
