import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getAdminContactsApi,
  getContactsByStatusApi,
  searchContactsApi,
  updateContactStatusApi,
  deleteContactApi,
  getPendingContactsCountApi,
  getContactStatisticsApi,
} from "../../services/api/contactApi";
import ContactDetailModal from "./modal/ContactDetailModal";
import ContactReplyModal from "./modal/ContactReplyModal";
import { useConfirm } from "../../components/ConfirmModal";
import { formatRelativeTime } from "../../utils/formatRelativeTime";

// Cấu hình trạng thái tin nhắn
const STATUS_CONFIG = {
  PENDING: {
    label: "Chưa đọc",
    color: "bg-yellow-100 text-yellow-800",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  READ: {
    label: "Đã đọc",
    color: "bg-blue-100 text-blue-800",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    ),
  },
  REPLIED: {
    label: "Đã phản hồi",
    color: "bg-green-100 text-green-800",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
  },
  ARCHIVED: {
    label: "Đã lưu trữ",
    color: "bg-gray-100 text-gray-800",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
      />
    ),
  },
};

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chưa đọc" },
  { value: "READ", label: "Đã đọc" },
  { value: "REPLIED", label: "Đã phản hồi" },
  { value: "ARCHIVED", label: "Đã lưu trữ" },
];

const AdminContacts = () => {
  const confirm = useConfirm();

  // State cho danh sách tin nhắn
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  // State cho phân trang
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // State cho filter/search
  const [filters, setFilters] = useState({
    status: "",
    keyword: "",
    sortBy: "createdAt",
    sortDir: "desc",
  });

  // State cho search input (debounce)
  const [searchInput, setSearchInput] = useState("");

  // State cho modals
  const [detailModal, setDetailModal] = useState({ open: false, contactId: null });
  const [replyModal, setReplyModal] = useState({ open: false, contact: null });

  // State cho thống kê
  const [statistics, setStatistics] = useState(null);

  // Fetch số tin nhắn pending
  const fetchPendingCount = useCallback(async () => {
    const response = await getPendingContactsCountApi();
    if (response.success) {
      setPendingCount(response.count);
    }
  }, []);

  // Fetch danh sách tin nhắn
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
      };

      let response;

      // Tìm kiếm theo keyword
      if (filters.keyword) {
        response = await searchContactsApi(filters.keyword, params);
      }
      // Lọc theo trạng thái
      else if (filters.status) {
        response = await getContactsByStatusApi(filters.status, params);
      }
      // Lấy tất cả
      else {
        response = await getAdminContactsApi(params);
      }

      if (response.success && response.data) {
        setContacts(response.data.content || []);
        setPagination((prev) => ({
          ...prev,
          totalElements: response.data.totalElements || 0,
          totalPages: response.data.totalPages || 0,
        }));
      } else {
        toast.error(response.message || "Không thể tải danh sách tin nhắn");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách tin nhắn:", error);
      toast.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, filters]);

  // Fetch khi mount và khi filters/pagination thay đổi
  useEffect(() => {
    fetchContacts();
    fetchPendingCount();
  }, [fetchContacts, fetchPendingCount]);

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

  // Xử lý xem chi tiết và đánh dấu đã đọc
  const handleViewDetail = async (contact) => {
    setDetailModal({ open: true, contactId: contact.id });

    // Tự động đánh dấu đã đọc nếu đang ở trạng thái PENDING
    if (contact.status === "PENDING") {
      await updateContactStatusApi(contact.id, { status: "READ" });
      fetchContacts();
      fetchPendingCount();
    }
  };

  // Xử lý mở modal phản hồi
  const handleOpenReplyModal = (contact) => {
    setReplyModal({ open: true, contact });
  };

  // Xử lý đóng modals
  const handleCloseDetailModal = () => {
    setDetailModal({ open: false, contactId: null });
  };

  const handleCloseReplyModal = () => {
    setReplyModal({ open: false, contact: null });
  };

  // Xử lý cập nhật trạng thái
  const handleUpdateStatus = async (contact, newStatus) => {
    const statusLabel = STATUS_CONFIG[newStatus]?.label || newStatus;

    const confirmed = await confirm({
      title: "Xác nhận thay đổi trạng thái",
      message: `Bạn có chắc muốn chuyển tin nhắn sang trạng thái "${statusLabel}"?`,
      confirmText: "Xác nhận",
      cancelText: "Hủy",
    });

    if (!confirmed) return;

    const response = await updateContactStatusApi(contact.id, { status: newStatus });
    if (response.success) {
      toast.success("Cập nhật trạng thái thành công");
      fetchContacts();
      fetchPendingCount();
    } else {
      toast.error(response.message);
    }
  };

  // Xử lý xóa tin nhắn
  const handleDelete = async (contact) => {
    if (contact.status !== "ARCHIVED") {
      toast.warning("Chỉ có thể xóa tin nhắn đã lưu trữ");
      return;
    }

    const confirmed = await confirm({
      title: "Xác nhận xóa",
      message: `Bạn có chắc muốn xóa tin nhắn từ "${contact.name}"? Hành động này không thể hoàn tác.`,
      confirmText: "Xóa",
      cancelText: "Hủy",
      type: "danger",
    });

    if (!confirmed) return;

    const response = await deleteContactApi(contact.id);
    if (response.success) {
      toast.success("Xóa tin nhắn thành công");
      fetchContacts();
    } else {
      toast.error(response.message);
    }
  };

  // Xử lý sau khi phản hồi thành công
  const handleReplySuccess = () => {
    fetchContacts();
    fetchPendingCount();
    handleCloseReplyModal();
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${config.color}`}>
        <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {config.icon}
        </svg>
        {config.label}
      </span>
    );
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tin nhắn liên hệ</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý và phản hồi tin nhắn từ khách hàng
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                {pendingCount} chưa đọc
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Chưa đọc</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Tổng tin nhắn</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.totalElements}</p>
            </div>
          </div>
        </div>

        <div
          className="text-sm bg-white rounded-xl p-4 border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleFilterChange("status", "READ")}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100">
              <svg
                className="w-6 h-6 text-indigo-600"
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
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Cần phản hồi</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleFilterChange("status", "REPLIED")}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Đã phản hồi</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
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
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm kiếm theo tên, email, nội dung..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Refresh Button */}
            <button
              onClick={() => {
                fetchContacts();
                fetchPendingCount();
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Làm mới
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            renderSkeleton()
          ) : contacts.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">Không có tin nhắn nào</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Người gửi
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Chủ đề
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      contact.status === "PENDING" ? "bg-[#e8cdd380]" : ""
                    }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {contact.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                          <div className="text-sm text-gray-500">{contact.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {contact.subject || "(Không có chủ đề)"}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {contact.message}
                      </div>
                    </td>
                    <td className="text-sm px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(contact.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatRelativeTime(contact.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* View Detail */}
                        <button
                          onClick={() => handleViewDetail(contact)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Xem chi tiết">
                          <svg
                            className="h-6 w-6"
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

                        {/* Reply */}
                        {contact.status !== "ARCHIVED" && (
                          <button
                            onClick={() => handleOpenReplyModal(contact)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Phản hồi">
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                              />
                            </svg>
                          </button>
                        )}

                        {/* Status Actions Dropdown */}
                        <div className="relative group">
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </button>
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <div className="py-1">
                              {contact.status !== "READ" && (
                                <button
                                  onClick={() => handleUpdateStatus(contact, "READ")}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                                  <svg
                                    className="h-6 w-6 mr-2 text-blue-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  Đánh dấu đã đọc
                                </button>
                              )}
                              {contact.status !== "ARCHIVED" && (
                                <button
                                  onClick={() => handleUpdateStatus(contact, "ARCHIVED")}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                                  <svg
                                    className="h-6 w-6 mr-2 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                    />
                                  </svg>
                                  Lưu trữ
                                </button>
                              )}
                              {contact.status === "ARCHIVED" && (
                                <button
                                  onClick={() => handleDelete(contact)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center">
                                  <svg
                                    className="h-6 w-6 mr-2"
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
                                  Xóa vĩnh viễn
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Hiển thị {pagination.page * pagination.size + 1} -{" "}
              {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} trong{" "}
              {pagination.totalElements} tin nhắn
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 0}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                Trước
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, idx) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = idx;
                } else if (pagination.page < 3) {
                  pageNum = idx;
                } else if (pagination.page > pagination.totalPages - 4) {
                  pageNum = pagination.totalPages - 5 + idx;
                } else {
                  pageNum = pagination.page - 2 + idx;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      pagination.page === pageNum
                        ? "bg-indigo-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}>
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ContactDetailModal
        open={detailModal.open}
        contactId={detailModal.contactId}
        onClose={handleCloseDetailModal}
        onReply={(contact) => {
          handleCloseDetailModal();
          handleOpenReplyModal(contact);
        }}
      />

      <ContactReplyModal
        open={replyModal.open}
        contact={replyModal.contact}
        onClose={handleCloseReplyModal}
        onSuccess={handleReplySuccess}
      />
    </div>
  );
};

export default AdminContacts;
