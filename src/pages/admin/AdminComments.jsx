import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getAdminComments,
  getAdminCommentsByStatus,
  getAdminCommentsByTarget,
  getAdminCommentsByUser,
  searchAdminComments,
  getAdminCommentStatistics,
  updateAdminCommentStatus,
  batchUpdateAdminCommentStatus,
  hardDeleteAdminComment,
  batchHardDeleteAdminComments,
  COMMENT_STATUS,
  COMMENT_STATUS_CONFIG,
  TARGET_TYPE_CONFIG,
} from "../../services/service/adminCommentService";
import CommentDetailModal from "./modal/CommentDetailModal";
import { useConfirm } from "../../components/ConfirmModal";

// Status options cho filter
const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Đang hiển thị" },
  { value: "HIDDEN", label: "Đã ẩn" },
  { value: "DELETED", label: "Đã xóa" },
];

// Target type options
const TARGET_TYPE_OPTIONS = [
  { value: "", label: "Tất cả loại" },
  { value: "FOOD", label: "Món ăn" },
  { value: "BLOG", label: "Bài viết" },
];

// Search type options
const SEARCH_TYPE_OPTIONS = [
  { value: "content", label: "Nội dung", placeholder: "Tìm theo nội dung bình luận..." },
  { value: "user", label: "Người dùng", placeholder: "Tìm theo tên người dùng..." },
];

