import React, { useState } from "react";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
import { getToken } from "../../services/auth/authApi";
import { useSelector } from "react-redux";
import CommentForm from "./CommentForm";

/**
 * Component hiển thị một comment
 * @param {Object} props
 * @param {Object} props.comment - Dữ liệu comment
 * @param {Function} props.onReply - Callback khi click reply
 * @param {Function} props.onEdit - Callback khi edit
 * @param {Function} props.onDelete - Callback khi delete
 * @param {boolean} props.isReply - Là reply không
 * @param {boolean} props.isReplying - Đang reply comment này
 * @param {boolean} props.isEditing - Đang edit comment này
 * @param {boolean} props.isSubmitting - Đang submit
 * @param {Function} props.onSubmitReply - Submit reply
 * @param {Function} props.onSubmitEdit - Submit edit
 * @param {Function} props.onCancelReply - Hủy reply
 * @param {Function} props.onCancelEdit - Hủy edit
 * @param {number} props.replyCount - Số lượng reply
 * @param {boolean} props.showReplies - Đang hiển thị replies
 * @param {Function} props.onToggleReplies - Toggle hiển thị replies
 * @param {boolean} props.loadingReplies - Đang load replies
 * @param {Array} props.replies - Danh sách replies
 * @param {number} props.parentId - ID comment cha (nếu là reply)
 */
const CommentItem = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  isReply = false,
  isReplying = false,
  isEditing = false,
  isSubmitting = false,
  onSubmitReply,
  onSubmitEdit,
  onCancelReply,
  onCancelEdit,
  replyCount = 0,
  showReplies = false,
  onToggleReplies,
  loadingReplies = false,
  replies = [],
  parentId = null,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const token = getToken();
  const currentUser = useSelector((state) => state.auth.user);

  // Kiểm tra xem user hiện tại có phải chủ comment không
  const isOwner = currentUser && comment.user && currentUser.id === comment.user.id;

  // Xử lý xóa comment
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(comment.id, parentId);
      setShowDeleteConfirm(false);
    } catch (err) {
      // Error handled by parent
    } finally {
      setIsDeleting(false);
    }
  };

  // Format avatar - hiển thị chữ cái đầu nếu không có avatar
  const getAvatarContent = () => {
    if (comment.user?.avatarUrl) {
      return (
        <img
          src={comment.user.avatarUrl}
          alt={comment.user.fullName || "User"}
          className="w-full h-full object-cover"
        />
      );
    }
    const initial = (comment.user?.fullName || comment.user?.username || "U")[0].toUpperCase();
    return <span className="text-white font-semibold text-sm">{initial}</span>;
  };

  return (
    <div
      className={`group ${isReply ? "ml-12" : ""}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className={`flex-shrink-0 ${
            isReply ? "w-10 h-10" : "w-12 h-12"
          } rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center`}>
          {getAvatarContent()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">
              {comment.user?.fullName || comment.user?.username || "Người dùng"}
            </span>
            <span className="text-sx text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-sx text-gray-400 italic">(đã chỉnh sửa)</span>
            )}
          </div>

          {/* Content hoặc Edit form */}
          {isEditing ? (
            <div className="mt-2">
              <CommentForm
                onSubmit={(content) => onSubmitEdit(comment.id, content, parentId)}
                onCancel={onCancelEdit}
                initialValue={comment.content}
                submitText="Lưu"
                isSubmitting={isSubmitting}
                autoFocus
                isReply={isReply}
              />
            </div>
          ) : (
            <p className="text-gray-700 text-sm mt-1 leading-relaxed whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-4 mt-2">
              {/* Reply button - chỉ hiển thị cho comment gốc và khi đã đăng nhập */}
              {!isReply && token && (
                <button
                  onClick={() => onReply(comment)}
                  className="flex items-center gap-1.5 text-sx text-gray-500 hover:text-green-600 transition-colors">
                  <i className="fas fa-reply"></i>
                  <span>Trả lời</span>
                </button>
              )}

              {/* Toggle replies */}
              {!isReply && replyCount > 0 && (
                <button
                  onClick={onToggleReplies}
                  disabled={loadingReplies}
                  className="flex items-center gap-1.5 text-sx text-gray-500 hover:text-blue-600 transition-colors">
                  {loadingReplies ? (
                    <i className="fas fa-circle-notch fa-spin"></i>
                  ) : (
                    <i className={`fas fa-chevron-${showReplies ? "up" : "down"}`}></i>
                  )}
                  <span>
                    {showReplies ? "Ẩn" : "Xem"} {replyCount} phản hồi
                  </span>
                </button>
              )}

              {/* Edit/Delete - chỉ hiển thị cho chủ comment */}
              {isOwner && (
                <div
                  className={`flex items-center gap-3 transition-opacity duration-200 ${
                    showActions ? "opacity-100" : "opacity-0"
                  }`}>
                  <button
                    onClick={() => onEdit(comment)}
                    className="flex items-center gap-1.5 text-sx text-gray-500 hover:text-blue-600 transition-colors">
                    <i className="fas fa-edit"></i>
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 text-sx text-gray-500 hover:text-red-600 transition-colors">
                    <i className="fas fa-trash-alt"></i>
                    <span>Xóa</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700 mb-2">Bạn có chắc muốn xóa bình luận này?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-1.5 bg-red-600 text-white text-sx font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
                  {isDeleting ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin mr-1"></i>
                      Đang xóa...
                    </>
                  ) : (
                    "Xác nhận xóa"
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sx font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50">
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Reply form */}
          {isReplying && (
            <div className="mt-3">
              <CommentForm
                onSubmit={onSubmitReply}
                onCancel={onCancelReply}
                placeholder={`Trả lời ${comment.user?.fullName || "người dùng"}...`}
                submitText="Trả lời"
                isSubmitting={isSubmitting}
                autoFocus
                isReply
                replyToUser={comment.user?.fullName || comment.user?.username}
              />
            </div>
          )}

          {/* Replies list */}
          {showReplies && replies.length > 0 && (
            <div className="mt-4 space-y-4 border-l-2 border-gray-100 pl-4">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isReply
                  parentId={comment.id}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isEditing={isEditing && reply.id === comment.id}
                  isSubmitting={isSubmitting}
                  onSubmitEdit={onSubmitEdit}
                  onCancelEdit={onCancelEdit}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
