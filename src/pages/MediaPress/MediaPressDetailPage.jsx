import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBlogBySlug, getRelatedBlogs } from "../../services/service/blogService";
import { BLOG_TYPES } from "../../constants/blogConstants";
import MediaPressCard from "../../components/MediaPressCard";
import { NewsDetailSkeleton } from "../../components/Skeleton/NewsSkeleton";
import GlassPageWrapper from "../../components/GlassPageWrapper";
import LazyImage from "../../components/LazyImage";
import ShareButton from "../../components/ShareButton/ShareButton";
import LikeButton, {
  TARGET_TYPES as LIKE_TARGET_TYPES,
} from "../../components/LikeButton/LikeButton";
import CommentSection, { COMMENT_TARGET_TYPES } from "../../components/Comment/CommentSection";
import useShare, { TARGET_TYPES as SHARE_TARGET_TYPES } from "../../hooks/useShare";
import AOS from "aos";
import "aos/dist/aos.css";

const MediaPressDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Hook quản lý Share cho Blog
  const { shareCount, shareUrl, shareContent, handleShare, handleCopyLink } = useShare(
    SHARE_TARGET_TYPES.BLOG,
    blog?.id,
    {
      title: blog?.title,
      description: blog?.summary,
      slug: blog?.slug,
    },
    blog?.shareCount || 0
  );

  // Khởi tạo AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 50,
    });
  }, []);

  // Refresh AOS khi blog thay đổi
  useEffect(() => {
    if (blog) {
      AOS.refresh();
    }
  }, [blog]);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getBlogBySlug(slug);

        if (!data) {
          setError("Không tìm thấy bài viết");
          return;
        }

        setBlog(data);

        // Lấy bài viết liên quan (cùng type MEDIA_PRESS)
        if (data.id) {
          const related = await getRelatedBlogs(data.id, 3);
          // Lọc chỉ lấy bài MEDIA_PRESS
          const filteredRelated = (related || []).filter(
            (item) => item.blogType === BLOG_TYPES.MEDIA_PRESS
          );
          setRelatedBlogs(filteredRelated);
        }
      } catch (err) {
        console.error("Lỗi khi tải bài viết:", err);
        setError("Có lỗi xảy ra khi tải bài viết");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [slug]);

  // Format ngày đăng
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Format lượt xem
  const formatViewCount = (count) => {
    if (!count) return "0";
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // Parse gallery images
  const getGalleryImages = () => {
    if (!blog?.galleryImages) return [];
    if (Array.isArray(blog.galleryImages)) return blog.galleryImages;
    try {
      return JSON.parse(blog.galleryImages);
    } catch {
      return [];
    }
  };

  const gallery = getGalleryImages();

  if (loading) {
    return (
      <GlassPageWrapper>
        <div className="min-h-screen pt-32 pb-16">
          <NewsDetailSkeleton />
        </div>
      </GlassPageWrapper>
    );
  }

  if (error || !blog) {
    return (
      <GlassPageWrapper>
        <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
          <div className="text-center">
            <i className="fa-solid fa-bullhorn text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-lg font-medium text-gray-700 mb-3">
              {error || "Không tìm thấy bài viết"}
            </h2>
            <button
              onClick={() => navigate("/bao-chi")}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-md">
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Quay lại danh sách
            </button>
          </div>
        </div>
      </GlassPageWrapper>
    );
  }

  return (
    <GlassPageWrapper>
      <div className="min-h-screen pt-32 pb-16">
        <article className="max-w-[900px] mx-auto px-4">
          {/* Breadcrumb */}
          <nav
            data-aos="fade-right"
            data-aos-duration="500"
            className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
            <Link to="/" className="hover:text-blue-500 transition-colors">
              Trang chủ
            </Link>
            <i className="fa-solid fa-chevron-right text-sm text-gray-400"></i>
            <Link to="/bao-chi" className="hover:text-blue-500 transition-colors">
              Báo chí & Truyền thông
            </Link>
            {blog.category && (
              <>
                <i className="fa-solid fa-chevron-right text-sm text-gray-400"></i>
                <Link
                  to={`/bao-chi?category=${blog.category.slug}`}
                  className="hover:text-blue-500 transition-colors">
                  {blog.category.name}
                </Link>
              </>
            )}
          </nav>

          {/* Source info - Báo chí nguồn */}
          {blog.sourceName && (
            <div
              data-aos="fade-up"
              data-aos-duration="500"
              className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4">
              {blog.sourceLogo && (
                <img
                  src={blog.sourceLogo}
                  alt={blog.sourceName}
                  className="w-12 h-12 rounded-lg object-contain bg-white p-1"
                />
              )}
              <div className="text-sm flex-1">
                <p className="text-gray-500">Nguồn bài viết</p>
                <p className="font-semibold text-gray-800">{blog.sourceName}</p>
                {blog.sourcePublishedAt && (
                  <p className="text-sm text-gray-500">
                    Đăng ngày: {formatDate(blog.sourcePublishedAt)}
                  </p>
                )}
              </div>
              {blog.sourceUrl && (
                <a
                  href={blog.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2">
                  <i className="fa-solid fa-external-link-alt"></i>
                  Xem bài gốc
                </a>
              )}
            </div>
          )}

          {/* Title */}
          <h1
            data-aos="fade-up"
            data-aos-duration="600"
            className="text-xl sm:text-xxl lg:text-xxl font-bold text-gray-800 mb-4 leading-tight">
            {blog.title}
          </h1>

          {/* Summary */}
          {blog.summary && (
            <p
              data-aos="fade-up"
              data-aos-delay="100"
              data-aos-duration="600"
              className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
              {blog.summary}
            </p>
          )}

          {/* Meta info */}
          <div
            data-aos="fade-up"
            data-aos-delay="150"
            data-aos-duration="600"
            className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 pb-6 border-b border-gray-200 overflow-visible relative">
            {/* Author */}
            {blog.author && (
              <div className="flex items-center gap-2">
                {blog.author.avatarUrl ? (
                  <img
                    src={blog.author.avatarUrl}
                    alt={blog.author.fullName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {blog.author.fullName?.charAt(0) || "A"}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-800 text-md">
                    {blog.author.fullName || "Admin"}
                  </p>
                  <p className="text-sm text-gray-500">Người đăng</p>
                </div>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center gap-2 text-gray-600 text-md">
              <i className="fa-regular fa-calendar text-blue-500"></i>
              <span>{formatDate(blog.publishedAt)}</span>
            </div>

            {/* View count */}
            <div className="flex items-center gap-2 text-gray-600 text-md">
              <i className="fa-regular fa-eye text-blue-500"></i>
              <span>{formatViewCount(blog.viewCount)} lượt xem</span>
            </div>
          </div>

          {/* Featured image */}
          {blog.thumbnail && (
            <div
              data-aos="zoom-in"
              data-aos-duration="700"
              className="mb-8 rounded-xl overflow-hidden shadow-lg">
              <LazyImage
                src={blog.thumbnail}
                alt={blog.title}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Gallery */}
          {gallery.length > 0 && (
            <div data-aos="fade-up" data-aos-duration="600" className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-images text-blue-500"></i>
                Hình ảnh bài viết
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {gallery.map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => {
                      setActiveGalleryIndex(index);
                      setShowGalleryModal(true);
                    }}>
                    <LazyImage
                      src={img}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <i className="fa-solid fa-expand text-white opacity-0 group-hover:opacity-100 transition-opacity text-xl"></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {blog.tags && (
            <div data-aos="fade-up" data-aos-duration="500" className="flex flex-wrap gap-2 mb-6">
              {blog.tags.split(",").map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div
            data-aos="fade-up"
            data-aos-duration="700"
            className="prose prose-base md:prose-lg max-w-none mb-12
              prose-headings:text-gray-800 prose-headings:font-bold
              prose-h1:!text-xl md:prose-h1:!text-2xl 
              prose-h2:!text-lg md:prose-h2:!text-xl 
              prose-h3:!text-base md:prose-h3:!text-lg
              prose-p:!text-sm md:prose-p:!text-base 
              prose-p:!leading-loose prose-p:text-gray-700 prose-p:text-justify
              prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-800
              prose-ul:text-gray-700 prose-ol:text-gray-700
              prose-li:!text-sm md:prose-li:!text-base 
              prose-li:!leading-loose
              prose-img:!rounded-lg prose-img:shadow-md
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4
              [&_p]:!text-sm md:[&_p]:!text-base 
              [&_li]:!text-sm md:[&_li]:!text-base 
              [&_h1]:!text-xl md:[&_h1]:!text-2xl 
              [&_h2]:!text-lg md:[&_h2]:!text-xl 
              [&_h3]:!text-base md:[&_h3]:!text-lg
              [&_p]:text-justify [&_p]:!leading-loose [&_li]:!leading-loose"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Source link at bottom */}
          {blog.sourceUrl && (
            <div
              data-aos="fade-up"
              data-aos-duration="500"
              className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <a
                href={blog.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-external-link-alt text-white"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Xem bài viết gốc</p>
                  <p className="font-medium text-blue-600 group-hover:underline text-md">
                    {blog.sourceName || "Nguồn bài viết"}
                  </p>
                </div>
                <i className="fa-solid fa-arrow-right ml-auto text-blue-500 group-hover:translate-x-1 transition-transform"></i>
              </a>
            </div>
          )}

          {/* Category info */}
          {blog.category && (
            <div
              data-aos="fade-up"
              data-aos-duration="500"
              className="mb-8 p-4 bg-gray-50 rounded-xl">
              <Link
                to={`/bao-chi?category=${blog.category.slug}`}
                className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-folder text-white"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Danh mục</p>
                  <p className="font-medium text-blue-600 group-hover:underline text-md">
                    {blog.category.name}
                  </p>
                </div>
                <i className="fa-solid fa-arrow-right ml-auto text-blue-500 group-hover:translate-x-1 transition-transform"></i>
              </Link>
            </div>
          )}

          {/* Like & Share buttons */}
          <div className="ml-auto flex justify-end items-center gap-2 relative z-[1000]">
            <LikeButton
              targetType={LIKE_TARGET_TYPES.BLOG}
              targetId={blog.id}
              initialLikeCount={blog.likeCount || 0}
              tooltipLike="Thích bài viết"
              tooltipUnlike="Bỏ thích"
              loginMessage="Vui lòng đăng nhập để thích bài viết"
            />
            <ShareButton
              url={shareUrl}
              title={shareContent.title}
              description={shareContent.description}
              imageUrl={blog.thumbnail}
              hashtag={shareContent.hashtag}
              shareCount={shareCount}
              onShare={handleShare}
              onCopyLink={handleCopyLink}
            />
          </div>

          {/* Comment Section */}
          <div data-aos="fade-up" data-aos-duration="600" className="mb-12">
            <CommentSection
              targetType={COMMENT_TARGET_TYPES.BLOG}
              targetId={blog.id}
              title="Bình luận bài viết"
              pageSize={10}
            />
          </div>

          {/* Related blogs */}
          {relatedBlogs.length > 0 && (
            <section className="border-t border-gray-200 pt-10">
              <h2
                data-aos="fade-right"
                data-aos-duration="500"
                className="text-lg sm:text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <i className="fa-solid fa-bullhorn text-blue-500"></i>
                Bài viết liên quan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedBlogs.map((relBlog, index) => (
                  <div
                    key={relBlog.id}
                    data-aos="fade-up"
                    data-aos-delay={100 + index * 100}
                    data-aos-duration="600">
                    <MediaPressCard blog={relBlog} variant="vertical" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Back to list */}
          <div data-aos="fade-up" data-aos-duration="500" className="text-center mt-10">
            <button
              onClick={() => navigate("/bao-chi")}
              className="px-8 py-3 bg-white border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300 font-medium text-md inline-flex items-center gap-2">
              <i className="fa-solid fa-arrow-left"></i>
              <span>Xem tất cả bài báo</span>
            </button>
          </div>
        </article>
      </div>

      {/* Gallery Modal */}
      {showGalleryModal && gallery.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowGalleryModal(false)}>
          <button
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition-colors"
            onClick={() => setShowGalleryModal(false)}>
            <i className="fa-solid fa-times"></i>
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl hover:text-gray-300 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setActiveGalleryIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
            }}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          <img
            src={gallery[activeGalleryIndex]}
            alt={`Gallery ${activeGalleryIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl hover:text-gray-300 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setActiveGalleryIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
            }}>
            <i className="fa-solid fa-chevron-right"></i>
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {activeGalleryIndex + 1} / {gallery.length}
          </div>
        </div>
      )}
    </GlassPageWrapper>
  );
};

export default MediaPressDetailPage;
