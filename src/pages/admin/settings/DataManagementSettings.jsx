import React, { useState } from "react";
import {
  FiDatabase,
  FiSearch,
  FiRefreshCw,
  FiPlay,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiTrash2,
  FiHardDrive,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  reindexSearchData,
  initAlgoliaData,
  clearCache,
} from "../../../services/service/dataManagementService";
import {
  superAdminReindexSearchApi,
  superAdminInitAlgoliaApi,
} from "../../../services/api/superAdminApi";
import { useAuth } from "../../../hooks/auth/useAuth";
import { ROLES } from "../../../utils/roleConfig";

const DataManagementSettings = () => {
  const { userRole } = useAuth();
  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;
  // State cho các action
  const [loadingStates, setLoadingStates] = useState({
    reindex: false,
    init: false,
    clearCache: false,
  });

  const [results, setResults] = useState({
    reindex: null,
    init: null,
    clearCache: null,
  });

  // Hàm set loading cho từng action
  const setLoading = (action, isLoading) => {
    setLoadingStates((prev) => ({ ...prev, [action]: isLoading }));
  };

  // Hàm set kết quả cho từng action
  const setResult = (action, result) => {
    setResults((prev) => ({ ...prev, [action]: result }));
  };

  // Xử lý reindex dữ liệu tìm kiếm (Algolia)
  const handleReindex = async () => {
    setLoading("reindex", true);
    setResult("reindex", null);
    try {
      const response = await (isSuperAdmin ? superAdminReindexSearchApi() : reindexSearchData());
      setResult("reindex", { success: true, message: response });
      toast.success("Đã bắt đầu reindex dữ liệu tìm kiếm!");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi reindex";
      setResult("reindex", { success: false, message: errorMsg });
      toast.error(errorMsg);
    } finally {
      setLoading("reindex", false);
    }
  };

  // Xử lý khởi tạo dữ liệu Algolia
  const handleInitAlgolia = async () => {
    setLoading("init", true);
    setResult("init", null);
    try {
      const response = await (isSuperAdmin ? superAdminInitAlgoliaApi() : initAlgoliaData());
      setResult("init", {
        success: true,
        message: response.message,
        syncedFoods: response.syncedFoods,
      });
      toast.success(`Khởi tạo thành công! Đã đồng bộ ${response.syncedFoods} món ăn.`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi khởi tạo dữ liệu";
      setResult("init", { success: false, message: errorMsg });
      toast.error(errorMsg);
    } finally {
      setLoading("init", false);
    }
  };

  // Xử lý xóa cache
  const handleClearCache = async () => {
    setLoading("clearCache", true);
    setResult("clearCache", null);
    try {
      const response = await clearCache();
      setResult("clearCache", { success: true, message: response });
      toast.success("Đã xóa cache thành công!");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi xóa cache";
      setResult("clearCache", { success: false, message: errorMsg });
      toast.error(errorMsg);
    } finally {
      setLoading("clearCache", false);
    }
  };

  // Component hiển thị kết quả
  const ResultDisplay = ({ result }) => {
    if (!result) return null;

    return (
      <div
        className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
          result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
        {result.success ? (
          <FiCheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        ) : (
          <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        )}
        <div className="text-sm">
          <p>{result.message}</p>
          {result.syncedFoods !== undefined && (
            <p className="font-medium mt-1">Số món ăn đã đồng bộ: {result.syncedFoods}</p>
          )}
        </div>
      </div>
    );
  };

  // Component nút action
  const ActionButton = ({ onClick, loading, icon: Icon, label, variant = "primary" }) => {
    const baseClasses =
      "text-sm flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClasses = {
      primary: "bg-orange-500 text-white hover:bg-orange-600",
      danger: "bg-red-500 text-white hover:bg-red-600",
      secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    };

    return (
      <button
        onClick={onClick}
        disabled={loading}
        className={`${baseClasses} ${variantClasses[variant]}`}>
        {loading ? <FiLoader className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
        {loading ? "Đang xử lý..." : label}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Quản lý dữ liệu tìm kiếm (Algolia) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiSearch className="text-orange-500" />
          Quản lý dữ liệu tìm kiếm (Algolia)
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          Quản lý và đồng bộ dữ liệu tìm kiếm món ăn với Algolia để tối ưu trải nghiệm tìm kiếm.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Reindex dữ liệu */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <FiRefreshCw className="w-5 h-5 text-blue-500" />
              <h4 className="font-medium text-gray-800">Reindex dữ liệu</h4>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Đồng bộ lại toàn bộ dữ liệu món ăn từ database lên Algolia. Quá trình chạy ở chế độ
              nền (async).
            </p>
            <ActionButton
              onClick={handleReindex}
              loading={loadingStates.reindex}
              icon={FiRefreshCw}
              label="Reindex ngay"
              variant="secondary"
            />
            <ResultDisplay result={results.reindex} />
          </div>

          {/* Khởi tạo dữ liệu */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <FiPlay className="w-5 h-5 text-green-500" />
              <h4 className="font-medium text-gray-800">Khởi tạo dữ liệu</h4>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Xóa toàn bộ dữ liệu cũ và đẩy lại dữ liệu mới lên Algolia. Sử dụng khi cần setup lại
              hoàn toàn.
            </p>
            <ActionButton
              onClick={handleInitAlgolia}
              loading={loadingStates.init}
              icon={FiDatabase}
              label="Khởi tạo lại"
              variant="primary"
            />
            <ResultDisplay result={results.init} />
          </div>
        </div>
      </div>

      {/* Quản lý Cache */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiHardDrive className="text-orange-500" />
          Quản lý Cache
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          Xóa cache hệ thống để cập nhật dữ liệu mới nhất. Nên sử dụng khi dữ liệu hiển thị không
          đúng.
        </p>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <FiTrash2 className="w-5 h-5 text-red-500" />
            <h4 className="font-medium text-gray-800">Xóa cache</h4>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Xóa tất cả cache đang lưu trên server. Có thể ảnh hưởng đến hiệu năng trong thời gian
            ngắn.
          </p>
          <ActionButton
            onClick={handleClearCache}
            loading={loadingStates.clearCache}
            icon={FiTrash2}
            label="Xóa cache"
            variant="danger"
          />
          <ResultDisplay result={results.clearCache} />
        </div>
      </div>

      {/* Hướng dẫn sử dụng */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <FiAlertCircle className="text-blue-500" />
          Lưu ý quan trọng
        </h3>
        <ul className="text-sm text-blue-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>
              <strong>Reindex:</strong> Chạy ở chế độ nền, không ảnh hưởng đến hoạt động của
              website. Phù hợp khi cần cập nhật dữ liệu tìm kiếm định kỳ.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>
              <strong>Khởi tạo lại:</strong> Xóa toàn bộ dữ liệu cũ trên Algolia. Chỉ sử dụng khi
              thực sự cần thiết (setup hệ thống, sửa lỗi nghiêm trọng).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>
              <strong>Xóa cache:</strong> Có thể làm chậm hệ thống trong vài phút đầu sau khi xóa.
              Nên thực hiện vào giờ thấp điểm.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DataManagementSettings;
