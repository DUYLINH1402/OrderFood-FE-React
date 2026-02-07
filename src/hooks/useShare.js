import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getShareCount,
  recordShare,
  generateFoodShareUrl,
  generateFoodShareContent,
  generateBlogShareUrl,
  generateBlogShareContent,
  TARGET_TYPES,
  SHARE_PLATFORMS,
} from "../services/service/shareService";
import { toast } from "react-toastify";

/**
 * Custom hook để quản lý chức năng share cho một đối tượng
 * @param {string} targetType - Loại đối tượng (FOOD, BLOG, ...)
 * @param {number} targetId - ID của đối tượng
 * @param {object} targetData - Dữ liệu của đối tượng (name, description, slug, imageUrl...)
 * @param {number} initialShareCount - Số lượt share ban đầu (từ data của object)
 * @returns {{
 *   shareCount: number,
 *   isLoading: boolean,
 *   shareUrl: string,
 *   shareContent: {title: string, description: string, hashtag: string},
 *   handleShare: (platform: string) => Promise<void>,
 *   handleCopyLink: () => Promise<void>,
 *   refetch: () => Promise<void>
 * }}
 */
const useShare = (targetType, targetId, targetData = {}, initialShareCount = 0) => {
  const [shareCount, setShareCount] = useState(initialShareCount);
  const [isLoading, setIsLoading] = useState(false);

  // Tạo URL chia sẻ dựa vào loại đối tượng - sử dụng useMemo để cập nhật khi targetData thay đổi
  const shareUrl = useMemo(() => {
    if (!targetData.slug) return window.location.href;

    switch (targetType) {
      case TARGET_TYPES.BLOG:
        return generateBlogShareUrl(targetData.slug);
      case TARGET_TYPES.FOOD:
      default:
        return generateFoodShareUrl(targetData.slug);
    }
  }, [targetType, targetData.slug]);

  // Tạo nội dung chia sẻ dựa vào loại đối tượng - sử dụng useMemo để cập nhật khi targetData thay đổi
  const shareContent = useMemo(() => {
    switch (targetType) {
      case TARGET_TYPES.BLOG:
        return generateBlogShareContent(targetData);
      case TARGET_TYPES.FOOD:
      default:
        return generateFoodShareContent(targetData);
    }
  }, [targetType, targetData.title, targetData.name, targetData.description, targetData.summary]);

  // Cập nhật shareCount khi initialShareCount thay đổi
  useEffect(() => {
    setShareCount(initialShareCount);
  }, [initialShareCount]);

  // Fetch số lượt share
  const fetchShareCount = useCallback(async () => {
    if (!targetId) return;

    setIsLoading(true);
    try {
      const count = await getShareCount(targetType, targetId);
      setShareCount(count);
    } catch (error) {
      console.error("Lỗi fetch share count:", error);
    } finally {
      setIsLoading(false);
    }
  }, [targetType, targetId]);

  // Auto fetch khi mount hoặc targetId thay đổi
  useEffect(() => {
    if (targetId) {
      fetchShareCount();
    }
  }, [targetId, fetchShareCount]);

  /**
   * Xử lý khi người dùng thực hiện share
   * Gọi sau khi đã mở popup share của nền tảng
   * @param {string} platform - Nền tảng chia sẻ
   */
  const handleShare = useCallback(
    async (platform) => {
      if (!targetId) return;

      try {
        const result = await recordShare(targetType, targetId, platform);

        if (result.success) {
          // Cập nhật UI - tăng số lượt share
          setShareCount((prev) => prev + 1);
          toast.success("Cảm ơn bạn đã chia sẻ!");
        }
      } catch (error) {
        console.error("Lỗi ghi nhận share:", error);
      }
    },
    [targetType, targetId]
  );

  /**
   * Xử lý copy link vào clipboard
   * Chỉ copy link, không gọi API và không cập nhật số lượng share
   */
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Đã sao chép link!");
    } catch (error) {
      console.error("Lỗi copy link:", error);
      toast.error("Không thể sao chép link");
    }
  }, [shareUrl]);

  return {
    shareCount,
    isLoading,
    shareUrl,
    shareContent,
    handleShare,
    handleCopyLink,
    refetch: fetchShareCount,
  };
};

export { TARGET_TYPES, SHARE_PLATFORMS };
export default useShare;
