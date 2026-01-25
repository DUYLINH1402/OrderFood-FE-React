import React, { useState, useRef, useEffect } from "react";
import { FacebookShareButton, FacebookMessengerShareButton, EmailShareButton } from "react-share";
import { SHARE_PLATFORMS } from "../../hooks/useShare";
import zaloIcon from "../../assets/icons/zaloIcon.svg";

// Format số lượt share cho hiển thị
const formatShareCount = (count) => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return count.toString();
};

/**
 * Component ShareButton với dropdown menu chia sẻ lên các mạng xã hội
 * @param {object} props
 * @param {string} props.url - URL để chia sẻ
 * @param {string} props.title - Tiêu đề chia sẻ
 * @param {string} props.description - Mô tả chia sẻ
 * @param {string} props.imageUrl - URL hình ảnh (cho Pinterest)
 * @param {string} props.hashtag - Hashtag chia sẻ
 * @param {number} props.shareCount - Số lượt share
 * @param {function} props.onShare - Callback khi share thành công
 * @param {function} props.onCopyLink - Callback khi copy link
 * @param {string} props.className - Custom class cho button
 */
const ShareButton = ({
  url,
  title = "",
  description = "",
  imageUrl = "",
  hashtag = "",
  shareCount = 0,
  onShare,
  onCopyLink,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý khi share thành công
  const handleShareSuccess = (platform) => {
    setIsOpen(false);
    if (onShare) {
      onShare(platform);
    }
  };

  // Xử lý copy link
  const handleCopyLink = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    if (onCopyLink) {
      onCopyLink();
    }
  };

  // Danh sách các nền tảng chia sẻ
  const shareOptions = [
    {
      platform: SHARE_PLATFORMS.FACEBOOK,
      name: "Facebook",
      icon: "fab fa-facebook-f",
      color: "text-blue-600",
      bgColor: "hover:bg-blue-50",
      Component: FacebookShareButton,
      props: { url, quote: description, hashtag },
    },
    {
      platform: SHARE_PLATFORMS.MESSENGER,
      name: "Messenger",
      icon: "fab fa-facebook-messenger",
      color: "text-purple-500",
      bgColor: "hover:bg-purple-50",
      Component: FacebookMessengerShareButton,
      props: { url, appId: "" }, // Có thể thêm Facebook App ID nếu cần
    },
    {
      platform: SHARE_PLATFORMS.ZALO,
      name: "Zalo",
      iconSvg: zaloIcon,
      color: "text-blue-500",
      bgColor: "hover:bg-blue-50",
      isCustom: true, // Zalo không có trong react-share, cần xử lý riêng
    },
  ];

  // Xử lý share Zalo (custom vì không có trong react-share)
  const handleZaloShare = () => {
    const zaloUrl = `https://zalo.me/share?u=${encodeURIComponent(url)}&t=${encodeURIComponent(
      title
    )}`;
    window.open(zaloUrl, "_blank", "width=600,height=400");
    handleShareSuccess(SHARE_PLATFORMS.ZALO);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Share Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 hover:scale-110 ${
          isOpen
            ? "bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/50"
            : "hover:bg-white/80"
        }`}>
        <i
          className={`fas fa-share-nodes text-base transition-all duration-300 ${
            isOpen ? "text-white" : "text-gray-700 group-hover:text-blue-500"
          }`}></i>

        {shareCount > 0 && (
          <span
            className={`text-sm font-bold min-w-[30px] text-center ${
              isOpen ? "text-white" : "text-gray-700"
            }`}>
            {formatShareCount(shareCount)}
          </span>
        )}

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sx px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg pointer-events-none z-10">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            Chia sẻ
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-65 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-fadeIn">
          {/* Header */}
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Chia sẻ qua</p>
          </div>

          {/* Share Options */}
          <div className="py-1">
            {shareOptions.map(
              ({ platform, name, icon, iconSvg, color, bgColor, Component, props, isCustom }) => {
                // Xử lý riêng cho Zalo (custom share)
                if (isCustom) {
                  return (
                    <button key={platform} onClick={handleZaloShare} className="w-full">
                      <div
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${bgColor}`}>
                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-50">
                          {iconSvg ? (
                            <img src={iconSvg} alt={name} className="w-7 h-7" />
                          ) : (
                            <i className={`${icon} ${color} text-sm`}></i>
                          )}
                        </div>
                        <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
                          {name}
                        </span>
                      </div>
                    </button>
                  );
                }

                // Các nền tảng khác sử dụng react-share
                return (
                  <Component
                    key={platform}
                    {...props}
                    onShareWindowClose={() => handleShareSuccess(platform)}
                    className="w-full">
                    <div
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${bgColor}`}>
                      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-50">
                        <i className={`${icon} ${color} text-sm`}></i>
                      </div>
                      <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
                        {name}
                      </span>
                    </div>
                  </Component>
                );
              }
            )}

            {/* Divider */}
            <div className="my-1 border-t border-gray-100"></div>

            {/* Copy Link Option */}
            <button onClick={handleCopyLink} className="w-full">
              <div className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-gray-100">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-50">
                  <i className="fas fa-link text-gray-600 text-sm"></i>
                </div>
                <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
                  Sao chép liên kết
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Custom animation styles */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ShareButton;
