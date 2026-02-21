import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getPointsHistory, getUserPoints } from "../../services/service/pointsService";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  Coins,
  AlertCircle,
  Info,
} from "lucide-react";
import LoadingIcon from "../../components/Skeleton/LoadingIcon";

const PointsTab = () => {
  // Helper: Loại giao dịch
  function getPointTypeLabel(type) {
    if (type === "EARN") return "Tích điểm";
    if (type === "USE") return "Sử dụng";
    return type;
  }

  // Helper: Hiển thị số điểm
  function getPointAmountDisplay(item) {
    if (typeof item.amount !== "number") return "0";
    if (item.type === "USE") {
      return item.amount < 0 ? item.amount.toLocaleString() : `-${item.amount.toLocaleString()}`;
    }
    return `+${item.amount.toLocaleString()}`;
  }

  const user = useSelector((state) => state.auth.user);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAllPoints = async () => {
      setLoading(true);
      setError("");
      try {
        if (user?.id) {
          const pointsRes = await getUserPoints();
          setCurrentPoints(pointsRes?.availablePoints || 0);
        }

        const historyRes = await getPointsHistory({
          page: currentPage - 1,
          limit: itemsPerPage,
        });
        console.log("Points history response:", historyRes);

        if (historyRes) {
          const arr = Array.isArray(historyRes.content) ? historyRes.content : [];
          setPointsHistory(arr);
          const pages =
            historyRes.totalPages || Math.ceil((historyRes.totalElements || 0) / itemsPerPage);
          setTotalPages(pages);
          setTotalItems(historyRes.totalElements || 0);
          if (arr.length === 0 && currentPage > 1) {
            setCurrentPage(pages);
          }
        }
      } catch (error) {
        setError("Lỗi tải lịch sử điểm");
        setPointsHistory([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchAllPoints();
  }, [user, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setLoading(true);
      setError("");
      getPointsHistory({ page: page - 1, limit: itemsPerPage })
        .then((historyRes) => {
          const arr = Array.isArray(historyRes.content) ? historyRes.content : [];
          setPointsHistory(arr);
          setTotalPages(
            historyRes.totalPages || Math.ceil((historyRes.totalElements || 0) / itemsPerPage)
          );
          setTotalItems(historyRes.totalElements || 0);
          setCurrentPage(page);
        })
        .catch((error) => {
          setError("Không thể tải dữ liệu trang này. Vui lòng thử lại hoặc chọn trang khác.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const isLastPage = currentPage === totalPages || pointsHistory.length < itemsPerPage;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} -{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} của {totalItems} giao dịch
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border transition-colors duration-200 ${
              currentPage === 1
                ? "text-gray-300 border-gray-200 cursor-not-allowed"
                : "text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}>
            <ChevronLeft className="w-6 h-6" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors duration-200 ${
                page === currentPage
                  ? "bg-green-600 text-white border-green-600"
                  : "text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}>
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={isLastPage}
            className={`p-2 rounded-lg border transition-colors duration-200 ${
              isLastPage
                ? "text-gray-300 border-gray-200 cursor-not-allowed"
                : "text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Điểm thưởng</h2>
            <p className="text-green-100 text-sm">Quản lý và theo dõi điểm tích lũy của bạn</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Điểm hiện tại */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 mb-6 border border-amber-200">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="p-4 bg-amber-100 rounded-full border-2 border-amber-200">
              <Coins className="w-8 h-8 text-amber-600" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="text-3xl font-bold text-green-700">
                {currentPoints.toLocaleString()} điểm
              </div>
              <div className="text-sm text-gray-600 mt-1">Điểm thưởng hiện có</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-amber-200 space-y-2">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Info className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" />
              <span>1.000 điểm = 1.000 VNĐ khi sử dụng thanh toán</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-amber-600">
              <Info className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" />
              <span>
                Mỗi đơn hàng thanh toán thành công sẽ được cộng điểm thưởng bằng 2% giá trị đơn hàng
              </span>
            </div>
          </div>
        </div>

        {/* Lịch sử điểm */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Lịch sử tích và sử dụng điểm</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <LoadingIcon size="24px" />
              <span className="ml-3">Đang tải lịch sử điểm...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 py-12 text-red-500">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          ) : !Array.isArray(pointsHistory) || pointsHistory.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Chưa có lịch sử điểm thưởng.</p>
            </div>
          ) : (
            <div className="w-full">
              {/* Mobile view */}
              <div className="block md:hidden space-y-3">
                {pointsHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sx font-medium bg-green-100 text-green-700">
                        {item.type === "EARN" ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                        {getPointTypeLabel(item.type)}
                      </span>
                      <span
                        className={`font-bold text-sm ${
                          item.type === "EARN" ? "text-green-600" : "text-red-500"
                        }`}>
                        {getPointAmountDisplay(item)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sx text-gray-500">
                      <Clock className="w-5 h-5" />
                      {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : ""}
                    </div>
                    {item.description && (
                      <div className="text-sx text-gray-400 mt-2 pt-2 border-t border-gray-100">
                        {item.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white border-b border-gray-200">
                      <th className="py-3 px-4 text-left font-medium text-gray-600">Thời gian</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600">
                        Loại giao dịch
                      </th>
                      <th className="py-3 px-4 text-right font-medium text-gray-600">Số điểm</th>
                      <th className="py-3 px-4 text-right font-medium text-gray-600">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pointsHistory.map((item, idx) => (
                      <tr
                        key={idx}
                        className="bg-white hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-3 px-4 text-gray-600">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : ""}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sx font-medium ${
                              item.type === "EARN"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-600"
                            }`}>
                            {item.type === "EARN" ? (
                              <TrendingUp className="w-5 h-5" />
                            ) : (
                              <TrendingDown className="w-5 h-5" />
                            )}
                            {getPointTypeLabel(item.type)}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-semibold ${
                            item.type === "EARN" ? "text-green-600" : "text-red-500"
                          }`}>
                          {getPointAmountDisplay(item)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-500">
                          {item.description || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {renderPagination()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PointsTab;
