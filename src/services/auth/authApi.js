import { publicClient } from "../apiClient";

export const getToken = () => {
  const token = localStorage.getItem("accessToken");
  return token || null;
};

// API Login - dùng publicClient vì chưa có token
export const loginApi = async (loginData) => {
  try {
    const response = await publicClient.post("/api/v1/public/auth/login", loginData);
    return response.data;
  } catch (error) {
    const errorCode =
      error.response?.data?.errorCode || error.response?.data?.message || "Login failed";
    throw new Error(errorCode);
  }
};

/**
 * Đăng nhập bằng Google OAuth 2.0
 * Nhận id_token từ @react-oauth/google (GoogleLogin component) và gửi về Backend
 * Backend sẽ verify id_token với Google và lấy thông tin user
 * @param {string} idToken - ID Token (JWT) từ Google OAuth
 */
export const loginWithGoogleApi = async (idToken) => {
  try {
    // Gửi id_token về Backend để xác thực
    const response = await publicClient.post("/api/v1/public/auth/google", {
      idToken: idToken,
    });
    return response.data;
  } catch (error) {
    // Xử lý lỗi từ Backend
    const errorCode =
      error.response?.data?.errorCode || error.response?.data?.message || "GOOGLE_LOGIN_FAILED";
    throw new Error(errorCode);
  }
};

// API Register - dùng publicClient vì chưa có token
export const registerApi = async (registerData) => {
  try {
    const response = await publicClient.post("/api/v1/public/auth/register", registerData);
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
  const res = await publicClient.post("/api/v1/public/auth/forgot-password", { email });
  return res.data;
};

// API Đặt lại mật khẩu mới - dùng publicClient vì reset bằng token trong email
export const resetPasswordApi = async ({ token, newPassword }) => {
  const res = await publicClient.post("/api/v1/public/auth/reset-password", {
    token,
    newPassword,
  });
  return res.data;
};

// API Resend verification email - dùng publicClient
export const resendVerificationEmailApi = async (email) => {
  const res = await publicClient.post("/api/v1/public/auth/resend-verification", { email });
  return res.data;
};
