import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBlogBySlug, getRelatedBlogs } from "../../services/service/blogService";
import { BLOG_TYPES } from "../../constants/blogConstants";
import CateringCard from "../../components/CateringCard";
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

const CateringDetailPage = () => {
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
          setError("Không tìm thấy gói tiệc");
          return;
        }

        setBlog(data);

        // Lấy bài viết liên quan (cùng type CATERING_SERVICES)
        if (data.id) {
          const related = await getRelatedBlogs(data.id, 3);
          const filteredRelated = (related || []).filter(
            (item) => item.blogType === BLOG_TYPES.CATERING_SERVICES
          );
          setRelatedBlogs(filteredRelated);
        }
      } catch (err) {
        console.error("Lỗi khi tải gói tiệc:", err);
        setError("Có lỗi xảy ra khi tải gói tiệc");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [slug]);

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

  // Parse menu items
  const getMenuItems = () => {
    if (!blog?.menuItems) return [];
    if (Array.isArray(blog.menuItems)) return blog.menuItems;
    try {
      return JSON.parse(blog.menuItems);
    } catch {
      return [];
    }
  };

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

  // Format capacity
  const formatCapacity = () => {
    if (blog?.minCapacity && blog?.maxCapacity) {
      return `${blog.minCapacity} - ${blog.maxCapacity} khách`;
    }
    if (blog?.minCapacity) return `Từ ${blog.minCapacity} khách`;
    if (blog?.maxCapacity) return `Đến ${blog.maxCapacity} khách`;
    return null;
  };

  const gallery = getGalleryImages();
  const menuItems = getMenuItems();
  const capacity = formatCapacity();

  if (loading) {
    return (
      <GlassPageWrapper>
        <div className="min-h-screen pb-16">
          <NewsDetailSkeleton />
        </div>
      </GlassPageWrapper>
    );
  }

  if (error || !blog) {
    return (
      <GlassPageWrapper>
        <div className="min-h-screen pb-16 flex items-center justify-center">
          <div className="text-center">
            <i className="fa-solid fa-utensils text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-lg font-medium text-gray-700 mb-3">
              {error || "Không tìm thấy gói tiệc"}
            </h2>
            <button
              onClick={() => navigate("/dai-tiec")}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-md">
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
      <div className="min-h-screen pb-16">
        <article className="max-w-[1000px] mx-auto px-4">
          {/* Breadcrumb */}
          <nav
            data-aos="fade-right"
            data-aos-duration="500"
            className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
            <Link to="/" className="hover:text-amber-500 transition-colors">
              Trang chủ
            </Link>
            <i className="fa-solid fa-chevron-right text-sm text-gray-400"></i>
            <Link to="/dai-tiec" className="hover:text-amber-500 transition-colors">
              Đãi tiệc lưu động
            </Link>
            {blog.category && (
              <>
                <i className="fa-solid fa-chevron-right text-sm text-gray-400"></i>
                <Link
                  to={`/dai-tiec?category=${blog.category.slug}`}
                  className="hover:text-amber-500 transition-colors">
                  {blog.category.name}
                </Link>
              </>
            )}
          </nav>

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

          {/* Quick info cards */}
          <div
            data-aos="fade-up"
            data-aos-delay="150"
            data-aos-duration="600"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Price range */}
            {blog.priceRange && (
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                <i className="fa-solid fa-tag text-amber-500 text-xl mb-2"></i>
                <p className="text-sm text-gray-500">Mức giá</p>
                <p className="font-semibold text-amber-600 text-sm">{blog.priceRange}</p>
              </div>
            )}

            {/* Capacity */}
            {capacity && (
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                <i className="fa-solid fa-users text-amber-500 text-xl mb-2"></i>
                <p className="text-sm text-gray-500">Sức chứa</p>
                <p className="font-semibold text-amber-600 text-sm">{capacity}</p>
              </div>
            )}

            {/* View count */}
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <i className="fa-solid fa-eye text-gray-500 text-xl mb-2"></i>
              <p className="text-sm text-gray-500">Lượt xem</p>
              <p className="font-semibold text-gray-600 text-sm">
                {formatViewCount(blog.viewCount)}
              </p>
            </div>

            {/* Date */}
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <i className="fa-solid fa-calendar text-gray-500 text-xl mb-2"></i>
              <p className="text-sm text-gray-500">Cập nhật</p>
              <p className="font-semibold text-gray-600 text-sm">
                {new Date(blog.publishedAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>

          {/* Service areas */}
          {blog.serviceAreas && (
            <div
              data-aos="fade-up"
              data-aos-delay="200"
              data-aos-duration="600"
              className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-location-dot text-blue-500 text-lg mt-0.5"></i>
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1">Khu vực phục vụ</p>
                  <p className="text-gray-600 text-sm">{blog.serviceAreas}</p>
                </div>
              </div>
            </div>
          )}

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
                <i className="fa-solid fa-images text-amber-500"></i>
                Hình ảnh thực tế
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

          {/* Menu items */}
          {menuItems.length > 0 && (
            <div data-aos="fade-up" data-aos-duration="600" className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-utensils text-amber-500"></i>
                Thực đơn gói tiệc
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((category, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                    <h3 className="font-semibold text-amber-600 mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-bowl-food"></i>
                      {category.name}
                    </h3>
                    <ul className="space-y-2">
                      {category.items?.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="flex items-center gap-2 text-gray-700 text-sm">
                          <i className="fa-solid fa-check text-green-500 text-sm"></i>
                          {item}
                        </li>
                      ))}
                    </ul>
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
                  className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-sm font-medium">
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
              prose-a:text-amber-500 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-800
              prose-ul:text-gray-700 prose-ol:text-gray-700
              prose-li:!text-sm md:prose-li:!text-base 
              prose-li:!leading-loose
              prose-img:!rounded-lg prose-img:shadow-md
              prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4
              [&_p]:!text-sm md:[&_p]:!text-base 
              [&_li]:!text-sm md:[&_li]:!text-base 
              [&_h1]:!text-xl md:[&_h1]:!text-2xl 
              [&_h2]:!text-lg md:[&_h2]:!text-xl 
              [&_h3]:!text-base md:[&_h3]:!text-lg
              [&_p]:text-justify [&_p]:!leading-loose [&_li]:!leading-loose"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Contact info */}
          {blog.contactInfo && (
            <div
              data-aos="fade-up"
              data-aos-duration="500"
              className="mb-8 p-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-white">
              <h3 className="text-sm text-lg font-bold mb-3 flex items-center gap-2">
                <i className="fa-solid fa-phone-volume"></i>
                Thông tin liên hệ đặt tiệc
              </h3>
              <p className="text-sm text-white/90">{blog.contactInfo}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="tel:19001234"
                  className="text-sm px-4 py-2 bg-white text-amber-600 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                  <i className="fa-solid fa-phone"></i>
                  Gọi ngay
                </a>
                <a
                  href="/lien-he"
                  className="text-sm px-4 py-2 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 transition-colors inline-flex items-center gap-2">
                  <i className="fa-solid fa-envelope"></i>
                  Gửi yêu cầu
                </a>
              </div>
            </div>
          )}

          {/* Category info */}
          {blog.category && (
            <div
              data-aos="fade-up"
              data-aos-duration="500"
              className="mb-8 p-4 bg-gray-50 rounded-xl">
              <Link
                to={`/dai-tiec?category=${blog.category.slug}`}
                className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-folder text-white"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Danh mục</p>
                  <p className="font-medium text-amber-600 group-hover:underline text-md">
                    {blog.category.name}
                  </p>
                </div>
                <i className="fa-solid fa-arrow-right ml-auto text-amber-500 group-hover:translate-x-1 transition-transform"></i>
              </Link>
            </div>
          )}

          {/* Like & Share buttons */}
          <div className="ml-auto flex justify-end items-center gap-2 relative z-[1000]">
            <LikeButton
              targetType={LIKE_TARGET_TYPES.BLOG}
              targetId={blog.id}
              initialLikeCount={blog.likeCount || 0}
              tooltipLike="Thích gói tiệc"
              tooltipUnlike="Bỏ thích"
              loginMessage="Vui lòng đăng nhập để thích gói tiệc"
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
              title="Bình luận & Câu hỏi"
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
                <i className="fa-solid fa-utensils text-amber-500"></i>
                Gói tiệc tương tự
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedBlogs.map((relBlog, index) => (
                  <div
                    key={relBlog.id}
                    data-aos="fade-up"
                    data-aos-delay={100 + index * 100}
                    data-aos-duration="600">
                    <CateringCard blog={relBlog} variant="vertical" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Back to list */}
          <div data-aos="fade-up" data-aos-duration="500" className="text-center mt-10">
            <button
              onClick={() => navigate("/dai-tiec")}
              className="px-8 py-3 bg-white border-2 border-amber-500 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-all duration-300 font-medium text-md inline-flex items-center gap-2">
              <i className="fa-solid fa-arrow-left"></i>
              <span>Xem tất cả gói tiệc</span>
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

export default CateringDetailPage;