const AdminComments = () => {
  const confirm = useConfirm();

  // State cho danh sách comments
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho thống kê
  const [statistics, setStatistics] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // State cho phân trang
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });

  // State cho filter/search
  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
    targetType: "",
    targetId: "",
    userId: "",
    userName: "", // Lưu tên user để hiển thị trong filter tag
  });

  // State cho search input (debounce)
  const [searchInput, setSearchInput] = useState("");

  // State cho loại tìm kiếm (content hoặc user)
  const [searchType, setSearchType] = useState("content");

  // State cho targetId input (debounce)
  const [targetIdInput, setTargetIdInput] = useState("");

  // State cho selected comments (batch operations)
  const [selectedIds, setSelectedIds] = useState([]);

  // State cho modal
  const [detailModal, setDetailModal] = useState({ open: false, commentId: null });

  // Fetch thống kê
  const fetchStatistics = useCallback(async () => {
    setLoadingStats(true);
    try {
      const response = await getAdminCommentStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.log("Lỗi khi tải thống kê:", error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch danh sách comments
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
      };

      let response;

      // Nếu có keyword thì tìm kiếm theo nội dung
      if (filters.keyword) {
        response = await searchAdminComments(filters.keyword, params);
      }
      // Nếu có filter theo user (click từ bảng)
      else if (filters.userId) {
        response = await getAdminCommentsByUser(filters.userId, params);
      }
      // Nếu có filter theo target cụ thể (targetType + targetId)
      else if (filters.targetType && filters.targetId) {
        response = await getAdminCommentsByTarget(filters.targetType, filters.targetId, params);
      }
      // Nếu có filter status thì lọc theo status
      else if (filters.status) {
        response = await getAdminCommentsByStatus(filters.status, params);
      }
      // Mặc định lấy tất cả
      else {
        response = await getAdminComments(params);
      }

      if (response.success && response.data) {
        let filteredComments = response.data.comments || [];

        // Lọc theo targetType nếu có (client-side filter)
        if (filters.targetType && !filters.targetId) {
          filteredComments = filteredComments.filter((c) => c.targetType === filters.targetType);
        }

        // Lọc theo tên người dùng nếu có userSearch (client-side filter)
        if (filters.userSearch) {
          const searchTerm = filters.userSearch.toLowerCase();
          filteredComments = filteredComments.filter((c) => {
            const fullName = (c.user?.fullName || "").toLowerCase();
            const username = (c.user?.username || "").toLowerCase();
            return fullName.includes(searchTerm) || username.includes(searchTerm);
          });
        }

        setComments(filteredComments);
        setPagination((prev) => ({
          ...prev,
          totalElements: filters.userSearch
            ? filteredComments.length
            : response.data.totalComments || 0,
          totalPages: filters.userSearch
            ? Math.ceil(filteredComments.length / pagination.size)
            : response.data.totalPages || 0,
        }));
      } else {
        toast.error(response.message || "Không thể tải danh sách bình luận");
      }
    } catch (error) {
      console.log("Lỗi khi tải danh sách bình luận:", error);
      toast.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, filters]);

  // Fetch khi mount và khi filters/pagination thay đổi
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Fetch thống kê khi mount
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Debounce search input - xử lý cả tìm theo nội dung và người dùng
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchType === "content") {
        // Tìm theo nội dung bình luận
        setFilters((prev) => ({ ...prev, keyword: searchInput, userId: "", userName: "" }));
      } else if (searchType === "user" && searchInput.trim()) {
        // Tìm theo tên người dùng - sẽ filter client-side sau khi fetch
        // Lưu searchInput vào một state riêng để filter
        setFilters((prev) => ({
          ...prev,
          keyword: "",
          userSearch: searchInput.trim(), // Thêm field mới cho việc filter theo user name
        }));
      } else {
        setFilters((prev) => ({ ...prev, keyword: "", userSearch: "" }));
      }
      setPagination((prev) => ({ ...prev, page: 0 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, searchType]);

  // Debounce targetId input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, targetId: targetIdInput }));
      setPagination((prev) => ({ ...prev, page: 0 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [targetIdInput]);

  // Xử lý thay đổi filter
  const handleFilterChange = (key, value) => {
    // Nếu đổi targetType, reset targetId
    if (key === "targetType" && value === "") {
      setTargetIdInput("");
      setFilters((prev) => ({ ...prev, [key]: value, targetId: "" }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
    setPagination((prev) => ({ ...prev, page: 0 }));
    setSelectedIds([]);
  };

  // Xử lý filter theo target từ bảng (click vào đối tượng)
  const handleFilterByTarget = (targetType, targetId) => {
    setFilters((prev) => ({
      ...prev,
      targetType,
      targetId: targetId.toString(),
      status: "",
      keyword: "",
      userSearch: "",
    }));
    setTargetIdInput(targetId.toString());
    setSearchInput("");
    setSearchType("content");
    setPagination((prev) => ({ ...prev, page: 0 }));
    setSelectedIds([]);
  };

  // Xử lý clear all filters
  const handleClearFilters = () => {
    setFilters({
      keyword: "",
      status: "",
      targetType: "",
      targetId: "",
      userId: "",
      userName: "",
      userSearch: "",
    });
    setSearchInput("");
    setTargetIdInput("");
    setSearchType("content");
    setPagination((prev) => ({ ...prev, page: 0 }));
    setSelectedIds([]);
  };

  // Xử lý filter theo user (click vào user trong bảng)
  const handleFilterByUser = (user) => {
    setFilters((prev) => ({
      ...prev,
      userId: user.id.toString(),
      userName: user.fullName || user.username || `User #${user.id}`,
      keyword: "",
      status: "",
      targetType: "",
      targetId: "",
      userSearch: "",
    }));
    setSearchInput("");
    setTargetIdInput("");
    setSearchType("content");
    setPagination((prev) => ({ ...prev, page: 0 }));
    setSelectedIds([]);
  };

  // Xử lý phân trang
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    setSelectedIds([]);
  };

  // Xử lý select comment
  const handleSelectComment = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Xử lý select all
  const handleSelectAll = () => {
    if (selectedIds.length === comments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(comments.map((c) => c.id));
    }
  };

  // Xử lý xem chi tiết
  const handleViewDetail = (commentId) => {
    setDetailModal({ open: true, commentId });
  };

  // Xử lý đóng modal
  const handleCloseDetailModal = () => {
    setDetailModal({ open: false, commentId: null });
  };

  // Xử lý thay đổi trạng thái single comment
  const handleChangeStatus = async (comment, newStatus) => {
    const statusLabel = COMMENT_STATUS_CONFIG[newStatus].label.toLowerCase();

    try {
      const response = await updateAdminCommentStatus(comment.id, newStatus);
      if (response.success) {
        toast.success(`Đã chuyển bình luận sang trạng thái "${statusLabel}"`);
        fetchComments();
        fetchStatistics();
      } else {
        toast.error(response.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.log("Lỗi khi cập nhật trạng thái:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật trạng thái");
    }
  };

  // Xử lý batch update status
  const handleBatchChangeStatus = (newStatus) => {
    if (selectedIds.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một bình luận");
      return;
    }

    const statusLabel = COMMENT_STATUS_CONFIG[newStatus].label.toLowerCase();

    confirm({
      title: "Xác nhận thay đổi trạng thái",
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn chuyển <strong>{selectedIds.length}</strong> bình luận sang trạng
            thái "{statusLabel}"?
          </p>
        </div>
      ),
      onOk: async () => {
        try {
          const response = await batchUpdateAdminCommentStatus(selectedIds, newStatus);
          if (response.success) {
            toast.success(
              response.data?.message || `Đã cập nhật ${selectedIds.length} bình luận thành công`
            );
            setSelectedIds([]);
            fetchComments();
            fetchStatistics();
          } else {
            toast.error(response.message || "Không thể cập nhật trạng thái hàng loạt");
          }
        } catch (error) {
          console.log("Lỗi khi cập nhật hàng loạt:", error);
          toast.error("Đã xảy ra lỗi khi cập nhật hàng loạt");
        }
      },
    });
  };

  // Xử lý xóa vĩnh viễn single comment
  const handleHardDelete = (comment) => {
    confirm({
      title: "Xác nhận xóa vĩnh viễn",
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa vĩnh viễn bình luận này?</p>
          <p className="text-red-500 text-sm mt-2">Hành động này không thể hoàn tác!</p>
        </div>
      ),
      onOk: async () => {
        try {
          const response = await hardDeleteAdminComment(comment.id);
          if (response.success) {
            toast.success("Đã xóa vĩnh viễn bình luận");
            fetchComments();
            fetchStatistics();
          } else {
            toast.error(response.message || "Không thể xóa bình luận");
          }
        } catch (error) {
          console.log("Lỗi khi xóa bình luận:", error);
          toast.error("Đã xảy ra lỗi khi xóa bình luận");
        }
      },
    });
  };

  // Xử lý batch delete
  const handleBatchHardDelete = () => {
    if (selectedIds.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một bình luận");
      return;
    }

    confirm({
      title: "Xác nhận xóa vĩnh viễn hàng loạt",
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn xóa vĩnh viễn <strong>{selectedIds.length}</strong> bình luận?
          </p>
          <p className="text-red-500 text-sm mt-2">Hành động này không thể hoàn tác!</p>
        </div>
      ),
      onOk: async () => {
        try {
          const response = await batchHardDeleteAdminComments(selectedIds);
          if (response.success) {
            toast.success(
              response.data?.message || `Đã xóa vĩnh viễn ${selectedIds.length} bình luận`
            );
            setSelectedIds([]);
            fetchComments();
            fetchStatistics();
          } else {
            toast.error(response.message || "Không thể xóa hàng loạt");
          }
        } catch (error) {
          console.log("Lỗi khi xóa hàng loạt:", error);
          toast.error("Đã xảy ra lỗi khi xóa hàng loạt");
        }
      },
    });
  };

  // Format thời gian
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const config = COMMENT_STATUS_CONFIG[status] || COMMENT_STATUS_CONFIG.ACTIVE;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${config.color}`}>
        <span className={`w-4 h-4 mr-1.5 rounded-full ${config.dotColor}`}></span>
        {config.label}
      </span>
    );
  };

  // Render target type badge
  const renderTargetTypeBadge = (targetType) => {
    const config = TARGET_TYPE_CONFIG[targetType] || {
      label: targetType,
      color: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Render avatar
  const renderAvatar = (comment) => {
    const user = comment.user || {};
    if (user.avatarUrl) {
      return (
        <img
          src={user.avatarUrl}
          alt={user.fullName || user.username}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
        <span className="text-indigo-600 text-sm font-medium">
          {(user.fullName || user.username)?.charAt(0)?.toUpperCase() || "?"}
        </span>
      </div>
    );
  };

  // Render statistics cards
  const renderStatistics = () => {
    if (loadingStats) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      );
    }

    if (!statistics) return null;

    const statCards = [
      {
        label: "Tổng bình luận",
        value: statistics.totalComments || 0,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
      },
      {
        label: "Đang hiển thị",
        value: statistics.activeComments || 0,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        label: "Đã ẩn",
        value: statistics.hiddenComments || 0,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      },
      {
        label: "Đã xóa",
        value: statistics.deletedComments || 0,
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
      {
        label: "Hôm nay",
        value: statistics.commentsToday || 0,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        label: "7 ngày qua",
        value: statistics.commentsLast7Days || 0,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
      {
        label: "30 ngày qua",
        value: statistics.commentsLast30Days || 0,
        color: "text-pink-600",
        bgColor: "bg-pink-50",
      },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-lg shadow p-4 transition-transform hover:scale-105`}>
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>
              {stat.value.toLocaleString("vi-VN")}
            </p>
          </div>
        ))}
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
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
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
                        ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
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
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
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

  // Render batch actions
  const renderBatchActions = () => {
    if (selectedIds.length === 0) return null;

    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm text-indigo-700 font-medium">
            Đã chọn {selectedIds.length} bình luận
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleBatchChangeStatus(COMMENT_STATUS.ACTIVE)}
            className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200">
            Hiển thị
          </button>
          <button
            onClick={() => handleBatchChangeStatus(COMMENT_STATUS.HIDDEN)}
            className="px-3 py-1.5 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200">
            Ẩn
          </button>
          <button
            onClick={() => handleBatchChangeStatus(COMMENT_STATUS.DELETED)}
            className="px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-100 rounded-md hover:bg-orange-200">
            Đánh dấu xóa
          </button>
          <button
            onClick={handleBatchHardDelete}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
            Xóa vĩnh viễn
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
            Bỏ chọn
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý bình luận</h1>
        <p className="text-sm text-gray-600 mt-1">Xem và quản lý tất cả bình luận trong hệ thống</p>
      </div>

      {/* Statistics */}
      {renderStatistics()}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            {/* Search with type selector */}
            <div className="lg:col-span-2">
              <div className="flex">
                {/* Search type dropdown */}
                <select
                  value={searchType}
                  onChange={(e) => {
                    setSearchType(e.target.value);
                    setSearchInput("");
                    setFilters((prev) => ({ ...prev, keyword: "", userId: "", userName: "" }));
                  }}
                  className="flex-shrink-0 inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  {SEARCH_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {/* Search input */}
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {searchType === "content" ? (
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
                    ) : (
                      <svg
                        className="h-6 w-6 text-gray-400"
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
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder={
                      SEARCH_TYPE_OPTIONS.find((o) => o.value === searchType)?.placeholder
                    }
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-r-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Status filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Target type filter */}
            <select
              value={filters.targetType}
              onChange={(e) => handleFilterChange("targetType", e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              {TARGET_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Second row: Target ID filter and active filters */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {/* Target ID input - chỉ hiện khi đã chọn targetType */}
            {filters.targetType && (
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">
                  ID {filters.targetType === "FOOD" ? "món ăn" : "bài viết"}:
                </label>
                <input
                  type="number"
                  placeholder="Nhập ID..."
                  value={targetIdInput}
                  onChange={(e) => setTargetIdInput(e.target.value)}
                  className="w-28 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  min="1"
                />
              </div>
            )}

            {/* Active filters display */}
            {(filters.keyword ||
              filters.status ||
              filters.targetType ||
              filters.targetId ||
              filters.userId ||
              filters.userSearch) && (
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm text-gray-500">Đang lọc:</span>

                {filters.keyword && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Từ khóa: "{filters.keyword}"
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setFilters((prev) => ({ ...prev, keyword: "" }));
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                )}

                {filters.userSearch && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800">
                    <svg
                      className="w-6 h-6 mr-1"
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
                    Tên: "{filters.userSearch}"
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setFilters((prev) => ({ ...prev, userSearch: "" }));
                      }}
                      className="ml-1 text-cyan-600 hover:text-cyan-800">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                )}

                {filters.userId && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    <svg
                      className="h-6 w-6 mr-1"
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
                    {filters.userName || `User #${filters.userId}`}
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, userId: "", userName: "" }))}
                      className="ml-1 text-purple-600 hover:text-purple-800">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                )}

                {filters.status && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      COMMENT_STATUS_CONFIG[filters.status]?.color || "bg-gray-100 text-gray-800"
                    }`}>
                    {COMMENT_STATUS_CONFIG[filters.status]?.label || filters.status}
                    <button
                      onClick={() => handleFilterChange("status", "")}
                      className="ml-1 hover:opacity-75">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                )}

                {filters.targetType && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      TARGET_TYPE_CONFIG[filters.targetType]?.color || "bg-gray-100 text-gray-800"
                    }`}>
                    {TARGET_TYPE_CONFIG[filters.targetType]?.label || filters.targetType}
                    {filters.targetId && ` #${filters.targetId}`}
                    <button
                      onClick={() => {
                        setTargetIdInput("");
                        setFilters((prev) => ({ ...prev, targetType: "", targetId: "" }));
                      }}
                      className="ml-1 hover:opacity-75">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                )}

                {/* Clear all button */}
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-red-600 hover:text-red-800 font-medium">
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Batch Actions */}
      {renderBatchActions()}

      {/* Comments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === comments.length && comments.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Nội dung
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Đối tượng
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="ml-3">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="h-8 bg-gray-200 rounded w-20 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Không có bình luận</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Không tìm thấy bình luận nào phù hợp với bộ lọc.
                    </p>
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(comment.id)}
                        onChange={() => handleSelectComment(comment.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => comment.user && handleFilterByUser(comment.user)}
                        className="flex items-center hover:bg-gray-100 rounded p-1 -m-1 transition-colors group"
                        title={`Lọc tất cả bình luận của ${
                          comment.user?.fullName || comment.user?.username || "người dùng này"
                        }`}
                        disabled={!comment.user}>
                        {renderAvatar(comment)}
                        <div className="ml-3 text-left">
                          <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                            {comment.user?.fullName || comment.user?.username || "Ẩn danh"}
                          </div>
                          <div className="text-sm text-gray-500 group-hover:text-indigo-500">
                            @{comment.user?.username || `ID: ${comment.user?.id}`}
                          </div>
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {comment.content}
                      </div>
                      {comment.parentId && (
                        <span className="text-sm text-gray-500">
                          Trả lời bình luận #{comment.parentId}
                        </span>
                      )}
                      {comment.replyCount > 0 && (
                        <span className="ml-2 text-sm text-indigo-600">
                          {comment.replyCount} phản hồi
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleFilterByTarget(comment.targetType, comment.targetId)}
                        className="flex flex-col space-y-1 text-left hover:bg-gray-100 rounded p-1 -m-1 transition-colors"
                        title={`Lọc tất cả bình luận của ${
                          TARGET_TYPE_CONFIG[comment.targetType]?.label || comment.targetType
                        } #${comment.targetId}`}>
                        {renderTargetTypeBadge(comment.targetType)}
                        <span className="text-sm text-indigo-600 hover:text-indigo-800">
                          #{comment.targetId}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {renderStatusBadge(comment.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateTime(comment.createdAt)}
                      </div>
                      {comment.updatedAt !== comment.createdAt && (
                        <div className="text-sm text-gray-500">
                          Sửa: {formatDateTime(comment.updatedAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Xem chi tiết */}
                        <button
                          onClick={() => handleViewDetail(comment.id)}
                          className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded hover:bg-indigo-50"
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

                        {/* Toggle hiển thị/ẩn */}
                        {comment.status === COMMENT_STATUS.ACTIVE ? (
                          <button
                            onClick={() => handleChangeStatus(comment, COMMENT_STATUS.HIDDEN)}
                            className="text-yellow-600 hover:text-yellow-900 p-1.5 rounded hover:bg-yellow-50"
                            title="Ẩn bình luận">
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleChangeStatus(comment, COMMENT_STATUS.ACTIVE)}
                            className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50"
                            title="Hiển thị bình luận">
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
                        )}

                        {/* Đánh dấu xóa */}
                        {comment.status !== COMMENT_STATUS.DELETED && (
                          <button
                            onClick={() => handleChangeStatus(comment, COMMENT_STATUS.DELETED)}
                            className="text-orange-600 hover:text-orange-900 p-1.5 rounded hover:bg-orange-50"
                            title="Đánh dấu xóa">
                            <svg
                              className="h-6 w-6"
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
                        )}

                        {/* Xóa vĩnh viễn */}
                        <button
                          onClick={() => handleHardDelete(comment)}
                          className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50"
                          title="Xóa vĩnh viễn">
                          <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
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

      {/* Modal */}
      <CommentDetailModal
        open={detailModal.open}
        commentId={detailModal.commentId}
        onClose={handleCloseDetailModal}
        onStatusChange={() => {
          fetchComments();
          fetchStatistics();
        }}
      />
    </div>
  );
};

export default AdminComments;
