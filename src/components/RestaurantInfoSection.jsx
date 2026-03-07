// RestaurantInfoSection.jsx - Component hiển thị thông tin nhà hàng trên trang chủ
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getRestaurantInfo } from "../services/service/restaurantService";
import RestaurantInfoSkeleton from "./Skeleton/RestaurantInfoSkeleton";
import LazyImage from "./LazyImage";

const RestaurantInfoSection = () => {
  const navigate = useNavigate();
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      try {
        const data = await getRestaurantInfo();
        setRestaurantInfo(data);
      } catch (error) {
        console.error("Lỗi khi tải thông tin nhà hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantInfo();
  }, []);

  // Chuyển đổi URL video YouTube sang dạng embed
  const getYoutubeEmbedUrl = useCallback((url) => {
    if (!url) return null;

    // Xử lý các dạng URL YouTube khác nhau
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`;
    }

    return null;
  }, []);

  // Xử lý click vào thumbnail
  const handleThumbnailClick = (index) => {
    setActiveImageIndex(index);
  };

  // Mở modal video
  const openVideoModal = () => {
    setIsVideoModalOpen(true);
  };

  // Đóng modal video
  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
  };

  // Xử lý click ra ngoài để đóng modal
  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeVideoModal();
    }
  };

  if (loading) {
    return <RestaurantInfoSkeleton />;
  }

  if (!restaurantInfo) {
    return null;
  }

  const { name, logoUrl, address, phoneNumber, videoUrl, description, openingHours, galleries } =
    restaurantInfo;

  // Sắp xếp galleries theo displayOrder
  const sortedGalleries = galleries
    ? [...galleries].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  const activeImage = sortedGalleries[activeImageIndex]?.imageUrl || logoUrl;
  const embedUrl = getYoutubeEmbedUrl(videoUrl);

  return (
    <>
      <div className="glass-box p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            {/* Left: Image Gallery */}
            <div className="relative">
              {/* Main Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl group">
                <LazyImage
                  src={activeImage}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Video button overlay */}
                {embedUrl && (
                  <button
                    onClick={openVideoModal}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-label="Xem video giới thiệu">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                      <i className="fa-solid fa-play text-[#199b7e] text-2xl sm:text-3xl ml-1"></i>
                    </div>
                  </button>
                )}

                {/* Badge góc */}
                <div className="absolute top-3 left-3 px-3 py-1.5 bg-[#199b7e] text-white text-sx font-medium rounded-full shadow-md">
                  <i className="fa-solid fa-star mr-1"></i>
                  Nhà hàng uy tín
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {sortedGalleries.length > 1 && (
                <div className="flex gap-2 mt-3 justify-center overflow-x-auto pb-2">
                  {sortedGalleries.map((gallery, index) => (
                    <button
                      key={gallery.id}
                      onClick={() => handleThumbnailClick(index)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        index === activeImageIndex
                          ? "border-[#199b7e] shadow-lg scale-105"
                          : "border-transparent hover:border-gray-300 opacity-70 hover:opacity-100"
                      }`}>
                      <LazyImage
                        src={gallery.imageUrl}
                        alt={`${name} - Ảnh ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Restaurant Info */}
            <div className="flex flex-col gap-4 sm:gap-5">
              {/* Logo & Name */}
              <div className="flex items-center gap-4">
                {logoUrl && (
                  <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-3 border-[#199b7e]/20 shadow-lg bg-white p-1">
                    <LazyImage
                      src={logoUrl}
                      alt={`Logo ${name}`}
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
                    {name}
                  </h2>
                </div>
              </div>

              {/* Description */}
              {description && (
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {description}
                </p>
              )}

              {/* Info Cards */}
              <div className="grid grid-cols-1 gap-3">
                {/* Địa chỉ */}
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-shadow duration-300">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#199b7e] text-white rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="flex justify-star text-sx text-gray-500 font-medium uppercase tracking-wide">
                      Địa chỉ
                    </p>
                    <p className="text-sm sm:text-base text-gray-700 font-medium mt-0.5 line-clamp-2">
                      {address}
                    </p>
                  </div>
                </div>

                {/* Điện thoại */}
                <a
                  href={`tel:${phoneNumber?.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow duration-300 group">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="flex justify-star text-sx text-gray-500 font-medium uppercase tracking-wide">
                      Hotline
                    </p>
                    <p className="text-sm sm:text-base text-gray-700 font-medium mt-0.5">
                      {phoneNumber}
                    </p>
                  </div>
                </a>

                {/* Giờ mở cửa */}
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100 hover:shadow-md transition-shadow duration-300">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-clock"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="flex justify-star text-sx text-gray-500 font-medium uppercase tracking-wide">
                      Giờ mở cửa
                    </p>
                    <p className="text-sm sm:text-base text-gray-700 font-medium mt-0.5">
                      {openingHours}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-2">
                <button
                  onClick={() => navigate("/mon-an")}
                  className="flex-1 sm:flex-none px-6 py-3 bg-[#199b7e] text-white text-sm sm:text-base font-medium rounded-xl hover:bg-[#148567] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2">
                  <i className="fa-solid fa-utensils"></i>
                  <span>Xem thực đơn</span>
                </button>
                <button
                  onClick={() => navigate("/gioi-thieu")}
                  className="flex-1 sm:flex-none px-6 py-3 bg-white text-[#199b7e] text-sm sm:text-base font-medium rounded-xl border-2 border-[#199b7e] hover:bg-[#199b7e] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2">
                  <i className="fa-solid fa-info-circle"></i>
                  <span>Tìm hiểu thêm</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && embedUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={handleModalBackdropClick}>
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            {/* Close button */}
            <button
              onClick={closeVideoModal}
              className="absolute -top-12 right-0 sm:top-3 sm:right-3 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors duration-300"
              aria-label="Đóng video">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>

            {/* Video iframe */}
            <iframe
              src={embedUrl}
              title="Video giới thiệu nhà hàng"
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen></iframe>
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantInfoSection;
