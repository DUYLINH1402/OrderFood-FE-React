import React from "react";
import { Modal } from "antd";
import "../../assets/styles/main.scss";
import momoIcon from "../../assets/icons/momo_icon.png";
import zaloPayIcon from "../../assets/icons/zalo_pay_icon.jpeg";
import visaIcon from "../../assets/icons/visa_icon.svg";
import LazyImage from "../../components/LazyImage";
import { LoadingButton } from "../../components/Skeleton/LoadingButton";

export default function PaymentMethodModal({
  isOpen,
  onClose,
  selectedPayment,
  setSelectedPayment,
  onConfirm,
  isPlacingOrder,
  user,
}) {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
      title={
        <h3 className="font-extrabold text-2xl md:text-3xl text-center tracking-tight text-gray-900 m-0">
          Chọn phương thức thanh toán
        </h3>
      }
      bodyStyle={{ padding: 0 }}
      destroyOnClose>
      <div className="flex flex-col gap-4 md:gap-6 mb-8 md:mb-10 mt-4 md:mt-6 p-4 md:p-8">
        <button
          className={`border rounded-xl px-4 md:px-6 py-4 md:py-5 font-semibold flex items-center gap-2 w-full justify-center text-base md:text-lg transition-all duration-150 ${
            selectedPayment === "COD"
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-gray-300 text-gray-400 opacity-60"
          }`}
          onClick={() => user && user.hasOrdered && setSelectedPayment("COD")}
          disabled={!(user && user.hasOrdered)}>
          <span className="text-sm md:text-base">Thanh toán khi nhận hàng (COD)</span>
          {!(user && user.hasOrdered) && (
            <span className="ml-2 text-xs md:text-sm text-gray-400 italic">
              (Chỉ áp dụng cho khách đã từng đặt hàng)
            </span>
          )}
        </button>
        <button
          className={`border rounded-xl px-4 md:px-6 py-4 md:py-5 font-semibold flex items-center gap-2 w-full justify-center text-base md:text-lg transition-all duration-150 ${
            selectedPayment === "MOMO"
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-gray-300"
          }`}
          onClick={() => setSelectedPayment("MOMO")}>
          <LazyImage
            src={momoIcon}
            alt="MoMo"
            className="w-9 h-9 md:w-8 md:h-8 object-contain mr-2"
          />
          <span className="text-sm md:text-base">Ví MoMo</span>
        </button>
        <button
          className={`border rounded-xl px-4 md:px-6 py-4 md:py-5 font-semibold flex items-center gap-2 w-full justify-center text-base md:text-lg transition-all duration-150 ${
            selectedPayment === "ZALOPAY"
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-gray-300"
          }`}
          onClick={() => setSelectedPayment("ZALOPAY")}>
          <LazyImage
            src={zaloPayIcon}
            alt="ZaloPay"
            className="w-12 h-12 md:w-12 md:h-12 object-contain mr-2"
          />
          <span className="text-sm md:text-base">ZaloPay</span>
        </button>
        <button
          className={`border rounded-xl px-4 md:px-6 py-4 md:py-5 font-semibold flex items-center gap-2 w-full justify-center text-base md:text-lg transition-all duration-150 ${
            selectedPayment === "BANK"
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-gray-300"
          }`}
          onClick={() => setSelectedPayment("BANK")}>
          <span className="flex items-center gap-2">
            <LazyImage
              src={visaIcon}
              alt="Visa"
              className="w-8 h-8 md:w-10 md:h-10 object-contain mr-1"
            />
          </span>
          <span className="text-sm md:text-base">Thẻ ngân hàng/ Visa (cổng ZaloPay)</span>
        </button>
      </div>
      <div className="flex gap-4 md:gap-6 justify-center mt-2 px-4 md:px-8 pb-4 md:pb-8">
        <LoadingButton
          isLoading={isPlacingOrder}
          className="text-sm md:text-base px-6 md:px-10 py-3 md:py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow transition-all duration-150 w-1/2"
          onClick={() => onConfirm(selectedPayment)}
          disabled={isPlacingOrder || (selectedPayment === "COD" && !(user && user.hasOrdered))}>
          Xác nhận
        </LoadingButton>
        <button
          className="text-sm md:text-base px-6 md:px-10 py-3 md:py-4 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold shadow transition-all duration-150 w-1/2"
          onClick={onClose}>
          Huỷ
        </button>
      </div>
    </Modal>
  );
}
