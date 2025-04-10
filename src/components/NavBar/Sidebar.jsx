import React from "react";
import "../styles/Sidebar.scss";
import { FontAwesomeIcon, faTimes, faChevronDown } from "../../utils/icons";
import { Link } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
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
          <li>
            <Link to="#">GIỚI THIỆU</Link>
          </li>
          <li>
            <Link to="/">TRANG CHỦ</Link>
          </li>
          <li className="has-dropdown">
            <Link to="#">
              THỰC ĐƠN <FontAwesomeIcon icon={faChevronDown} />
            </Link>
          </li>

          <li className="has-dropdown">
            <Link to="#">
              ĐÁNH GIÁ CỦA KHÁCH HÀNG <FontAwesomeIcon icon={faChevronDown} />
            </Link>
          </li>

          <li>
            <Link to="#">TÍCH ĐIỂM - NHẬN QUÀ</Link>
          </li>
          <li>
            <Link to="#">LÀM THIỆN NGUYỆN CÙNG ĐỒNG XANH</Link>
          </li>
          <li>
            <Link to="#">ĐÃI TIỆC LƯU ĐỘNG TẠI NHÀ</Link>
          </li>
          <li className="has-dropdown">
            <Link to="#">
              TÀI NGUYÊN - KIẾN THỨC <FontAwesomeIcon icon={faChevronDown} />
            </Link>
          </li>
          <li>
            <Link to="#">TIN TỨC</Link>
          </li>
          <li>
            <Link to="#">LIÊN HỆ</Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
