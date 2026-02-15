// Định nghĩa các loại nội dung Blog
export const BLOG_TYPES = {
  NEWS_PROMOTIONS: "NEWS_PROMOTIONS", // Tin tức & Khuyến mãi
  MEDIA_PRESS: "MEDIA_PRESS", // Báo chí & Truyền thông
  CATERING_SERVICES: "CATERING_SERVICES", // Dịch vụ đãi tiệc
};

// Thông tin hiển thị cho từng loại
export const BLOG_TYPE_INFO = {
  [BLOG_TYPES.NEWS_PROMOTIONS]: {
    label: "Tin tức & Khuyến mãi",
    icon: "fa-solid fa-newspaper",
    color: "#199b7e",
    path: "/tin-tuc",
    description: "Cập nhật tin tức, khuyến mãi và sự kiện mới nhất",
  },
  [BLOG_TYPES.MEDIA_PRESS]: {
    label: "Báo chí & Truyền thông",
    icon: "fa-solid fa-bullhorn",
    color: "#3b82f6",
    path: "/bao-chi",
    description: "Những bài viết từ báo chí nói về chúng tôi",
  },
  [BLOG_TYPES.CATERING_SERVICES]: {
    label: "Đãi tiệc lưu động",
    icon: "fa-solid fa-utensils",
    color: "#f59e0b",
    path: "/dai-tiec",
    description: "Dịch vụ đãi tiệc chuyên nghiệp cho mọi sự kiện",
  },
};

// Lấy thông tin theo type
export const getBlogTypeInfo = (type) => {
  return BLOG_TYPE_INFO[type] || BLOG_TYPE_INFO[BLOG_TYPES.NEWS_PROMOTIONS];
};
