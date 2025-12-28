import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getAdminEmployeesApi,
  deleteAdminEmployeeApi,
  updateAdminEmployeeStatusApi,
} from "../../services/api/adminEmployeeApi";
import StaffDetailModal from "./modal/StaffDetailModal";
import CreateStaffModal from "./modal/CreateStaffModal";
import EditStaffModal from "./modal/EditStaffModal";
import { useConfirm } from "../../components/ConfirmModal";

// Status config cho filter
const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "true", label: "Đang hoạt động" },
  { value: "false", label: "Đã khóa" },
];

// Hàm lấy màu badge theo trạng thái
const getStatusBadgeColor = (isActive) => {
  return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
};

const AdminStaff = () => {
  const confirm = useConfirm();

  // State cho danh sách staff
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho phân trang
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // State cho filter/search
  const [filters, setFilters] = useState({
    keyword: "",
    isActive: "",
    sortBy: "createdAt",
    sortDir: "desc",
  });

  // State cho search input (debounce)
  const [searchInput, setSearchInput] = useState("");

  // State cho modals
  const [detailModal, setDetailModal] = useState({ open: false, staffId: null });
  const [createModal, setCreateModal] = useState({ open: false });
  const [editModal, setEditModal] = useState({ open: false, staff: null });

  // Fetch danh sách staff
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
      };

      // Thêm các filter nếu có giá trị
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.isActive !== "") params.isActive = filters.isActive === "true";

      const response = await getAdminEmployeesApi(params);

      if (response.success && response.data) {
        setStaffList(response.data.content || []);
        setPagination((prev) => ({
          ...prev,
          totalElements: response.data.totalElements || 0,
          totalPages: response.data.totalPages || 0,
        }));
      } else {
        toast.error(response.message || "Không thể tải danh sách nhân viên");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách nhân viên:", error);
      toast.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, filters]);

  // Fetch khi mount và khi filters/pagination thay đổi
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, keyword: searchInput }));
      setPagination((prev) => ({ ...prev, page: 0 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Xử lý thay đổi filter
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  // Xử lý phân trang
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Xử lý xem chi tiết
  const handleViewDetail = (staffId) => {
    setDetailModal({ open: true, staffId });
  };

  // Xử lý mở modal tạo mới
  const handleOpenCreateModal = () => {
    setCreateModal({ open: true });
  };

  // Xử lý mở modal chỉnh sửa
  const handleOpenEditModal = (staff) => {
    setEditModal({ open: true, staff });
  };

  // Xử lý đóng modals
  const handleCloseDetailModal = () => {
    setDetailModal({ open: false, staffId: null });
  };

  const handleCloseCreateModal = () => {
    setCreateModal({ open: false });
  };

  const handleCloseEditModal = () => {
    setEditModal({ open: false, staff: null });
  };

  // Xử lý sau khi tạo/cập nhật thành công
  const handleSuccess = () => {
    fetchStaff();
  };

  // Xử lý xóa staff
  const handleDeleteStaff = (staff) => {
    confirm({
      title: "Xác nhận xóa nhân viên",
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn xóa nhân viên <strong>{staff.username}</strong>?
          </p>
          <p className="text-red-500 text-sm mt-2">Hành động này không thể hoàn tác!</p>
        </div>
      ),
      onOk: async () => {
        try {
          const response = await deleteAdminEmployeeApi(staff.id);
          if (response.success) {
            toast.success("Xóa nhân viên thành công");
            fetchStaff();
          } else {
            toast.error(response.message || "Không thể xóa nhân viên");
          }
        } catch (error) {
          console.error("Lỗi khi xóa nhân viên:", error);
          toast.error("Đã xảy ra lỗi khi xóa nhân viên");
        }
      },
    });
  };

  // Xử lý khóa/mở khóa staff
  const handleToggleStaffStatus = async (staff) => {
    const newStatus = !staff.active;
    const action = newStatus ? "mở khóa" : "khóa";

    try {
      const response = await updateAdminEmployeeStatusApi(staff.id, {
        isActive: newStatus,
      });

      if (response.success) {
        toast.success(`Đã ${action} tài khoản ${staff.username}`);
        fetchStaff();
      } else {
        toast.error(response.message || `Không thể ${action} tài khoản`);
      }
    } catch (error) {
      console.error(`Lỗi khi ${action} tài khoản:`, error);
      toast.error(`Đã xảy ra lỗi khi ${action} tài khoản`);
    }
  };

  // Render badge status
  const renderStatusBadge = (isActive) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusBadgeColor(
          isActive
        )}`}>
        {isActive ? "Hoạt động" : "Đã khóa"}
      </span>
    );
  };

  // Render avatar
  const renderAvatar = (staff) => {
    if (staff.avatarUrl) {
      return (
        <img
          src={staff.avatarUrl}
          alt={staff.fullName || staff.username}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
    );
  };

  // Render pagination
  const renderPagination = () => {
    const { page, totalPages, totalElements, size } = pagination;
    const startItem = page * size + 1;
    const endItem = Math.min((page + 1) * size, totalElements);

    if (totalElements === 0) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Trước
          </button>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Sau
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{startItem}</span> đến{" "}
              <span className="font-medium">{endItem}</span> trong{" "}
              <span className="font-medium">{totalElements}</span> kết quả
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="sr-only">Trước</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {/* Render page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (page < 3) {
                  pageNum = i;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pageNum === page
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}>
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="sr-only">Sau</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý nhân viên</h1>
          <p className="text-sm text-gray-600 mt-1">Quản lý tài khoản và phân quyền nhân viên</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg className="w-6 h-6 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Thêm nhân viên
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, SĐT..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Status filter */}
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange("isActive", e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${filters.sortBy}-${filters.sortDir}`}
              onChange={(e) => {
                const [sortBy, sortDir] = e.target.value.split("-");
                setFilters((prev) => ({ ...prev, sortBy, sortDir }));
              }}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option value="createdAt-desc">Mới nhất</option>
              <option value="createdAt-asc">Cũ nhất</option>
              <option value="username-asc">Tên A-Z</option>
              <option value="username-desc">Tên Z-A</option>
              <option value="lastLogin-desc">Đăng nhập gần đây</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sx font-medium text-gray-500 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sx font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sx font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-sx font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="ml-4">
                          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-base font-medium text-gray-900">Không có nhân viên</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Không tìm thấy nhân viên nào phù hợp với bộ lọc.
                    </p>
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {renderAvatar(staff)}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {staff.fullName || staff.username}
                          </div>
                          <div className="text-sm text-gray-500">@{staff.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{staff.email}</div>
                      <div className="text-sm text-gray-500">
                        {staff.phoneNumber || "Chưa có SĐT"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(staff.active)}
                      {staff.verified && (
                        <span className="ml-2 inline-flex items-center" title="Đã xác thực">
                          <svg
                            className="w-5 h-5 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Xem chi tiết */}
                        <button
                          onClick={() => handleViewDetail(staff.id)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Xem chi tiết">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>

                        {/* Chỉnh sửa */}
                        <button
                          onClick={() => handleOpenEditModal(staff)}
                          className="text-yellow-600 hover:text-yellow-900 p-1"
                          title="Chỉnh sửa">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>

                        {/* Khóa/Mở khóa */}
                        <button
                          onClick={() => handleToggleStaffStatus(staff)}
                          className={`p-1 ${
                            staff.active
                              ? "text-orange-600 hover:text-orange-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                          title={staff.active ? "Khóa tài khoản" : "Mở khóa tài khoản"}>
                          {staff.active ? (
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </button>

                        {/* Xóa */}
                        <button
                          onClick={() => handleDeleteStaff(staff)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Xóa nhân viên">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>

      {/* Modals */}
      <StaffDetailModal
        open={detailModal.open}
        staffId={detailModal.staffId}
        onClose={handleCloseDetailModal}
      />

      <CreateStaffModal
        open={createModal.open}
        onClose={handleCloseCreateModal}
        onSuccess={handleSuccess}
      />

      <EditStaffModal
        open={editModal.open}
        staff={editModal.staff}
        onClose={handleCloseEditModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default AdminStaff;
