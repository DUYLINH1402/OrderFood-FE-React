import { useState } from "react";
import React from "react";
import "../assets/styles/components/LoginForm.scss";
import facebook from "../assets/icons/facebook.svg";
import google from "../assets/icons/google.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { loginApi, registerApi, resendVerificationEmailApi } from "../services/auth/authApi";
import { handleFieldBlur, validateLoginForm, validateRegisterForm } from "../utils/validation";
import { toast } from "react-toastify";
import { mapAuthError, mapLoginError, mapRegisterError } from "../utils/authErrorMapper";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/slices/authSlice";
import { getUserCart, syncCart } from "../services/service/cartService";
import { setCartItems } from "../store/slices/cartSlice";
import { LoadingButton } from "./Skeleton/LoadingButton";
import ForgotPasswordModal from "./ForgotPasswordModal";

export default function LoginRegisterForm() {
  const [isRegisterActive, setIsRegisterActive] = useState(false);
  const [loginData, setLoginData] = useState({ login: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  // State để hiển thị/ẩn mật khẩu đăng nhập
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // State để hiển thị link gửi lại email xác minh
  const [showResendLink, setShowResendLink] = useState(false);

  // Dữ liệu đăng ký
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Xử lý login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    // Mapping lại cho đúng input name
    const formValues = {
      emailOrUsername: loginData.login,
      password: loginData.password,
    };

    const errors = validateLoginForm(formValues);

    // Nếu có lỗi thì hiển thị
    if (errors.emailOrUsername || errors.password) {
      setLoginErrors(errors);
      setIsLoggingIn(false);
      return;
    }

    try {
      setLoginErrors({});
      const data = await loginApi(loginData); // gọi authService
      // console.log("Dữ liệu đăng nhập:", data);
      // Lưu user + token vào Redux
      dispatch(loginSuccess({ user: data, accessToken: data.token }));

      // Lưu localStorage để tránh mất dữ liệu khi reload
      localStorage.setItem("accessToken", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      // Đồng bộ giỏ hàng nếu có
      const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
      if (cartItems.length > 0) {
        await syncCart(cartItems);
      }
      // Lấy lại cart từ backend và cập nhật Redux
      const serverCart = await getUserCart();
      dispatch(setCartItems(serverCart));

      // Kiểm tra có redirect sau khi đăng nhập không
      const redirectPath = localStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath);
      } else {
        // Đăng nhập thành công → chuyển về trang chủ
        navigate("/");
      }
      toast.success("Đăng nhập thành công!");
    } catch (error) {
      if (error.message === "EMAIL_NOT_VERIFIED") {
        setShowResendLink(true);
      }
      console.error("Lỗi BE trả về:", error.message);
      setLoginErrors(mapLoginError(error.message));
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Xử lý register
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    const errors = validateRegisterForm(registerData);
    const hasError = Object.values(errors).some((err) => err);

    if (hasError) {
      setRegisterErrors(errors);
      setIsRegistering(false);
      return;
    }

    try {
      await registerApi({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
      });
      toast.success("Đăng ký thành công, vui lòng xác minh email!");
      setIsRegisterActive(false); // chuyển sang giao diện đăng nhập
      resetRegisterForm(); // Xoá form đăng ký sau khi đăng ký thành công
    } catch (error) {
      setRegisterErrors(mapRegisterError(error.message));
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRegisterBlur = (field) => {
    const error = handleFieldBlur(field, registerData);
    setRegisterErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleLoginBlur = (field) => {
    const error = handleFieldBlur(field, loginData);
    setLoginErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Xoá dữ liệu cũ Form đăng nhập và đăng ký
  const resetLoginForm = () => {
    setTimeout(() => {
      setLoginData({ login: "", password: "" });
      setLoginErrors({});
    }, 2000);
  };

  const resetRegisterForm = () => {
    setTimeout(() => {
      setRegisterData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setRegisterErrors({});
    }, 2000);
  };

  // Xử lý gửi lại email xác minh
  const handleResendVerification = async () => {
    try {
      await resendVerificationEmailApi(loginData.login);
      toast.success("Đã gửi lại email xác minh. Vui lòng kiểm tra hộp thư.");
      setShowResendLink(false);
    } catch (error) {
      const errorCode = error.response?.data?.message || "UNKNOWN_ERROR";
      console.error(errorCode);
      const mapped = mapAuthError("resend", errorCode);
      toast.error(mapped.general || "Đã có lỗi.");
    }
  };

  // ------------------------------------------------------
  return (
    <div className="login-register-wrapper">
      <div className={`container${isRegisterActive ? " active" : ""}`}>
        {/* LOGIN */}
        <div className="form-box login ">
          <form onSubmit={handleLogin} noValidate>
            <h1>Đăng nhập</h1>
            <div className="input-box">
              <input
                id="emailOrUsername"
                type="text"
                placeholder="Email hoặc Username"
                required
                value={loginData.login}
                onChange={(e) => setLoginData({ ...loginData, login: e.target.value })}
                onBlur={() => handleLoginBlur("login")}
              />
              <i className="bx bxs-user"></i>
              <div className="relative">
                {(loginErrors.emailOrUsername || loginErrors.login) && (
                  <p className="absolute sm:left-[20px] sm:bottom-[-40px] bottom-[-35px] text-red-500 sm:!text-base !text-md mt-1 ">
                    {loginErrors.emailOrUsername || loginErrors.login}
                  </p>
                )}
                {showResendLink && (
                  <span className="absolute right-0 text-sm text-blue-600 text-left px-1 mt-1">
                    <button
                      type="button"
                      className="hover:underline"
                      onClick={handleResendVerification}>
                      Gửi lại email?
                    </button>
                  </span>
                )}
              </div>
            </div>
            <div className="input-box">
              <input
                id="password"
                type={showLoginPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                onBlur={() => handleLoginBlur("password")}
              />
              <span
                className="toggle-password"
                onClick={() => setShowLoginPassword(!showLoginPassword)}>
                <FontAwesomeIcon icon={showLoginPassword ? faEyeSlash : faEye} size="lg" />
              </span>

              <i className="bx bxs-lock-alt"></i>
              {(loginErrors.password || loginErrors.password) && (
                <p className="absolute sm:left-[20px] sm:bottom-[-40px] bottom-[-35px] text-red-500 sm:!text-base !text-md mt-1 ">
                  {loginErrors.password || loginErrors.password}
                </p>
              )}
            </div>
            {loginErrors.general && (
              <p className="text-center text-red-600 text-sm mb-4">{loginErrors.general}</p>
            )}
            <div className="forgot-link">
              <span
                onClick={() => setShowForgotModal(true)}
                className="text-blue-600 hover:underline cursor-pointer text-sm sm:text-base">
                Quên mật khẩu?
              </span>
            </div>

            <LoadingButton type="submit" className="btn" isLoading={isLoggingIn}>
              Đăng nhập
            </LoadingButton>
            <p>hoặc đăng nhập bằng mạng xã hội</p>
            <div className="social-icons">
              <a href="#">
                <img src={google} alt="Google" />
              </a>
              <a href="#">
                <img src={facebook} alt="Facebook" />
              </a>
            </div>
          </form>
        </div>

        {/* REGISTER */}
        <div className="form-box register ">
          <form onSubmit={handleRegister} noValidate>
            <h1>Đăng ký</h1>
            <div className="input-box">
              <input
                type="text"
                placeholder="Username (VD: duylinhGCT)"
                required
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                onBlur={() => handleRegisterBlur("username")}
              />
              <i className="bx bxs-user"></i>
              {registerErrors.username && (
                <p className="absolute sm:left-[20px] sm:bottom-[-40px] bottom-[-35px] text-red-500 sm:!text-base !text-md mt-1 ">
                  {registerErrors.username}
                </p>
              )}
            </div>
            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                required
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                onBlur={() => handleRegisterBlur("email")}
              />
              <i className="bx bxs-envelope"></i>
              {registerErrors.email && (
                <p className="absolute sm:left-[20px] sm:bottom-[-40px] bottom-[-35px] text-red-500 sm:!text-base !text-md mt-1 ">
                  {registerErrors.email}
                </p>
              )}
            </div>
            <div className="input-box">
              <input
                type={showRegisterPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                required
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                onBlur={() => handleRegisterBlur("password")}
              />
              <span
                className="toggle-password"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}>
                <FontAwesomeIcon icon={showRegisterPassword ? faEyeSlash : faEye} size="lg" />
              </span>

              <i className="bx bxs-lock-alt"></i>
              {registerErrors.password && (
                <p className="absolute sm:left-[20px] sm:bottom-[-40px] bottom-[-35px] text-red-500 sm:!text-base !text-md mt-1 ">
                  {registerErrors.password}
                </p>
              )}
            </div>
            <div className="input-box">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                required
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({ ...registerData, confirmPassword: e.target.value })
                }
                onBlur={() => handleRegisterBlur("confirmPassword")}
              />
              <span
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} size="lg" />
              </span>

              <i className="bx bxs-lock-alt"></i>
              {registerErrors.confirmPassword && (
                <p className="absolute sm:left-[20px] sm:bottom-[-40px] bottom-[-35px] text-red-500 sm:!text-base !text-md mt-1 ">
                  {registerErrors.confirmPassword}
                </p>
              )}
            </div>
            <LoadingButton type="submit" className="btn" isLoading={isRegistering}>
              Đăng ký
            </LoadingButton>
          </form>
        </div>

        {/* TOGGLE */}
        <div className="toggle-box ">
          <div className="toggle-panel toggle-left">
            <h1 className="">Chào mừng bạn!</h1>
            <p>Bạn chưa có tài khoản?</p>
            <button
              className="btn register-btn"
              onClick={() => {
                setIsRegisterActive(true);
                resetLoginForm(); // xoá form login
                setShowResendLink(false);
              }}>
              Đăng ký
            </button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Chào mừng trở lại!</h1>
            <p>Bạn đã có tài khoản?</p>
            <button
              className="btn login-btn"
              onClick={() => {
                setIsRegisterActive(false);
                resetRegisterForm(); // xoá form đăng ký
                setShowResendLink(false);
              }}>
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
      {/* Modal Quên mật khẩu */}
      <ForgotPasswordModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} />
    </div>
  );
}
