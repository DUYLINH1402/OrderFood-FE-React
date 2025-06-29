import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GlassPageWrapper from "../../components/GlassPageWrapper";

function PaymentResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse query params
  const query = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      //   status: params.get("status"),
      status: "success",
      orderId: params.get("orderId"),
      message: params.get("message"),
    };
  }, [location.search]);

  // Nội dung hiển thị
  let title = "";
  let description = "";
  let icon = "";

  if (query.status === "success") {
    title = "Thanh toán thành công!";
    description = `Đơn hàng #${query.orderId} của bạn đã được thanh toán. Cảm ơn bạn đã đặt hàng!`;
    icon = (
      <svg className="w-16 h-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path stroke="currentColor" strokeWidth="2" d="M7 13l3 3 7-7" />
      </svg>
    );
  } else {
    title = "Thanh toán thất bại!";
    description =
      query.message ||
      "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.";
    icon = (
      <svg className="w-16 h-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path stroke="currentColor" strokeWidth="2" d="M15 9l-6 6M9 9l6 6" />
      </svg>
    );
  }

  return (
    <GlassPageWrapper>
      {icon}
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-600 mb-6 text-center text-sm md:text-base">{description}</p>
      <div className="flex flex-col gap-2 items-center">
        <div className="flex flex-col gap-3 mb-3 justify-center items-center">
          <button
            className="flex-1 min-w-[180px] px-8 py-3 rounded-xl bg-green-500 text-white font-semibold shadow-md hover:bg-green-600 transition-all text-sm md:text-base"
            onClick={() => navigate("/")}>
            Tiếp tục mua sắm
          </button>
          <button
            className="flex-1 min-w-[180px] px-8 py-3 rounded-xl bg-white text-green-600 border border-green-400 font-semibold shadow-md hover:bg-green-50 transition-all text-sm md:text-base"
            onClick={() => {
              if (query.orderId) {
                navigate(`/order/${query.orderId}`);
              } else {
                navigate("/ho-so");
              }
            }}>
            Xem đơn hàng
          </button>
        </div>
        {query.status !== "success" && (
          <button
            className="text-sm text-blue-600 hover:underline mt-1"
            onClick={() => window.open("tel:0123456789")}>
            Liên hệ hỗ trợ
          </button>
        )}
      </div>
    </GlassPageWrapper>
  );
}

export default PaymentResultPage;
