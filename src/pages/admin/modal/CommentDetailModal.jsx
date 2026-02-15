import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getAdminCommentDetail,
  updateAdminCommentStatus,
  COMMENT_STATUS,
  COMMENT_STATUS_CONFIG,
  TARGET_TYPE_CONFIG,
} from "../../../services/service/adminCommentService";

const CommentDetailModal = ({ open, commentId, onClose, onStatusChange }) => {
  const [comment, setComment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fetch comment detail khi modal mở
  useEffect(() => {
    if (open && commentId) {
      fetchCommentDetail();
    }
  }, [open, commentId]);

  const fetchCommentDetail = async () => {
    setLoading(true);
    try {
      const response = await getAdminCommentDetail(commentId);
      if (response.success && response.data) {
        setComment(response.data);
      } else {
        toast.error(response.message || "Không thể tải chi tiết bình luận");
        onClose();
      }
    } catch (error) {
      console.log("Lỗi khi tải chi tiết bình luận:", error);
      toast.error("Đã xảy ra lỗi khi tải dữ liệu");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi trạng thái
  const handleChangeStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const response = await updateAdminCommentStatus(commentId, newStatus);
      if (response.success) {
        const statusLabel = COMMENT_STATUS_CONFIG[newStatus].label.toLowerCase();
        toast.success(`Đã chuyển bình luận sang trạng thái "${statusLabel}"`);
        setComment((prev) => ({ ...prev, status: newStatus }));
        onStatusChange?.();
      } else {
        toast.error(response.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.log("Lỗi khi cập nhật trạng thái:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  // Format thời gian
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const config = COMMENT_STATUS_CONFIG[status] || COMMENT_STATUS_CONFIG.ACTIVE;
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <span className={`w-2 h-2 mr-2 rounded-full ${config.dotColor}`}></span>
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
        className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Render avatar
  const renderAvatar = () => {
    const user = comment?.user || {};
    if (user.avatarUrl) {
      return (
        <img
          src={user.avatarUrl}
          alt={user.fullName || user.username}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
        />
      );
    }
    return (
      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-gray-200">
        <span className="text-indigo-600 text-xl font-bold">
          {(user.fullName || user.username)?.charAt(0)?.toUpperCase() || "?"}
        </span>
      </div>
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}></div>

        {/* Modal */}
        <div className="max-w-6xl relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full ">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Chi tiết bình luận</h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {loading ? (
              // Loading skeleton
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : comment ? (
              <div className="space-y-6">
                {/* User info */}
                <div className="flex items-start space-x-4">
                  {renderAvatar()}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {comment.user?.fullName || comment.user?.username || "Ẩn danh"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      @{comment.user?.username} (ID: {comment.user?.id})
                    </p>
                    <div className="mt-2">{renderStatusBadge(comment.status)}</div>
                  </div>
                </div>

                {/* Comment content */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Nội dung bình luận</h5>
                  <p className="text-sm italic text-gray-900 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>

                {/* Target info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Đối tượng</h5>
                    <div className="flex items-center space-x-2">
                      {renderTargetTypeBadge(comment.targetType)}
                      <span className="text-sm text-gray-600">ID: {comment.targetId}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Thông tin bổ sung</h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      {comment.parentId && <p>Trả lời bình luận: #{comment.parentId}</p>}
                      <p>Số phản hồi: {comment.replyCount || 0}</p>
                      <p>ID bình luận: #{comment.id}</p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Ngày tạo:</span>
                      <p className="text-gray-900 font-medium">
                        {formatDateTime(comment.createdAt)}
                      </p>
                    </div>
                    {comment.updatedAt !== comment.createdAt && (
                      <div>
                        <span className="text-gray-500">Cập nhật lần cuối:</span>
                        <p className="text-gray-900 font-medium">
                          {formatDateTime(comment.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Replies preview */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">
                      Các phản hồi ({comment.replies.length})
                    </h5>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="bg-gray-50 rounded-lg p-3 ml-4 border-l-2 border-indigo-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {reply.user?.fullName || reply.user?.username || "Ẩn danh"}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDateTime(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Thay đổi trạng thái</h5>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleChangeStatus(COMMENT_STATUS.ACTIVE)}
                      disabled={updating || comment.status === COMMENT_STATUS.ACTIVE}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        comment.status === COMMENT_STATUS.ACTIVE
                          ? "bg-green-100 text-green-800 cursor-default"
                          : "bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
                      }`}>
                      <div className="flex items-center">
                        <svg
                          className="w-6 h-6 mr-1.5"
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
                        Hiển thị
                      </div>
                    </button>

                    <button
                      onClick={() => handleChangeStatus(COMMENT_STATUS.HIDDEN)}
                      disabled={updating || comment.status === COMMENT_STATUS.HIDDEN}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        comment.status === COMMENT_STATUS.HIDDEN
                          ? "bg-yellow-100 text-yellow-800 cursor-default"
                          : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 disabled:opacity-50"
                      }`}>
                      <div className="flex items-center">
                        <svg
                          className="w-6 h-6 mr-1.5"
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
                        Ẩn
                      </div>
                    </button>

                    <button
                      onClick={() => handleChangeStatus(COMMENT_STATUS.DELETED)}
                      disabled={updating || comment.status === COMMENT_STATUS.DELETED}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        comment.status === COMMENT_STATUS.DELETED
                          ? "bg-red-100 text-red-800 cursor-default"
                          : "bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                      }`}>
                      <div className="flex items-center">
                        <svg
                          className="w-6 h-6 mr-1.5"
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
                        Đánh dấu xóa
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Không tìm thấy bình luận</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentDetailModal;
