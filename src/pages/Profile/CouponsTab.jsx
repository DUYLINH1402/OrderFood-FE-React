import React, { useState, useEffect } from "react";
import { getUserCoupons, redeemCoupon } from "../../services/service/couponService";
import {
  Ticket,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Tag,
  Gift,
  Percent,
} from "lucide-react";
import LoadingIcon from "../../components/Skeleton/LoadingIcon";

function getStatusLabel(status) {
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sx font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-5 h-5" /> Còn hạn
        </span>
      );
    case "expiring":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sx font-medium bg-yellow-100 text-yellow-700">
          <Clock className="w-5 h-5" /> Sắp hết hạn
        </span>
      );
    case "used":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sx font-medium bg-gray-100 text-gray-500">
          <CheckCircle className="w-5 h-5" /> Đã dùng
        </span>
      );
    case "expired":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sx font-medium bg-red-100 text-red-600">
          <AlertCircle className="w-5 h-5" /> Hết hạn
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
  const [isRedeeming, setIsRedeeming] = useState(false);

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
    setIsRedeeming(true);
    try {
      await redeemCoupon(inputCode);
      setRedeemMsg("success");
      setInputCode("");
      const data = await getUserCoupons();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      setRedeemMsg("error");
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Mã giảm giá</h2>
            <p className="text-green-100 text-sm">Quản lý và sử dụng mã giảm giá của bạn</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Nhập mã giảm giá */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
          <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Gift className="w-6 h-6 text-green-600" />
            Nhập mã giảm giá
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              placeholder="Nhập mã giảm giá..."
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            />
            <button
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              onClick={handleRedeem}
              disabled={!inputCode || isRedeeming}>
              {isRedeeming ? <LoadingIcon size="16px" /> : <Tag className="w-6 h-6" />}
              Áp dụng
            </button>
          </div>
          {redeemMsg && (
            <div
              className={`mt-3 flex items-center gap-2 text-sm ${
                redeemMsg === "success" ? "text-green-600" : "text-red-500"
              }`}>
              {redeemMsg === "success" ? (
                <>
                  <CheckCircle className="w-6 h-6" />
                  Nhập mã thành công!
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6" />
                  Mã không hợp lệ hoặc đã được sử dụng.
                </>
              )}
            </div>
          )}
        </div>

        {/* Danh sách mã giảm giá */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
            <Ticket className="w-6 h-6 text-green-600" />
            Danh sách mã giảm giá ({coupons.length})
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <LoadingIcon size="24px" />
              <span className="ml-3">Đang tải mã giảm giá...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 py-12 text-red-500">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Bạn chưa có mã giảm giá nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className={`relative border-2 rounded-xl p-5 bg-white transition-all duration-200 hover:shadow-md ${
                    coupon.status === "USED" ? "opacity-60" : ""
                  } ${
                    coupon.status === "EXPIRED"
                      ? "border-red-200"
                      : coupon.status === "ACTIVE"
                      ? "border-green-200"
                      : "border-yellow-200"
                  }`}>
                  {/* Giá trị giảm giá nổi bật */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-lg font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 ${
                          coupon.discountType === "PERCENT"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                        {coupon.discountType === "PERCENT" ? <Percent className="w-6 h-6" /> : null}
                        {coupon.discountType === "PERCENT"
                          ? `-${coupon.discountValue}%`
                          : `-${coupon.discountValue.toLocaleString()}đ`}
                      </span>
                      <span className="text-sx text-gray-500">
                        {coupon.discountType === "PERCENT" ? "Giảm theo %" : "Giảm tiền mặt"}
                      </span>
                    </div>
                    {getStatusLabel(coupon.status?.toLowerCase())}
                  </div>

                  {/* Mã và copy */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-mono text-sm font-bold tracking-wider bg-gray-100 px-3 py-2 rounded-lg border border-dashed border-gray-300">
                      {coupon.code}
                    </span>
                    <button
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg border border-gray-200 hover:border-green-300 transition-all duration-200"
                      onClick={() => handleCopy(coupon.code)}
                      title="Copy mã">
                      <Copy className="w-6 h-6" />
                    </button>
                    {copied === coupon.code && (
                      <span className="text-sx text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-5 h-5" />
                        Đã copy!
                      </span>
                    )}
                  </div>

                  {/* Thông tin chi tiết */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-5 h-5" />
                      <span>Bắt đầu: {coupon.startDate?.slice(0, 10)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-5 h-5" />
                      <span>HSD: {coupon.endDate?.slice(0, 10)}</span>
                    </div>
                    <div className="text-gray-500">
                      <span className="text-gray-400">Tối đa:</span> {coupon.maxUsage}
                    </div>
                    <div className="text-gray-500">
                      <span className="text-gray-400">Đã dùng:</span> {coupon.usedCount}
                    </div>
                  </div>

                  {/* Mô tả */}
                  {coupon.description && (
                    <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 italic">
                      {coupon.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
