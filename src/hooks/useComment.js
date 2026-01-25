import { useState, useEffect, useCallback } from "react";
import {
  getComments,
  getReplies,
  createComment,
  updateComment,
  deleteComment,
  COMMENT_TARGET_TYPES,
} from "../services/service/commentService";
import { getToken } from "../services/auth/authApi";

/**
 * Custom hook để quản lý hệ thống bình luận
 * @param {string} targetType - Loại đối tượng (FOOD, BLOG, ...)
 * @param {number} targetId - ID của đối tượng
 * @param {number} pageSize - Số comment mỗi trang
 * @returns {Object} - Các state và function quản lý comment
 */
const useComment = (targetType, targetId, pageSize = 10) => {
  // State chính
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Reply state
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [repliesData, setRepliesData] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});

  // Edit state
  const [editingComment, setEditingComment] = useState(null);

  /**
   * Fetch danh sách comment
   */
  const fetchComments = useCallback(
    async (page = 0) => {
      if (!targetId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await getComments(targetType, targetId, page, pageSize);
        setComments(data.comments || []);
        setTotalComments(data.totalComments || 0);
        setTotalPages(data.totalPages || 0);
        setCurrentPage(data.currentPage || 0);
        setHasNext(data.hasNext || false);
        setHasPrevious(data.hasPrevious || false);
      } catch (err) {
        setError("Không thể tải bình luận. Vui lòng thử lại sau.");
        console.log("Lỗi khi tải bình luận:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [targetType, targetId, pageSize]
  );

  /**
   * Fetch replies của một comment
   */
  const fetchReplies = useCallback(async (commentId, page = 0) => {
    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));

    try {
      const data = await getReplies(commentId, page, 20);
      setRepliesData((prev) => ({
        ...prev,
        [commentId]: {
          replies: data.comments || [],
          hasNext: data.hasNext || false,
          currentPage: data.currentPage || 0,
        },
      }));
      setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
    } catch (err) {
      console.log("Lỗi khi tải replies:", err);
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  }, []);

  /**
   * Toggle hiển thị replies
   */
  const toggleReplies = useCallback(
    (commentId) => {
      if (expandedReplies[commentId]) {
        // Ẩn replies
        setExpandedReplies((prev) => ({ ...prev, [commentId]: false }));
      } else {
        // Hiển thị và fetch nếu chưa có
        if (!repliesData[commentId]) {
          fetchReplies(commentId);
        } else {
          setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
        }
      }
    },
    [expandedReplies, repliesData, fetchReplies]
  );

  /**
   * Thêm bình luận mới
   */
  const addComment = useCallback(
    async (content, parentId = null) => {
      const token = getToken();
      if (!token) {
        throw new Error("Vui lòng đăng nhập để bình luận");
      }

      setIsSubmitting(true);
      try {
        const newComment = await createComment({
          content,
          targetType,
          targetId,
          parentId,
        });

        if (parentId) {
          // Nếu là reply, cập nhật vào repliesData
          setRepliesData((prev) => ({
            ...prev,
            [parentId]: {
              ...prev[parentId],
              replies: [newComment, ...(prev[parentId]?.replies || [])],
            },
          }));
          // Cập nhật replyCount của comment cha
          setComments((prev) =>
            prev.map((c) => (c.id === parentId ? { ...c, replyCount: (c.replyCount || 0) + 1 } : c))
          );
          // Mở replies nếu chưa mở
          setExpandedReplies((prev) => ({ ...prev, [parentId]: true }));
        } else {
          // Nếu là comment mới, thêm vào đầu danh sách
          setComments((prev) => [newComment, ...prev]);
          setTotalComments((prev) => prev + 1);
        }

        setReplyingTo(null);
        return newComment;
      } catch (err) {
        console.log("Lỗi khi thêm bình luận:", err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [targetType, targetId]
  );

  /**
   * Sửa bình luận
   */
  const editComment = useCallback(async (commentId, content, parentId = null) => {
    setIsSubmitting(true);
    try {
      const updatedComment = await updateComment(commentId, content);

      if (parentId) {
        // Nếu là reply
        setRepliesData((prev) => ({
          ...prev,
          [parentId]: {
            ...prev[parentId],
            replies: prev[parentId]?.replies.map((r) => (r.id === commentId ? updatedComment : r)),
          },
        }));
      } else {
        // Nếu là comment gốc
        setComments((prev) => prev.map((c) => (c.id === commentId ? updatedComment : c)));
      }

      setEditingComment(null);
      return updatedComment;
    } catch (err) {
      console.log("Lỗi khi sửa bình luận:", err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /**
   * Xóa bình luận
   */
  const removeComment = useCallback(async (commentId, parentId = null) => {
    try {
      await deleteComment(commentId);

      if (parentId) {
        // Nếu là reply
        setRepliesData((prev) => ({
          ...prev,
          [parentId]: {
            ...prev[parentId],
            replies: prev[parentId]?.replies.filter((r) => r.id !== commentId),
          },
        }));
        // Giảm replyCount của comment cha
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId ? { ...c, replyCount: Math.max(0, (c.replyCount || 1) - 1) } : c
          )
        );
      } else {
        // Nếu là comment gốc
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setTotalComments((prev) => Math.max(0, prev - 1));
      }

      return true;
    } catch (err) {
      console.log("Lỗi khi xóa bình luận:", err);
      throw err;
    }
  }, []);

  /**
   * Chuyển trang
   */
  const goToPage = useCallback(
    (page) => {
      if (page >= 0 && page < totalPages) {
        fetchComments(page);
      }
    },
    [fetchComments, totalPages]
  );

  /**
   * Tải thêm comment (infinite scroll)
   */
  const loadMore = useCallback(() => {
    if (hasNext && !isLoading) {
      fetchComments(currentPage + 1);
    }
  }, [fetchComments, currentPage, hasNext, isLoading]);

  /**
   * Refresh danh sách comment
   */
  const refresh = useCallback(() => {
    setExpandedReplies({});
    setRepliesData({});
    fetchComments(0);
  }, [fetchComments]);

  // Load comments khi component mount hoặc targetId thay đổi
  useEffect(() => {
    fetchComments(0);
  }, [fetchComments]);

  return {
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
    fetchReplies,

    // Edit
    editingComment,
    setEditingComment,

    // Actions
    addComment,
    editComment,
    removeComment,
    goToPage,
    loadMore,
    refresh,
  };
};

export { COMMENT_TARGET_TYPES };
export default useComment;
