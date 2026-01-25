import { useState, useEffect, useCallback } from "react";
import { checkLikeStatus, toggleLike, TARGET_TYPES } from "../services/service/likeService";
import { getToken } from "../services/auth/authApi";

/**
 * Custom hook để quản lý trạng thái like cho một đối tượng
 * @param {string} targetType - Loại đối tượng (FOOD, POST, ...)
 * @param {number} targetId - ID của đối tượng
 * @param {number} initialLikeCount - Số lượt like ban đầu (từ data của object)
 * @returns {{
 *   likeCount: number,
 *   hasLiked: boolean,
 *   isLoading: boolean,
 *   isToggling: boolean,
 *   error: string | null,
 *   handleToggleLike: (e: Event) => Promise<void>,
 *   refetch: () => Promise<void>
 * }}
 */
const useLike = (targetType, targetId, initialLikeCount = 0) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState(null);

  // Cập nhật likeCount khi initialLikeCount thay đổi
  useEffect(() => {
    setLikeCount(initialLikeCount);
  }, [initialLikeCount]);

  // Fetch trạng thái đã like của user (chỉ khi đã đăng nhập)
  const fetchLikeStatus = useCallback(async () => {
    // Lấy token mới nhất mỗi lần gọi
    const currentToken = getToken();

    if (!targetId) {
      return;
    }

    if (!currentToken) {
      setHasLiked(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const liked = await checkLikeStatus(targetType, targetId);
      //   console.log("Fetch like status - targetId:", targetId, "hasLiked:", liked);
      setHasLiked(liked);
    } catch (err) {
      console.error("Lỗi fetch like status:", err);
      setError("Không thể tải trạng thái like");
      setHasLiked(false);
    } finally {
      setIsLoading(false);
    }
  }, [targetType, targetId]);

  // Auto fetch khi mount hoặc targetId thay đổi
  useEffect(() => {
    if (targetId) {
      fetchLikeStatus();
    }
  }, [targetId, fetchLikeStatus]);

  // Xử lý toggle like
  const handleToggleLike = useCallback(
    async (e) => {
      // Ngăn sự kiện click lan truyền
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }

      // Lấy token mới nhất
      const currentToken = getToken();

      // Kiểm tra đăng nhập
      if (!currentToken) {
        setError("Vui lòng đăng nhập để thích món ăn");
        return { success: false, requireLogin: true };
      }

      if (!targetId || isToggling) return { success: false };

      setIsToggling(true);
      setError(null);

      try {
        const result = await toggleLike(targetType, targetId);

        if (result.success) {
          // Cập nhật UI với dữ liệu từ server
          // Nếu server trả về hasLiked và likeCount thì dùng giá trị đó
          if (typeof result.hasLiked === "boolean") {
            setHasLiked(result.hasLiked);
          } else {
            // Nếu không có, toggle trạng thái hiện tại
            setHasLiked((prev) => !prev);
          }

          if (typeof result.likeCount === "number") {
            setLikeCount(result.likeCount);
          } else {
            // Nếu server không trả về likeCount, tự tính toán
            setLikeCount((prev) => {
              const newHasLiked =
                typeof result.hasLiked === "boolean" ? result.hasLiked : !hasLiked;
              return newHasLiked ? prev + 1 : Math.max(0, prev - 1);
            });
          }

          return { success: true };
        } else {
          setError("Không thể cập nhật like");
          return { success: false };
        }
      } catch (err) {
        console.error("Lỗi toggle like:", err);
        setError("Đã xảy ra lỗi khi cập nhật like");
        return { success: false, error: err };
      } finally {
        setIsToggling(false);
      }
    },
    [targetId, targetType, hasLiked, isToggling]
  );

  return {
    likeCount,
    hasLiked,
    isLoading,
    isToggling,
    error,
    handleToggleLike,
    refetch: fetchLikeStatus,
  };
};

export { TARGET_TYPES };
export default useLike;
