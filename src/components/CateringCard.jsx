import React from "react";
import { Link } from "react-router-dom";
import LazyImage from "./LazyImage";

/**
 * CateringCard - Component hiển thị card dịch vụ đãi tiệc
 * @param {Object} blog - Dữ liệu bài viết từ API
 * @param {string} variant - Kiểu hiển thị: "featured" | "horizontal" | "vertical"
 */
const CateringCard = ({ blog, variant = "vertical" }) => {
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
    // Các trường đặc thù cho CATERING_SERVICES
    priceRange,
    serviceAreas,
    galleryImages,
    minCapacity,
    maxCapacity,
    contactInfo,
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

  // Parse gallery images
  const getGalleryImages = () => {
    if (!galleryImages) return [];
    if (Array.isArray(galleryImages)) return galleryImages;
    try {
      return JSON.parse(galleryImages);
    } catch {
      return [];
    }
  };

  // Format capacity
  const formatCapacity = () => {
    if (minCapacity && maxCapacity) {
      return `${minCapacity} - ${maxCapacity} khách`;
    }
    if (minCapacity) return `Từ ${minCapacity} khách`;
    if (maxCapacity) return `Đến ${maxCapacity} khách`;
    return null;
  };

  const gallery = getGalleryImages();
  const capacity = formatCapacity();

  // Variant: Featured - Card lớn nổi bật
  if (variant === "featured") {
    return (
      <Link to={`/dai-tiec/${slug}`} className="block group">
        <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white transform hover:-translate-y-1">
          <div className="relative h-[280px] sm:h-[320px] lg:h-[400px] overflow-hidden">
            <LazyImage
              src={thumbnail || "/placeholder-catering.jpg"}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Price badge */}
            {priceRange && (
              <span className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                <i className="fa-solid fa-tag mr-1.5"></i>
                {priceRange}
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

              <h3 className="text-white text-lg sm:text-xl lg:text-xl font-bold mb-2 line-clamp-2 group-hover:text-amber-300 transition-colors text-justify">
                {title}
              </h3>

              <p className="text-white/80 text-sm sm:text-md line-clamp-2 mb-3 text-justify">
                {summary}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
                {capacity && (
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-users"></i>
                    {capacity}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <i className="fa-regular fa-eye"></i>
                  {formatViewCount(viewCount)} lượt xem
                </span>
              </div>
            </div>
          </div>

          {/* Gallery preview */}
          {gallery.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="flex gap-2 overflow-hidden">
                {gallery.slice(0, 4).map((img, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden relative">
                    <LazyImage
                      src={img}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 3 && gallery.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-medium">
                        +{gallery.length - 4}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Variant: Horizontal - Card ngang
  if (variant === "horizontal") {
    return (
      <Link to={`/dai-tiec/${slug}`} className="block group">
        <div className="flex gap-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden p-3 sm:p-4 transform hover:-translate-y-1 hover:bg-gray-50/50">
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-28 h-28 sm:w-36 sm:h-36 overflow-hidden rounded-lg relative">
            <LazyImage
              src={thumbnail || "/placeholder-catering.jpg"}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700"
            />
            {/* Price overlay */}
            {priceRange && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500/90 to-transparent p-2">
                <span className="text-white text-xs font-medium truncate block">{priceRange}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
            {/* Category */}
            {category && (
              <span className="inline-block w-fit bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full text-sm font-medium mb-1">
                {category.name}
              </span>
            )}

            <h3 className="text-gray-800 text-md sm:text-base font-semibold line-clamp-2 group-hover:text-amber-600 transition-colors text-justify">
              {title}
            </h3>

            <p className="text-gray-600 text-sm line-clamp-2 mt-1 hidden sm:block text-justify">
              {summary}
            </p>

            {/* Meta info */}
            <div className="flex items-center gap-3 text-gray-500 text-sm mt-2">
              {capacity && (
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-users text-amber-500"></i>
                  {capacity}
                </span>
              )}
              <span className="flex items-center gap-1">
                <i className="fa-regular fa-eye text-amber-500"></i>
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
    <Link to={`/dai-tiec/${slug}`} className="block group h-full">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden h-full flex flex-col transform hover:-translate-y-2">
        {/* Thumbnail */}
        <div className="relative h-64 sm:h-68 overflow-hidden">
          <LazyImage
            src={thumbnail || "/placeholder-catering.jpg"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-1000"
          />

          {/* Price badge */}
          {priceRange && (
            <span className="absolute top-3 left-3 bg-amber-500 text-white px-2.5 py-1 rounded-full text-sm font-medium shadow">
              <i className="fa-solid fa-tag mr-1"></i>
              {priceRange}
            </span>
          )}

          {/* Featured badge */}
          {isFeatured && (
            <span className="absolute top-3 right-3 bg-[#be290f] text-[#F1C412] px-2 py-1 rounded-full text-sm shadow">
              <i className="fa-solid fa-star"></i>
            </span>
          )}

          {/* Capacity badge */}
          {capacity && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
              <i className="fa-solid fa-users mr-1"></i>
              {capacity}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Category */}
          {category && (
            <span className="inline-block w-fit bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full text-sm font-medium mb-2">
              {category.name}
            </span>
          )}

          <h3 className="text-gray-800 text-md sm:text-base font-semibold line-clamp-2 group-hover:text-amber-600 transition-colors mb-2 text-justify">
            {title}
          </h3>

          <p className="text-gray-600 text-sm line-clamp-2 flex-1 text-justify">{summary}</p>

          {/* Service areas */}
          {serviceAreas && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 flex items-start gap-1">
                <i className="fa-solid fa-location-dot text-amber-500 mt-0.5"></i>
                <span className="line-clamp-1">{serviceAreas}</span>
              </p>
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center justify-between text-gray-500 text-sm mt-3 pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <i className="fa-regular fa-calendar text-amber-500"></i>
              {formatDate(publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <i className="fa-regular fa-eye text-amber-500"></i>
              {formatViewCount(viewCount)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CateringCard;
