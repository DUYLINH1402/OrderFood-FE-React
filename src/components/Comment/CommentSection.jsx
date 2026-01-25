import React from "react";
import { toast } from "react-toastify";
import useComment, { COMMENT_TARGET_TYPES } from "../../hooks/useComment";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import CommentList from "./CommentList";
import CommentPagination from "./CommentPagination";

/**
 * Component chính cho hệ thống bình luận
 * Có thể tái sử dụng cho nhiều loại đối tượng: FOOD, BLOG, ...
 * @param {Object} props
 * @param {string} props.targetType - Loại đối tượng (FOOD, BLOG, ...)
 * @param {number} props.targetId - ID của đối tượng
 * @param {string} props.title - Tiêu đề section (mặc định: "Bình luận")
 * @param {number} props.pageSize - Số comment mỗi trang
 * @param {string} props.className - Custom class
 */
const CommentSection = ({
  targetType = COMMENT_TARGET_TYPES.FOOD,
  targetId,
  title = "Bình luận",
  pageSize = 10,
  className = "",
}) => {
  const {
    // State
    comments,
    isLoading,
    isSubmitting,
    error,

    // Pagination
    currentPage,
    totalComments,
    totalPages,
    hasNext,
    hasPrevious,

    // Reply
    replyingTo,
    setReplyingTo,
    expandedReplies,
    repliesData,
    loadingReplies,
    toggleReplies,

    // Edit
    editingComment,
    setEditingComment,

    // Actions
    addComment,
    editComment,
    removeComment,
    goToPage,
    refresh,
  } = useComment(targetType, targetId, pageSize);

  // Xử lý thêm comment mới
  const handleAddComment = async (content) => {
    try {
      await addComment(content);
      toast.success("Đã đăng bình luận thành công!");
    } catch (err) {
      const message = err?.response?.data?.message || "Không thể đăng bình luận. Vui lòng thử lại.";
      toast.error(message);
      throw err;
    }
  };

  // Xử lý reply
  const handleReply = (comment) => {
    setReplyingTo(comment);
    setEditingComment(null);
  };

  const handleSubmitReply = async (content) => {
    try {
      await addComment(content, replyingTo.id);
      toast.success("Đã trả lời bình luận!");
    } catch (err) {
      const message = err?.response?.data?.message || "Không thể trả lời. Vui lòng thử lại.";
      toast.error(message);
      throw err;
    }
  };

  // Xử lý edit
  const handleEdit = (comment) => {
    setEditingComment(comment);
    setReplyingTo(null);
  };

  const handleSubmitEdit = async (commentId, content, parentId) => {
    try {
      await editComment(commentId, content, parentId);
      toast.success("Đã cập nhật bình luận!");
    } catch (err) {
      const message = err?.response?.data?.message || "Không thể cập nhật. Vui lòng thử lại.";
      toast.error(message);
      throw err;
    }
  };

  // Xử lý xóa
  const handleDelete = async (commentId, parentId) => {
    try {
      await removeComment(commentId, parentId);
      toast.success("Đã xóa bình luận!");
    } catch (err) {
      const message = err?.response?.data?.message || "Không thể xóa. Vui lòng thử lại.";
      toast.error(message);
      throw err;
    }
  };

  if (!targetId) return null;

  return (
    <section className={`bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-comments text-green-600"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">
                {totalComments > 0
                  ? `${totalComments} bình luận`
                  : "Hãy là người đầu tiên bình luận!"}
              </p>
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={refresh}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50"
            title="Làm mới">
            <i className={`fas fa-sync-alt ${isLoading ? "fa-spin" : ""}`}></i>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-700">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Comment form */}
        <div className="mb-8">
          <CommentForm
            onSubmit={handleAddComment}
            placeholder="Chia sẻ suy nghĩ của bạn..."
            isSubmitting={isSubmitting && !replyingTo && !editingComment}
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sx text-gray-400 uppercase tracking-wider">
            {totalComments > 0 ? "Các bình luận" : "Chưa có bình luận"}
          </span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Comments list */}
        <CommentList comments={comments} isLoading={isLoading}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              // Reply
              onReply={handleReply}
              isReplying={replyingTo?.id === comment.id}
              onSubmitReply={handleSubmitReply}
              onCancelReply={() => setReplyingTo(null)}
              // Edit
              onEdit={handleEdit}
              isEditing={editingComment?.id === comment.id}
              onSubmitEdit={handleSubmitEdit}
              onCancelEdit={() => setEditingComment(null)}
              // Delete
              onDelete={handleDelete}
              // Submitting
              isSubmitting={isSubmitting}
              // Replies
              replyCount={comment.replyCount || 0}
              showReplies={expandedReplies[comment.id]}
              onToggleReplies={() => toggleReplies(comment.id)}
              loadingReplies={loadingReplies[comment.id]}
              replies={repliesData[comment.id]?.replies || []}
            />
          ))}
        </CommentList>

        {/* Pagination */}
        <CommentPagination
          currentPage={currentPage}
          totalPages={totalPages}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onPageChange={goToPage}
          isLoading={isLoading}
        />

        {/* Loading overlay for pagination */}
        {isLoading && comments.length > 0 && (
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2 text-gray-500">
              <i className="fas fa-circle-notch fa-spin"></i>
              <span className="text-sm">Đang tải...</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export { COMMENT_TARGET_TYPES };
export default CommentSection;
