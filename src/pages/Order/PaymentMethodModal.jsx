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
      styles={{ body: { padding: 0 } }}
      destroyOnClose>
      <div className="flex flex-col gap-3 mb-6 mt-4 p-6">
        <button
          className={`border rounded-xl px-6 py-4 font-semibold flex items-center justify-center w-full text-base transition-all duration-150 ${
            selectedPayment === "COD"
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-gray-300 text-gray-400 opacity-60"
          }`}
          onClick={() => user && user.hasOrdered && setSelectedPayment("COD")}
          disabled={!(user && user.hasOrdered)}>
          <div className="flex flex-col items-center text-center w-full">
            <span className="text-sm md:text-base font-medium">Thanh toán khi nhận hàng (COD)</span>
            <span className="text-xs md:text-sm text-gray-400 italic mt-1">
              (Chỉ áp dụng cho khách đã từng đặt hàng)
            </span>
          </div>
        </button>

        <button
          className={`border rounded-xl px-6 py-4 font-semibold flex items-center justify-center w-full text-base transition-all duration-150 ${
            selectedPayment === "MOMO"
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-gray-300"
          }`}
          onClick={() => setSelectedPayment("MOMO")}>
          <LazyImage src={momoIcon} alt="MoMo" className="w-8 h-8 object-contain mr-3" />
          <span className="text-sm md:text-base">Ví MoMo</span>
        </button>

        <button
          className={`border rounded-xl px-6 py-4 font-semibold flex items-center justify-center w-full text-base transition-all duration-150 ${
            selectedPayment === "ZALOPAY"
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-gray-300"
          }`}
          onClick={() => setSelectedPayment("ZALOPAY")}>
          <LazyImage src={zaloPayIcon} alt="ZaloPay" className="w-8 h-8 object-contain mr-3" />
          <span className="text-sm md:text-base">Ví ZaloPay</span>
        </button>

        <button
          className={`border rounded-xl px-6 py-4 font-semibold flex items-center justify-center w-full text-base transition-all duration-150 ${
            selectedPayment === "ATM"
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-gray-300"
          }`}
          onClick={() => setSelectedPayment("ATM")}>
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
            <span className="text-white text-xs font-bold">ATM</span>
          </div>
          <span className="text-sm md:text-base">Thẻ ATM (qua Cổng ZaloPay)</span>
        </button>

        <button
          className={`border rounded-xl px-6 py-4 font-semibold flex items-center justify-center w-full text-base transition-all duration-150 ${
            selectedPayment === "VISA"
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-gray-300"
          }`}
          onClick={() => setSelectedPayment("VISA")}>
          <LazyImage src={visaIcon} alt="Visa" className="w-8 h-8 object-contain mr-3" />
          <span className="text-sm md:text-base">Visa, Master, JCB (qua Cổng ZaloPay)</span>
        </button>
      </div>
      <div className="flex gap-3 justify-center px-6 pb-6">
        <LoadingButton
          isLoading={isPlacingOrder}
          className="flex-1 text-sm md:text-base px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow transition-all duration-150"
          onClick={() => onConfirm(selectedPayment)}
          disabled={
            isPlacingOrder ||
            !selectedPayment ||
            (selectedPayment === "COD" && !(user && user.hasOrdered))
          }>
          Xác nhận
        </LoadingButton>
        <button
          className="flex-1 text-sm md:text-base px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold shadow transition-all duration-150"
          onClick={onClose}>
          Huỷ
        </button>
      </div>
    </Modal>
  );
}
