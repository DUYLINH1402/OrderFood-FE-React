import React from "react";
import { Link } from "react-router-dom";
import LazyImage from "./LazyImage";

/**
 * NewsCard - Component hiển thị card tin tức
 * @param {Object} blog - Dữ liệu bài viết từ API
 * @param {string} variant - Kiểu hiển thị: "featured" | "horizontal" | "vertical"
 */
const NewsCard = ({ blog, variant = "vertical" }) => {
  const {
    id,
    title,
    slug,
    summary,
    thumbnail,
    publishedAt,
    viewCount,
    category,
    author,
    isFeatured,
  } = blog;

  // Format ngày đăng
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
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

  // Variant: Featured - Card lớn nổi bật
  if (variant === "featured") {
    return (
      <Link to={`/tin-tuc/${slug}`} className="block group">
        <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white transform hover:-translate-y-1">
          <div className="relative h-[280px] sm:h-[320px] lg:h-[380px] overflow-hidden">
            <LazyImage
              src={thumbnail || "/placeholder-news.jpg"}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-000  "
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Badge nổi bật */}
            {isFeatured && (
              <span className="absolute top-4 left-4 bg-[#be290f] text-[#F1C412] px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                <i className="fa-solid fa-star mr-1.5"></i>
                Nổi bật
              </span>
            )}

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              {/* Category */}
              {category && (
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm mb-3">
                  {category.name}
                </span>
              )}

              <h3 className="text-white text-lg sm:text-xl lg:text-xl font-bold mb-2 line-clamp-2 group-hover:text-[#4ade80] transition-colors text-justify">
                {title}
              </h3>

              <p className="text-white/80 text-sm sm:text-md line-clamp-2 mb-3 text-justify">
                {summary}
              </p>

              {/* Meta info */}
              <div className="flex items-center gap-4 text-white/70 text-sm">
                <span className="flex items-center gap-1.5">
                  <i className="fa-regular fa-calendar"></i>
                  {formatDate(publishedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="fa-regular fa-eye"></i>
                  {formatViewCount(viewCount)} lượt xem
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Variant: Horizontal - Card ngang
  if (variant === "horizontal") {
    return (
      <Link to={`/tin-tuc/${slug}`} className="block group">
        <div className="flex gap-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden p-3 sm:p-4 transform hover:-translate-y-1 hover:bg-gray-50/50">
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-28 h-28 sm:w-36 sm:h-36 overflow-hidden rounded-lg">
            <LazyImage
              src={thumbnail || "/placeholder-news.jpg"}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700  "
            />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
            {/* Category */}
            {category && (
              <span className="inline-block w-fit bg-[#e8f5e9] text-[#199b7e] px-2.5 py-0.5 rounded-full text-sm font-medium mb-1">
                {category.name}
              </span>
            )}

            <h3 className="text-gray-800 text-md sm:text-base font-semibold line-clamp-2 group-hover:text-[#199b7e] transition-colors text-justify">
              {title}
            </h3>

            <p className="text-gray-600 text-sm line-clamp-2 mt-1 hidden sm:block text-justify">
              {summary}
            </p>

            {/* Meta info */}
            <div className="flex items-center gap-3 text-gray-500 text-sm mt-2">
              <span className="flex items-center gap-1">
                <i className="fa-regular fa-calendar text-[#199b7e]"></i>
                {formatDate(publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <i className="fa-regular fa-eye text-[#199b7e]"></i>
                {formatViewCount(viewCount)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Variant: Vertical - Card dọc (mặc định)
  return (
    <Link to={`/tin-tuc/${slug}`} className="block group h-full">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden h-full flex flex-col transform hover:-translate-y-2">
        {/* Thumbnail */}
        <div className="relative h-64 sm:h-68 overflow-hidden">
          <LazyImage
            src={thumbnail || "/placeholder-news.jpg"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-1000  "
          />

          {/* Category badge */}
          {category && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#199b7e] px-2.5 py-1 rounded-full text-sm font-medium shadow">
              {category.name}
            </span>
          )}

          {/* Featured badge */}
          {isFeatured && (
            <span className="absolute top-3 right-3 bg-[#be290f] text-[#F1C412] px-2 py-1 rounded-full text-sm shadow">
              <i className="fa-solid fa-star"></i>
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-gray-800 text-md sm:text-base font-semibold line-clamp-2 group-hover:text-[#199b7e] transition-colors mb-2 text-justify">
            {title}
          </h3>

          <p className="text-gray-600 text-sm line-clamp-2 flex-1 text-justify">{summary}</p>

          {/* Meta info */}
          <div className="flex items-center justify-between text-gray-500 text-sm mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {author?.avatarUrl && (
                <img
                  src={author.avatarUrl}
                  alt={author.fullName}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <span className="truncate max-w-[100px]">{author?.fullName || "Admin"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <i className="fa-regular fa-calendar text-[#199b7e]"></i>
                {formatDate(publishedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
