import React from "react";
import { Link } from "react-router-dom";
import LazyImage from "./LazyImage";

/**
 * MediaPressCard - Component hiển thị card bài báo chí
 * @param {Object} blog - Dữ liệu bài viết từ API
 * @param {string} variant - Kiểu hiển thị: "featured" | "horizontal" | "vertical"
 */
const MediaPressCard = ({ blog, variant = "vertical" }) => {
  const {
    id,
    title,
    slug,
    summary,
    thumbnail,
    publishedAt,
    viewCount,
    category,
    isFeatured,
    // Các trường đặc thù cho MEDIA_PRESS
    sourceUrl,
    sourceName,
    sourceLogo,
    sourcePublishedAt,
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

  // Component hiển thị nguồn báo chí
  const SourceBadge = ({ className = "" }) =>
    sourceName && (
      <div className={`flex items-center gap-2 ${className}`}>
        {sourceLogo && (
          <img
            src={sourceLogo}
            alt={sourceName}
            className="w-5 h-5 rounded object-contain bg-white"
          />
        )}
        <span className="text-sm font-medium truncate">{sourceName}</span>
      </div>
    );

  // Variant: Featured - Card lớn nổi bật
  if (variant === "featured") {
    return (
      <div className="block group">
        <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white transform hover:-translate-y-1">
          <Link to={`/bao-chi/${slug}`}>
            <div className="relative h-[280px] sm:h-[320px] lg:h-[380px] overflow-hidden">
              <LazyImage
                src={thumbnail || "/placeholder-news.jpg"}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Badge nguồn báo */}
              {sourceName && (
                <span className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
                  {sourceLogo && (
                    <img
                      src={sourceLogo}
                      alt={sourceName}
                      className="w-4 h-4 rounded object-contain"
                    />
                  )}
                  {sourceName}
                </span>
              )}

              {/* Featured badge */}
              {isFeatured && (
                <span className="absolute top-4 right-4 bg-[#be290f] text-[#F1C412] px-2 py-1 rounded-full text-sm shadow">
                  <i className="fa-solid fa-star"></i>
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

                <h3 className="text-white text-lg sm:text-xl lg:text-xl font-bold mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors text-justify">
                  {title}
                </h3>

                <p className="text-white/80 text-sm sm:text-md line-clamp-2 mb-3 text-justify">
                  {summary}
                </p>

                {/* Meta info */}
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  <span className="flex items-center gap-1.5">
                    <i className="fa-regular fa-calendar"></i>
                    {formatDate(sourcePublishedAt || publishedAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="fa-regular fa-eye"></i>
                    {formatViewCount(viewCount)} lượt xem
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Link xem bài gốc */}
          {sourceUrl && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                <i className="fa-solid fa-external-link-alt"></i>
                Xem bài viết gốc trên {sourceName}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Variant: Horizontal - Card ngang
  if (variant === "horizontal") {
    return (
      <div className="block group">
        <div className="flex gap-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden p-3 sm:p-4 transform hover:-translate-y-1 hover:bg-gray-50/50">
          {/* Thumbnail */}
          <Link
            to={`/bao-chi/${slug}`}
            className="flex-shrink-0 w-28 h-28 sm:w-36 sm:h-36 overflow-hidden rounded-lg relative">
            <LazyImage
              src={thumbnail || "/placeholder-news.jpg"}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700"
            />
            {/* Source logo overlay */}
            {sourceLogo && (
              <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow">
                <img src={sourceLogo} alt={sourceName} className="w-5 h-5 object-contain" />
              </div>
            )}
          </Link>

          {/* Content */}
          <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
            {/* Source name badge */}
            {sourceName && (
              <span className="inline-block w-fit bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-sm font-medium mb-1">
                <i className="fa-solid fa-newspaper mr-1"></i>
                {sourceName}
              </span>
            )}

            <Link to={`/bao-chi/${slug}`}>
              <h3 className="text-gray-800 text-md sm:text-base font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors text-justify">
                {title}
              </h3>
            </Link>

            <p className="text-gray-600 text-sm line-clamp-2 mt-1 hidden sm:block text-justify">
              {summary}
            </p>

            {/* Meta info */}
            <div className="flex items-center gap-3 text-gray-500 text-sm mt-2">
              <span className="flex items-center gap-1">
                <i className="fa-regular fa-calendar text-blue-500"></i>
                {formatDate(sourcePublishedAt || publishedAt)}
              </span>
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                  <i className="fa-solid fa-external-link-alt"></i>
                  <span className="hidden sm:inline">Xem gốc</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Variant: Vertical - Card dọc (mặc định)
  return (
    <div className="block group h-full">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden h-full flex flex-col transform hover:-translate-y-2">
        {/* Thumbnail */}
        <Link to={`/bao-chi/${slug}`} className="relative h-64 sm:h-68 overflow-hidden block">
          <LazyImage
            src={thumbnail || "/placeholder-news.jpg"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-1000"
          />

          {/* Source badge */}
          {sourceName && (
            <span className="absolute top-3 left-3 bg-blue-500 text-white px-2.5 py-1 rounded-full text-sm font-medium shadow flex items-center gap-1.5">
              {sourceLogo && (
                <img src={sourceLogo} alt={sourceName} className="w-4 h-4 rounded object-contain" />
              )}
              {sourceName}
            </span>
          )}

          {/* Featured badge */}
          {isFeatured && (
            <span className="absolute top-3 right-3 bg-[#be290f] text-[#F1C412] px-2 py-1 rounded-full text-sm shadow">
              <i className="fa-solid fa-star"></i>
            </span>
          )}
        </Link>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <Link to={`/bao-chi/${slug}`}>
            <h3 className="text-gray-800 text-md sm:text-base font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors mb-2 text-justify">
              {title}
            </h3>
          </Link>

          <p className="text-gray-600 text-sm line-clamp-2 flex-1 text-justify">{summary}</p>

          {/* Meta info */}
          <div className="flex items-center justify-between text-gray-500 text-sm mt-3 pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <i className="fa-regular fa-calendar text-blue-500"></i>
              {formatDate(sourcePublishedAt || publishedAt)}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <i className="fa-regular fa-eye text-blue-500"></i>
                {formatViewCount(viewCount)}
              </span>
            </div>
          </div>

          {/* Link xem bài gốc */}
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm py-2 bg-blue-50 rounded-lg transition-colors">
              <i className="fa-solid fa-external-link-alt"></i>
              Xem bài viết gốc
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaPressCard;
