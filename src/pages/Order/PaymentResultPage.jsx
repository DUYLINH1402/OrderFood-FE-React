import React, { useMemo, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GlassPageWrapper from "../../components/GlassPageWrapper";
import { updatePaymentStatus } from "../../services/service/paymentService";

function PaymentResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const [backendUpdateStatus, setBackendUpdateStatus] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

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
        37: "Bank Account",
        38: "ZaloPay",
        39: "ATM",
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

  // Xác định trạng thái thanh toán và hiển thị
  const getPaymentResult = () => {
    // Nếu có status < 0 từ ZaloPay = thất bại
    if (query.status && parseInt(query.status) < 0) {
      return {
        type: "failed",
        title: "Thanh toán thất bại!",
        description: query.message || getErrorMessage(query.status),
        icon: (
          <svg className="w-16 h-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path stroke="currentColor" strokeWidth="2" d="M15 9l-6 6M9 9l6 6" />
          </svg>
        ),
      };
    }

    // Nếu không có status hoặc status >= 0 = có thể thành công
    // (backend callback sẽ xử lý update)
    return {
      type: "success",
      title: "Thanh toán thành công!",
      description: `Đơn hàng đã thanh toán thành công qua ${getPaymentMethodName()}. 
      Vui lòng chờ nhân viên xác nhận!`,
      icon: (
        <svg className="w-16 h-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path stroke="currentColor" strokeWidth="2" d="M7 13l3 3 7-7" />
        </svg>
      ),
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

  return (
    <>
      <GlassPageWrapper>
        {paymentResult.icon}
        <h1 className="text-2xl font-bold mb-2">{paymentResult.title}</h1>
        <p className="text-gray-600 mb-6 text-center text-sm md:text-base">
          {paymentResult.description}
        </p>

        {/* Hiển thị status backend update nếu đang xử lý */}
        {paymentProcessed && backendUpdateStatus === null && paymentResult.type === "failed" && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm">
            <p className="text-blue-600">Đang cập nhật trạng thái đơn hàng...</p>
          </div>
        )}

        <div className="flex flex-col gap-2 items-center">
          <div className="flex flex-col gap-3 mb-3 justify-center items-center">
            <button
              className="flex-1 min-w-[180px] px-8 py-3 rounded-xl bg-green-500 text-white font-semibold shadow-md hover:bg-green-600 transition-all text-sm md:text-base"
              onClick={() => navigate("/mon-an")}>
              Tiếp tục mua sắm
            </button>
            <button
              className="flex-1 min-w-[180px] px-8 py-3 rounded-xl bg-white text-green-600 border border-green-400 font-semibold shadow-md hover:bg-green-50 transition-all text-sm md:text-base"
              onClick={() => {
                const accessToken = localStorage.getItem("accessToken");
                if (accessToken) {
                  navigate("/ho-so?tab=orders");
                } else {
                  // Lưu thông tin redirect để sau khi đăng nhập sẽ chuyển đến tab orders
                  localStorage.setItem("redirectAfterLogin", "/ho-so?tab=orders");
                  setShowLoginModal(true);
                }
              }}>
              Xem đơn hàng
            </button>
          </div>
          {paymentResult.type === "failed" && (
            <button
              className="text-sm text-blue-600 hover:underline mt-1"
              onClick={() => window.open("tel:0123456789")}>
              Liên hệ hỗ trợ
            </button>
          )}
        </div>
      </GlassPageWrapper>

      {/* Modal thông báo cho người dùng chưa đăng nhập */}
      {(showLoginModal || isModalClosing) && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-300 ease-in-out ${
            showLoginModal && !isModalClosing ? "bg-opacity-40" : "bg-opacity-0"
          }`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}>
          <div
            className={`w-full max-w-md tablet:max-w-lg laptop:max-w-xl mx-4 bg-white rounded-2xl p-6 tablet:p-8 laptop:p-10 shadow-2xl transform transition-all duration-300 ease-out ${
              showLoginModal && !isModalClosing
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-16 opacity-0 scale-95"
            }`}>
            <div className="text-center">
              <div className="w-20 h-20 tablet:w-22 tablet:h-22 laptop:w-24 laptop:h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6 tablet:mb-7 laptop:mb-8">
                <svg
                  className="w-10 h-10 tablet:w-11 tablet:h-11 laptop:w-12 laptop:h-12 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg tablet:text-xl font-bold text-gray-900 mb-4">
                Theo dõi đơn hàng
              </h3>
              <p className="text-gray-600 mb-10 text-md tablet:text-base leading-relaxed max-w-md mx-auto">
                Bạn có thể theo dõi tình trạng đơn hàng qua email hoặc đăng nhập để xem chi tiết đơn
                hàng.
              </p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    closeModal();
                    setTimeout(() => navigate("/dang-nhap"), 300);
                  }}
                  className="px-8 tablet:px-10 py-3 tablet:py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 text-md tablet:text-base shadow-lg hover:shadow-xl transform hover:scale-105">
                  Đăng nhập
                </button>
                <button
                  onClick={closeModal}
                  className="px-8 tablet:px-10 py-3 tablet:py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 text-md tablet:text-base">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PaymentResultPage;
