import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getToken = () => {
  const token = localStorage.getItem("accessToken");
  return token || null;
};

// API Login
export const loginApi = async (loginData) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return await response.json(); // trả về token hoặc user info
};

// API Register
export const registerApi = async (registerData) => {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Register failed");
  }

  return await response.json();
};

// API ForgotPassword Password (nhập email để gửi email reset mật khẩu)
export const sendForgotPasswordEmailApi = async (email) => {
  const res = await axios.post(`${BASE_URL}/api/auth/forgot-password`, { email });
  return res.data;
};

// API Đặt lại mật khẩu mới
export const resetPasswordApi = async ({ token, newPassword }) => {
  const res = await axios.post(`${BASE_URL}/api/auth/reset-password`, {
    token,
    newPassword,
  });
  return res.data;
};
