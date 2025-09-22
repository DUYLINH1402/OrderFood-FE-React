import axios from "axios";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Tạo axios instance cho API cần authentication
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tạo axios instance cho API công khai (không cần token)
const publicClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Tránh request bị "treo" vô hạn
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor cho apiClient - thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log for debugging
    if (config.url && config.url.includes("/notifications/staff/")) {
      console.log("🔑 Staff notification API request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasToken: !!token,
        headers: config.headers,
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý token hết hạn
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    // Xử lý lỗi authentication (401, 403)
    if (response?.status === 401 || response?.status === 403) {
      const errorCode = response.data?.errorCode;
      // Kiểm tra nếu là JWT token expired/invalid
      if (
        errorCode === "JWT_TOKEN_EXPIRED" ||
        errorCode === "JWT_TOKEN_INVALID" ||
        response.status === 403
      ) {
        // Token hết hạn hoặc không hợp lệ - tự động đăng xuất
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", {
          autoClose: 5000, // Hiển thị 5 giây
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });

        // Xóa tất cả dữ liệu xác thực
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("cartItems");

        // Dispatch logout action
        store.dispatch(logout());

        // Delay để người dùng có thể đọc thông báo trước khi redirect
        setTimeout(() => {
          window.location.href = "/dang-nhap";
        }, 2000);
      } else {
        // Các lỗi 401 khác
        toast.error("Bạn không có quyền truy cập. Vui lòng đăng nhập!");
      }
    } else if (response?.status >= 500) {
      toast.error("Lỗi server. Vui lòng thử lại sau!");
    }

    return Promise.reject(error);
  }
);

// Response interceptor cho publicClient - xử lý lỗi server
publicClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response?.status >= 500) {
      toast.error("Lỗi server. Vui lòng thử lại sau!");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { publicClient, apiClient };
