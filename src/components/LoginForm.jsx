import { useState } from "react";
import React from "react";
import "./styles/LoginForm.scss";
import facebook from "../assets/icons/facebook.svg";
import google from "../assets/icons/google.svg";
import zaloIcon from "../assets/icons/zaloIcon.svg";

export default function LoginRegisterForm() {
  const [isRegisterActive, setIsRegisterActive] = useState(false);

  return (
    <div className="login-register-wrapper">
      <div className={`container${isRegisterActive ? " active" : ""}`}>
        {/* LOGIN */}
        <div className="form-box login ">
          <form>
            <h1>Đăng nhập</h1>
            <div className="input-box">
              <input type="text" placeholder="Email hoặc Username" required />
              <i className="bx bxs-user"></i>
            </div>
            <div className="input-box">
              <input type="password" placeholder="Mật khẩu" required />
              <i className="bx bxs-lock-alt"></i>
            </div>
            <div className="forgot-link">
              <a href="#">Quên mật khẩu?</a>
            </div>
            <button type="submit" className="btn">
              Đăng nhập
            </button>
            <p>hoặc đăng nhập bằng mạng xã hội</p>
            <div className="social-icons">
              <a href="#">
                <img src={google} alt="Google" />
              </a>
              <a href="#">
                <img src={facebook} alt="Facebook" />
              </a>
              <a href="#">
                <img src={zaloIcon} alt="Zalo" />
              </a>
            </div>
          </form>
        </div>

        {/* REGISTER */}
        <div className="form-box register ">
          <form>
            <h1>Đăng ký</h1>
            <div className="input-box">
              <input type="text" placeholder="Tên đăng nhập (VD: duylinhGCT)" required />
              <i className="bx bxs-user"></i>
            </div>
            <div className="input-box">
              <input type="email" placeholder="Email" required />
              <i className="bx bxs-envelope"></i>
            </div>
            <div className="input-box">
              <input type="password" placeholder="Mật khẩu" required />
              <i className="bx bxs-lock-alt"></i>
            </div>
            <div className="input-box">
              <input type="password" placeholder="Nhập lại mật khẩu" required />
              <i className="bx bxs-lock-alt"></i>
            </div>
            <button type="submit" className="btn">
              Đăng ký
            </button>
          </form>
        </div>

        {/* TOGGLE */}
        <div className="toggle-box ">
          <div className="toggle-panel toggle-left">
            <h1 className="">Chào mừng bạn!</h1>
            <p>Bạn chưa có tài khoản?</p>
            <button className="btn register-btn" onClick={() => setIsRegisterActive(true)}>
              Đăng ký
            </button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Chào mừng trở lại!</h1>
            <p>Bạn đã có tài khoản?</p>
            <button className="btn login-btn" onClick={() => setIsRegisterActive(false)}>
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
