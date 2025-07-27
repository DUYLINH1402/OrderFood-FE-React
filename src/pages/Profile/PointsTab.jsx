import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { getPointsHistory, getUserPoints } from "../../services/service/pointsService";

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
      // Nếu đã là số âm thì giữ nguyên, nếu là số dương thì thêm dấu trừ
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
  const itemsPerPage = 10; // Số item mỗi trang

  useEffect(() => {
    const fetchAllPoints = async () => {
      setLoading(true);
      setError("");
      try {
        // Lấy điểm hiện tại
        if (user?.id) {
          const pointsRes = await getUserPoints();
          setCurrentPoints(pointsRes?.availablePoints || 0);
        }

        // Lấy lịch sử điểm với phân trang
        const historyRes = await getPointsHistory({
          page: currentPage - 1,
          limit: itemsPerPage,
        });
        console.log("Points history response:", historyRes);

        if (historyRes) {
          // Đảm bảo luôn là mảng, lấy từ content (chuẩn backend)
          const arr = Array.isArray(historyRes.content) ? historyRes.content : [];
          setPointsHistory(arr);
          const pages =
            historyRes.totalPages || Math.ceil((historyRes.totalElements || 0) / itemsPerPage);
          setTotalPages(pages);
          setTotalItems(historyRes.totalElements || 0);
          // Nếu trang hiện tại trả về rỗng và không phải trang đầu, tự động quay về trang cuối có dữ liệu
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

  // Pagination handlers
  const handlePageChange = (page) => {
    // Chỉ cho phép chuyển trang từ 1 đến totalPages
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

    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Disable nút Next nếu là trang cuối hoặc số bản ghi < itemsPerPage
    const isLastPage = currentPage === totalPages || pointsHistory.length < itemsPerPage;
    return (
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="text-sm text-gray-500">
          Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} -{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} của {totalItems} giao dịch
        </div>

        <div className="flex items-center gap-1">
          {/* Nút Previous */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-2 py-1 rounded border text-sm ${
              currentPage === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}>
            <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
          </button>

          {/* Hiển thị các trang hợp lệ */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded border text-sm ${
                page === currentPage
                  ? "bg-green-600 text-white border-green-600"
                  : "text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}>
              {page}
            </button>
          ))}

          {/* Nút Next */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={isLastPage}
            className={`px-2 py-1 rounded border text-sm ${
              isLastPage
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}>
            <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full text-sm tablet:text-md laptop:text-base">
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-2 w-full">
        <div className="bg-yellow-100 rounded-full p-3 border border-yellow-300 flex-shrink-0">
          <FontAwesomeIcon icon={faTrophy} style={{ color: "#199b7e", width: 32, height: 32 }} />
        </div>
        <div className="flex flex-col items-center sm:items-start w-full">
          <div className="text-xl font-bold text-green-700">
            {currentPoints.toLocaleString()} điểm
          </div>
          <div className="text-sm tablet:text-md laptop:text-base text-gray-500">
            Điểm thưởng hiện có
          </div>
          <div className="mt-1">
            <span className="text-gray-400">* 1.000 điểm = 1.000 VNĐ khi sử dụng thanh toán</span>
            <br />
            <span className="text-orange-500">
              * Mỗi đơn hàng thanh toán thành công sẽ được cộng điểm thưởng bằng 2% giá trị đơn hàng
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-full">
        <div className="flex items-center gap-2 mb-3">
          <FontAwesomeIcon icon={faTrophy} style={{ color: "#199b7e", width: 20, height: 20 }} />
          <span className="font-semibold text-gray-800">Lịch sử tích và sử dụng điểm</span>
        </div>

        {loading ? (
          <div className="text-gray-500 py-6 text-center animate-pulse">
            Đang tải lịch sử điểm...
          </div>
        ) : error ? (
          <div className="text-red-500 py-6 text-center">Lỗi tải lịch sử điểm: {error}</div>
        ) : !Array.isArray(pointsHistory) || pointsHistory.length === 0 ? (
          <div className="text-gray-500 py-6 text-center">Chưa có lịch sử điểm thưởng.</div>
        ) : (
          <div className="w-full">
            {/* Responsive table: mobile dùng flex, desktop dùng table */}
            <div className="block md:hidden">
              <div className="flex flex-col gap-2">
                {Array.isArray(pointsHistory) &&
                  pointsHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg border border-gray-200 p-3 flex flex-col gap-1 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-green-700">
                          {getPointTypeLabel(item.type)}
                        </span>
                        <span
                          className={`font-bold ${
                            item.type === "EARN" ? "text-green-700" : "text-red-500"
                          }`}>
                          {getPointAmountDisplay(item)}
                        </span>
                      </div>
                      <div className="text-sm tablet:text-md laptop:text-base text-gray-500">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : ""}
                      </div>
                      {item.description && (
                        <div className="text-sm tablet:text-md laptop:text-base text-gray-400">
                          {item.description}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="hidden md:block">
              <table className="min-w-[400px] w-full text-sm tablet:text-md laptop:text-base border rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-3 text-left">Thời gian</th>
                    <th className="py-2 px-3 text-left">Loại giao dịch</th>
                    <th className="py-2 px-3 text-right">Số điểm</th>
                    <th className="py-2 px-3 text-right">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(pointsHistory) &&
                    pointsHistory.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="py-2 px-3">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : ""}
                        </td>
                        <td className="py-2 px-3">{getPointTypeLabel(item.type)}</td>
                        <td
                          className={`py-2 px-3 text-right font-semibold ${
                            item.type === "EARN" ? "text-green-700" : "text-red-500"
                          }`}>
                          {getPointAmountDisplay(item)}
                        </td>
                        <td className="py-2 px-3 text-right">{item.description || ""}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsTab;
