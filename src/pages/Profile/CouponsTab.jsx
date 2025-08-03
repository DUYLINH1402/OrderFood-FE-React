import React, { useState, useEffect } from "react";
import { getUserCoupons, redeemCoupon } from "../../services/service/couponService";
import { FaRegCopy, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

function getStatusLabel(status) {
  switch (status) {
    case "active":
      return (
        <span className="text-green-600 flex items-center gap-1">
          <FaCheckCircle /> Còn hạn
        </span>
      );
    case "expiring":
      return (
        <span className="text-yellow-600 flex items-center gap-1">
          <FaExclamationCircle /> Sắp hết hạn
        </span>
      );
    case "used":
      return (
        <span className="text-gray-400 flex items-center gap-1">
          <FaCheckCircle /> Đã dùng
        </span>
      );
    case "expired":
      return (
        <span className="text-red-500 flex items-center gap-1">
          <FaExclamationCircle /> Hết hạn
        </span>
      );
    default:
      return null;
  }
}

export default function CouponsTab() {
  const [copied, setCopied] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [redeemMsg, setRedeemMsg] = useState("");

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getUserCoupons();
        setCoupons(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Không thể tải danh sách mã giảm giá.");
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(""), 1200);
  };

  const handleRedeem = async () => {
    setRedeemMsg("");
    try {
      await redeemCoupon(inputCode);
      setRedeemMsg("Nhập mã thành công!");
      setInputCode("");
      // Sau khi nhập mã, reload lại danh sách mã
      const data = await getUserCoupons();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      setRedeemMsg("Mã không hợp lệ hoặc đã được sử dụng.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-3 mb-4 w-full">
        <div className="flex flex-col w-full md:flex-row md:items-center gap-2">
          <input
            type="text"
            className="border-2 border-gray-200 rounded-xl px-3 py-2 h-[44px] w-full md:w-[320px] bg-gray-50 focus:outline-none focus:border-[#199b7e] text-sm md:text-base transition"
            placeholder="Nhập mã giảm giá..."
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
          />
          <button
            className="h-[44px] w-full md:w-auto px-4 md:px-6 font-bold rounded-xl bg-[#199b7e] text-white text-sm md:text-base shadow hover:bg-[#157c63] transition disabled:opacity-60"
            onClick={handleRedeem}
            disabled={!inputCode}>
            Nhập mã
          </button>
        </div>
        {/* Thông báo nhập mã nằm dưới ô nhập, căn giữa trên mobile, trái trên desktop */}
        {/* Kết thúc khối nhập mã, không cần thẻ đóng thừa */}
        {redeemMsg && (
          <div className="w-full text-center md:text-left">
            <span className="inline-block px-3 py-2 text-xs md:text-sm text-red-500 font-medium bg-red-50 rounded-lg">
              {redeemMsg}
            </span>
          </div>
        )}
      </div>
      {loading ? (
        <div className="text-center text-gray-500">Đang tải mã giảm giá...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500">Bạn chưa có mã giảm giá nào.</div>
          ) : (
            coupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`relative border-2 rounded-xl p-5 shadow-lg bg-white flex flex-col gap-3 transition hover:scale-[1.02] hover:shadow-xl
                  ${coupon.status === "USED" ? "opacity-60" : ""}
                  ${
                    coupon.status === "EXPIRED"
                      ? "border-red-400"
                      : coupon.status === "ACTIVE"
                      ? "border-green-500"
                      : "border-yellow-400"
                  }
                `}>
                {/* Giá trị giảm giá nổi bật */}
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`text-xl md:text-3xl font-extrabold px-3 md:px-4 py-1 md:py-2 rounded-lg shadow-sm
                    ${
                      coupon.discountType === "PERCENT"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  `}>
                    {coupon.discountType === "PERCENT"
                      ? `-${coupon.discountValue}%`
                      : `-${coupon.discountValue.toLocaleString()}đ`}
                  </span>
                  <span className="text-xs md:text-base text-gray-500 font-medium">
                    {coupon.discountType === "PERCENT" ? "Giảm theo %" : "Giảm tiền mặt"}
                  </span>
                  <span className="ml-auto">{getStatusLabel(coupon.status?.toLowerCase())}</span>
                </div>
                {/* Mã và copy */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm md:text-lg font-bold tracking-wider bg-gray-100 px-2 md:px-3 py-1 rounded-lg">
                    {coupon.code}
                  </span>
                  <button
                    className="ml-2 text-gray-500 hover:text-[#199b7e] p-2 rounded-full border border-gray-200 hover:border-[#199b7e] transition"
                    onClick={() => handleCopy(coupon.code)}
                    title="Copy mã">
                    <FaRegCopy />
                  </button>
                  {copied === coupon.code && (
                    <span className="text-xs text-green-600 ml-2">Đã copy!</span>
                  )}
                </div>
                {/* Thông tin chi tiết */}
                <div className="grid grid-cols-2 gap-2 text-sm md:text-sm mt-2">
                  <div>
                    <span className="text-gray-500">Bắt đầu:</span> {coupon.startDate?.slice(0, 10)}
                  </div>
                  <div>
                    <span className="text-gray-500">HSD:</span> {coupon.endDate?.slice(0, 10)}
                  </div>
                  <div>
                    <span className="text-gray-500">Tối đa:</span> {coupon.maxUsage}
                  </div>
                  <div>
                    <span className="text-gray-500">Đã dùng:</span> {coupon.usedCount}
                  </div>
                </div>
                {/* Mô tả */}
                <div className="text-gray-700 text-sm md:text-sm mt-2 italic">
                  {coupon.description}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
