import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { loginSuccess } from "../../store/slices/authSlice";
import { setCartItems } from "../../store/slices/cartSlice";
import { getUserCart, syncCart } from "../../services/service/cartService";
import { getProfileApi } from "../../services/api/userApi";
import { ROLES } from "../../utils/roleConfig";
import { mapGoogleLoginError, mapFacebookLoginError } from "../../utils/authErrorMapper";

/**
 * Trang xử lý callback sau khi đăng nhập Google/Facebook qua Backend OAuth2
 */
export default function LoginSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  // Helper function để tạo delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const handleLoginCallback = async () => {
      const token = searchParams.get("token");
      const errorCode = searchParams.get("error");
      const provider = searchParams.get("provider"); // google hoặc facebook

      // QUAN TRỌNG: Xóa token khỏi thanh địa chỉ
      if (token || errorCode) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Xử lý lỗi - ánh xạ dựa trên provider
      if (errorCode) {
        let errorMessage;
        if (provider === "facebook") {
          errorMessage = mapFacebookLoginError(errorCode);
        } else {
          errorMessage = mapGoogleLoginError(errorCode);
        }
        setError(errorMessage);
        toast.error(errorMessage);
        setIsProcessing(false);
        setTimeout(() => {
          navigate("/dang-nhap");
        }, 3000);
        return;
      }

      if (!token) {
        setError("Không tìm thấy thông tin đăng nhập. Vui lòng thử lại.");
        setIsProcessing(false);
        return;
      }

      try {
        // Bước 1: Xác thực token (20%)
        setProgress(20);
        await delay(600);

        // Bước 2: Lưu token (40%)
        localStorage.setItem("accessToken", token);
        setProgress(40);
        await delay(500);

        // Bước 3: Lấy thông tin user (60%)
        const userData = await getProfileApi();
        setProgress(60);
        await delay(500);

        const userWithToken = {
          ...userData,
          token: token,
        };

        // Bước 4: Lưu user và cập nhật Redux (80%)
        localStorage.setItem("user", JSON.stringify(userWithToken));
        dispatch(loginSuccess({ user: userWithToken, accessToken: token }));
        setProgress(80);
        await delay(500);

        // Bước 5: Đồng bộ giỏ hàng (90%)
        const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
        if (cartItems.length > 0) {
          await syncCart(cartItems);
        }

        const serverCart = await getUserCart();
        dispatch(setCartItems(serverCart));
        setProgress(90);
        await delay(400);

        // Bước 6: Hoàn tất (100%)
        setProgress(100);
        await delay(800);

        // CHUYỂN SANG TRẠNG THÁI SUCCESS
        setIsProcessing(false);
        setIsCompleted(true);
        await delay(1500); // Hiển thị màn hình success 1.5 giây

        // Redirect
        const redirectPath = localStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          localStorage.removeItem("redirectAfterLogin");
          window.location.href = redirectPath;
        } else {
          const userRole = userWithToken.roleCode;
          if (userRole === ROLES.ADMIN) {
            window.location.href = "/admin/dashboard";
          } else if (userRole === ROLES.STAFF) {
            window.location.href = "/staff/dashboard";
          } else {
            navigate("/");
          }
        }
      } catch (err) {
        console.error("Lỗi xử lý token:", err);
        setError("Có lỗi xảy ra khi xử lý đăng nhập. Vui lòng thử lại.");
        toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
        setIsProcessing(false);
        setTimeout(() => {
          navigate("/dang-nhap");
        }, 3000);
      }
    };

    handleLoginCallback();
  }, [searchParams, navigate, dispatch]);

  const getProgressMessage = () => {
    if (progress < 40) return "Đang xác thực...";
    if (progress < 60) return "Đang tải thông tin người dùng...";
    if (progress < 80) return "Đang cập nhật dữ liệu...";
    if (progress < 90) return "Đang đồng bộ giỏ hàng...";
    if (progress < 100) return "Gần hoàn tất...";
    return "Hoàn tất! Đang chuyển hướng...";
  };

  return (
    <>
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes error-shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes check-draw {
          0% {
            stroke-dasharray: 0, 100;
          }
          100% {
            stroke-dasharray: 100, 0;
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-error-shake {
          animation: error-shake 0.5s ease-in-out;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }

        .animate-check-draw {
          animation: check-draw 0.5s ease-out 0.3s forwards;
          stroke-dasharray: 0, 100;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl max-w-[400px] w-full mx-4 border border-white/20">
          {/* PROCESSING STATE */}
          {isProcessing ? (
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-green-200 rounded-full absolute"></div>
                  <div className="w-24 h-24 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full animate-pulse flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Đăng nhập thành công!
              </h2>
              <p className="text-md text-gray-600 mb-6">Đang tải thông tin của bạn...</p>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mb-4">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${progress}%` }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>

              {/* Progress percentage */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-md text-gray-500">{getProgressMessage()}</p>
                <span className="text-md font-semibold text-green-600">{progress}%</span>
              </div>
            </div>
          ) : isCompleted ? (
            /* SUCCESS STATE - HIỂN THỊ SAU KHI HOÀN TẤT */
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-scale-in shadow-lg">
                    <svg
                      className="w-12 h-12 text-white animate-check-draw"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  {/* Success ripple */}
                  <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-20"></div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-3">Chào mừng trở lại!</h2>
              <p className="text-md text-green-600 font-medium mb-2">Đăng nhập thành công</p>
              <p className="text-md text-gray-500">Đang chuyển hướng đến trang chủ...</p>
            </div>
          ) : error ? (
            /* ERROR STATE */
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center animate-error-shake">
                    <svg
                      className="w-12 h-12 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping opacity-20"></div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-red-600 mb-3">Đăng nhập thất bại</h2>
              <p className="text-md text-gray-700 mb-6 leading-relaxed">{error}</p>

              <div className="flex items-center justify-center gap-2 text-gray-500">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}></div>
                <p className="ml-2 text-md">Đang chuyển hướng về trang đăng nhập</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
