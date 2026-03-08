import React, { useMemo, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GlassPageWrapper from "../../components/GlassPageWrapper";
import { updatePaymentStatus } from "../../services/service/paymentService";

// Component hiển thị icon thành công với animation
const SuccessIcon = () => (
  <div className="relative">
    {/* Vòng tròn pulse effect */}
    <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20"></div>
    <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
      <svg
        className="w-12 h-12 md:w-14 md:h-14 text-white animate-[checkmark_0.5s_ease-in-out_0.2s_forwards]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path
          d="M5 13l4 4L19 7"
          strokeDasharray="24"
          strokeDashoffset="24"
          style={{ animation: "dash 0.5s ease-in-out 0.3s forwards" }}
        />
      </svg>
    </div>
  </div>
);

// Component hiển thị icon thất bại với animation
const FailedIcon = () => (
  <div className="relative">
    <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20"></div>
    <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
      <svg
        className="w-12 h-12 md:w-14 md:h-14 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round">
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  </div>
);

// Component hiển thị icon đang xử lý
const ProcessingIcon = () => (
  <div className="relative">
    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
      <svg
        className="w-12 h-12 md:w-14 md:h-14 text-white animate-spin"
        fill="none"
        viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  </div>
);

function PaymentResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const [backendUpdateStatus, setBackendUpdateStatus] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Animation delay cho content
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Parse query params from ZaloPay callback
  const query = useMemo(() => {
    const params = new URLSearchParams(location.search);
    console.log("ZaloPay callback params:", Object.fromEntries(params.entries()));

    return {
      // ZaloPay redirect parameters
      appTransId: params.get("appTransId"),
      amount: params.get("amount"),
      appid: params.get("appid"),
      apptransid: params.get("apptransid"),
      bankcode: params.get("bankcode"),
      checksum: params.get("checksum"),
      discountamount: params.get("discountamount"),
      pmcid: params.get("pmcid"),
      status: params.get("status"), // Quan trọng: status < 0 = thất bại
      // Fallback fields
      orderId: params.get("orderId") || params.get("order_id"),
      message: params.get("message") || params.get("description"),
      paymentTime: params.get("paymentTime") || params.get("payment_time"),
      orderStatus: params.get("orderStatus") || params.get("order_status"),
      paymentMethod: params.get("paymentMethod") || params.get("payment_method"),
      paymentType: params.get("paymentType") || params.get("payment_type"),
    };
  }, [location.search]);

  // Xóa query params khỏi URL sau khi đã parse xong (giữ URL sạch)
  useEffect(() => {
    if (location.search) {
      // Dùng replaceState để thay đổi URL mà không reload trang và không thêm vào history
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location.pathname, location.search]);

  // Function để gọi API update payment status
  const updatePaymentStatusFromFrontend = async (
    appTransId,
    status,
    errorCode = null,
    errorMessage = null
  ) => {
    try {
      console.log("Updating payment status:", { appTransId, status, errorCode, errorMessage });

      const statusData = {
        appTransId: appTransId,
        status: status,
        errorCode: errorCode,
        errorMessage: errorMessage,
      };

      const result = await updatePaymentStatus(statusData);
      console.log("Backend update successful:", result);
      setBackendUpdateStatus("success");
      return true;
    } catch (error) {
      console.error("Error updating payment status:", error);
      setBackendUpdateStatus("error");
      return false;
    }
  };

  // Function để lấy error message từ status code
  const getErrorMessage = (status) => {
    const errorMessages = {
      "-4": "Giao dịch thất bại",
      "-5": "ZaloPay đang xử lý giao dịch",
      "-6": "Giao dịch không thành công",
      "-49": "Mã checksum không hợp lệ",
      "-53": "Số tiền vượt quá hạn mức",
      "-7": "Số dư tài khoản không đủ",
      "-8": "Thẻ bị khóa hoặc hết hạn",
    };
    return errorMessages[status] || "Lỗi thanh toán không xác định";
  };

  // Effect để xử lý kết quả thanh toán
  useEffect(() => {
    if (paymentProcessed || !query.appTransId) return;

    const processPaymentResult = async () => {
      setPaymentProcessed(true);

      // Kiểm tra status từ ZaloPay
      if (query.status && parseInt(query.status) < 0) {
        console.log("Payment failed with status:", query.status);
        const errorMessage = getErrorMessage(query.status);
        await updatePaymentStatusFromFrontend(
          query.appTransId,
          "FAILED",
          query.status,
          errorMessage
        );
      } else if (!query.status || query.status === "0") {
        // Không có status hoặc status = 0 có thể là thành công
        // Callback backend sẽ xử lý, chúng ta chờ một chút và có thể check
        console.log("Payment might be successful, waiting for backend callback...");

        // Có thể thêm logic để poll check payment status sau vài giây
        setTimeout(() => {
          setBackendUpdateStatus("success"); // Giả định thành công
        }, 2000);
      }
    };

    processPaymentResult();
  }, [query, paymentProcessed]);

  // Tắt scroll khi modal mở
  useEffect(() => {
    if (showLoginModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showLoginModal]);

  // Hàm đóng modal với animation
  const closeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setShowLoginModal(false);
      setIsModalClosing(false);
    }, 300);
  };

  // Xác định phương thức thanh toán
  const getPaymentMethodName = () => {
    if (query.paymentMethod) {
      return query.paymentMethod;
    }

    if (query.pmcid) {
      // Map ZaloPay payment method codes theo tài liệu chính thức
      const paymentMethods = {
        36: "Visa/Master/JCB",
        37: "Tài khoản ngân hàng",
        38: "Ví ZaloPay",
        39: "Thẻ ATM",
        41: "Visa/Master Debit",
      };
      return paymentMethods[query.pmcid] || "ZaloPay";
    }

    if (query.bankcode && query.bankcode !== "") {
      // Map bank codes to bank names
      const bankNames = {
        VCB: "Vietcombank",
        TCB: "Techcombank",
        VTB: "VietinBank",
        ACB: "ACB",
        BIDV: "BIDV",
        MB: "MB Bank",
        VP: "VPBank",
        SHB: "SHB",
        OCB: "OCB",
        MSB: "MSB",
      };
      return bankNames[query.bankcode] || query.bankcode;
    }

    return "ZaloPay";
  };

  // Format số tiền
  const formatAmount = (amount) => {
    if (!amount) return null;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Xác định trạng thái thanh toán và hiển thị
  const getPaymentResult = () => {
    // Nếu có status < 0 từ ZaloPay = thất bại
    if (query.status && parseInt(query.status) < 0) {
      return {
        type: "failed",
        title: "Thanh toán thất bại",
        description: query.message || getErrorMessage(query.status),
        subDescription: "Vui lòng thử lại hoặc chọn phương thức thanh toán khác",
        IconComponent: FailedIcon,
        bgGradient: "from-red-50 to-orange-50",
        borderColor: "border-red-200",
      };
    }

    // Nếu không có status hoặc status >= 0 = có thể thành công
    return {
      type: "success",
      title: "Thanh toán thành công",
      description: `Đơn hàng đã được thanh toán qua ${getPaymentMethodName()}`,
      subDescription: "Vui lòng chờ nhân viên xác nhận đơn hàng.",
      IconComponent: SuccessIcon,
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
    };
  };

  const paymentResult = getPaymentResult();

  // Extract orderId từ appTransId (format: yymmdd_orderId)
  const getOrderIdFromAppTransId = () => {
    if (query.appTransId) {
      const parts = query.appTransId.split("_");
      if (parts.length === 2) {
        return parts[1];
      }
    }
    return query.orderId;
  };

  const orderId = getOrderIdFromAppTransId();

  const { IconComponent } = paymentResult;

  return (
    <>
      <GlassPageWrapper>
        <div
          className={`flex flex-col items-center justify-center min-h-[70vh] px-4 transition-all duration-700 ease-out ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
          {/* Card chính */}
          <div
            className={`w-full max-w-md md:max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border ${paymentResult.borderColor} overflow-hidden`}>
            {/* Header với gradient */}
            <div
              className={`bg-gradient-to-br ${paymentResult.bgGradient} px-6 py-10 md:py-12 flex flex-col items-center`}>
              {/* Icon với animation */}
              <div className="mb-6">
                <IconComponent />
              </div>

              {/* Tiêu đề */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-3">
                {paymentResult.title}
              </h1>

              {/* Mô tả chính */}
              <p className="text-gray-600 text-center text-sm md:text-base max-w-sm">
                {paymentResult.description}
              </p>
            </div>

            {/* Thông tin chi tiết */}
            <div className="px-6 py-6 space-y-4">
              {/* Mô tả phụ */}
              <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{paymentResult.subDescription}</span>
              </div>

              {/* Thông tin đơn hàng nếu có */}
              {(orderId || query.amount) && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {orderId && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Mã đơn hàng</span>
                      <span className="font-semibold text-gray-800 text-sm bg-gray-200 px-3 py-1 rounded-lg">
                        #{orderId}
                      </span>
                    </div>
                  )}
                  {query.amount && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Số tiền</span>
                      <span className="font-bold text-green-600 text-base">
                        {formatAmount(query.amount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Phương thức</span>
                    <span className="text-gray-800 text-sm font-medium">
                      {getPaymentMethodName()}
                    </span>
                  </div>
                </div>
              )}

              {/* Hiển thị status đang xử lý */}
              {paymentProcessed &&
                backendUpdateStatus === null &&
                paymentResult.type === "failed" && (
                  <div className="flex items-center justify-center gap-2 bg-blue-50 rounded-xl p-3">
                    <svg
                      className="w-5 h-5 text-blue-500 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <span className="text-blue-600 text-sm">Đang cập nhật trạng thái...</span>
                  </div>
                )}

              {/* Nút hành động */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-lg shadow-green-500/25 hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:shadow-green-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm md:text-base"
                  onClick={() => navigate("/mon-an")}>
                  Tiếp tục mua sắm
                </button>
                <button
                  className="w-full py-3.5 rounded-xl bg-white text-green-600 border-2 border-green-500 font-semibold hover:bg-green-50 hover:border-green-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm md:text-base"
                  onClick={() => {
                    const accessToken = localStorage.getItem("accessToken");
                    if (accessToken) {
                      navigate("/ho-so?tab=orders");
                    } else {
                      localStorage.setItem("redirectAfterLogin", "/ho-so?tab=orders");
                      setShowLoginModal(true);
                    }
                  }}>
                  Xem đơn hàng
                </button>

                {paymentResult.type === "failed" && (
                  <button
                    className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline py-2 transition-colors"
                    onClick={() => window.open("tel:0123456789")}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    Liên hệ hỗ trợ
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-gray-400 text-sx mt-6 text-center max-w-sm">
            Mọi thắc mắc vui lòng liên hệ hotline{" "}
            <span className="text-green-600 font-medium">0988 62 66 00</span> để được hỗ trợ
          </p>
        </div>
      </GlassPageWrapper>

      {/* Modal thông báo cho người dùng chưa đăng nhập */}
      {(showLoginModal || isModalClosing) && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300 ease-in-out ${
            showLoginModal && !isModalClosing ? "opacity-100" : "opacity-0"
          }`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}>
          <div
            className={`w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-out overflow-hidden ${
              showLoginModal && !isModalClosing
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-8 opacity-0 scale-95"
            }`}>
            {/* Header với gradient */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 px-6 py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Theo dõi đơn hàng</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Đăng nhập để xem chi tiết và theo dõi tình trạng đơn hàng của bạn. Hoặc kiểm tra
                email để nhận thông tin cập nhật.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    closeModal();
                    setTimeout(() => navigate("/dang-nhap"), 300);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg shadow-green-500/25 hover:from-green-600 hover:to-green-700 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  Đăng nhập ngay
                </button>
                <button
                  onClick={closeModal}
                  className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  Để sau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS cho animation */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </>
  );
}

export default PaymentResultPage;
