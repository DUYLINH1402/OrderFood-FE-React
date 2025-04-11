import React, { useEffect, useRef } from "react";
import "./styles/LoginForm.scss";

export const LoginForm = () => {
  const containerRef = useRef(null);

  const handleRegisterClick = () => {
    containerRef.current.classList.add("active");
  };

  const handleLoginClick = () => {
    containerRef.current.classList.remove("active");
  };

  return (
    <div className="login-form-wrap">
      <div className="container" ref={containerRef}>
        {/* ĐĂNG KÝ */}
        <div className="form-container sign-up">
          <form>
            <h1>Tạo tài khoản</h1>
            <div className="social-icons">
              <a href="#" className="icon">
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <span>hoặc sử dụng email để đăng ký</span>
            <input type="text" placeholder="Họ và tên" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Mật khẩu" />
            <button type="submit">Đăng ký</button>
          </form>
        </div>

        {/* ĐĂNG NHẬP */}
        <div className="form-container sign-in">
          <form>
            <h1>Đăng nhập</h1>
            <div className="social-icons">
              <a href="#" className="icon">
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <span>hoặc sử dụng email và mật khẩu</span>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Mật khẩu" />
            <a href="#">Quên mật khẩu?</a>
            <button type="submit">Đăng nhập</button>
          </form>
        </div>

        {/* KHUNG CHUYỂN ĐỔI */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Chào mừng trở lại!</h1>
              <p>Nhập thông tin cá nhân để tiếp tục sử dụng dịch vụ</p>
              <button className="hidden" onClick={handleLoginClick}>
                Đăng nhập
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Xin chào thành viên mới!</h1>
              <p>Hãy đăng ký tài khoản để trải nghiệm đầy đủ tính năng</p>
              <button className="hidden" onClick={handleRegisterClick}>
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
