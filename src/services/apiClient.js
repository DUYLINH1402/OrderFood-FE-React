import axios from "axios";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Flag để tránh redirect liên tục khi token hết hạn
let isRedirectingToLogin = false;

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
      // Tránh redirect liên tục
      if (!isRedirectingToLogin) {
        isRedirectingToLogin = true;

        const errorCode = response.data?.errorCode;
        const errorMessage = response.data?.message || "";

        console.warn("Authentication failed - redirecting to login");

        // Hiển thị thông báo
        toast.error("Phiên đăng nhập đã hết hạn. Đang chuyển hướng đến trang đăng nhập...", {
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          toastId: "auth-redirect", // Tránh duplicate toast
        });

        // Cancel tất cả các API requests đang pending sẽ được xử lý bởi browser khi redirect

        // Dispatch custom event để các WebSocket services tự cleanup
        try {
          window.dispatchEvent(
            new CustomEvent("auth-logout", {
              detail: { reason: "token-expired" },
            })
          );
        } catch (eventError) {
          // Silent event errors
        }

        // Xóa tất cả dữ liệu xác thực
        try {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          localStorage.removeItem("cartItems");
          localStorage.removeItem("persist:root"); // Xóa Redux persist

          // Clear sessionStorage nếu có
          sessionStorage.clear();
        } catch (storageError) {
          console.warn("Error clearing storage:", storageError);
        }

        // Dispatch logout action
        try {
          store.dispatch(logout());
        } catch (logoutError) {
          console.warn("Lỗi khi dispatch logout:", logoutError);
        }

        // Redirect ngay lập tức với fallback
        const redirectToLogin = () => {
          try {
            // Thử dùng window.location.replace trước
            window.location.replace("/dang-nhap");
          } catch (replaceError) {
            console.warn("Replace failed, using href:", replaceError);
            // Fallback nếu replace không hoạt động
            window.location.href = "/dang-nhap";
          }
        };

        // Redirect ngay lập tức
        setTimeout(() => {
          isRedirectingToLogin = false; // Reset flag
          redirectToLogin();
        }, 1000);

        // Backup redirect sau 3 giây nếu chưa redirect
        setTimeout(() => {
          if (window.location.pathname !== "/dang-nhap") {
            console.warn("Backup redirect executing...");
            isRedirectingToLogin = false;
            redirectToLogin();
          }
        }, 3000);
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
