import { publicClient } from "../apiClient";

export const getToken = () => {
  const token = localStorage.getItem("accessToken");
  return token || null;
};

// API Login - dùng publicClient vì chưa có token
export const loginApi = async (loginData) => {
  try {
    const response = await publicClient.post("/api/auth/login", loginData);
    return response.data;
  } catch (error) {
    const errorCode =
      error.response?.data?.errorCode || error.response?.data?.message || "Login failed";
    throw new Error(errorCode);
  }
};

// API Register - dùng publicClient vì chưa có token
export const registerApi = async (registerData) => {
  try {
    const response = await publicClient.post("/api/auth/register", registerData);
    return response.data;
  } catch (error) {
    toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
    const errorCode =
      error.response?.data?.errorCode || error.response?.data?.message || "Register failed";
    throw new Error(errorCode);
  }
};

// API ForgotPassword Password - dùng publicClient vì chưa cần đăng nhập
export const sendForgotPasswordEmailApi = async (email) => {
  const res = await publicClient.post("/api/auth/forgot-password", { email });
  return res.data;
};

// API Đặt lại mật khẩu mới - dùng publicClient vì reset bằng token trong email
export const resetPasswordApi = async ({ token, newPassword }) => {
  const res = await publicClient.post("/api/auth/reset-password", {
    token,
    newPassword,
  });
  return res.data;
};

// API Resend verification email - dùng publicClient
export const resendVerificationEmailApi = async (email) => {
  const res = await publicClient.post("/api/auth/resend-verification", { email });
  return res.data;
};
