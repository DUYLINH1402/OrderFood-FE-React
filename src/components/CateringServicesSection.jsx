// CateringServicesSection.jsx - Component hiển thị dịch vụ đãi tiệc trên trang chủ
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBlogsByType } from "../services/service/blogService";
import { BLOG_TYPES } from "../constants/blogConstants";
import CateringCard from "./CateringCard";
import NewsSkeleton from "./Skeleton/NewsSkeleton";

const CateringServicesSection = () => {
  const navigate = useNavigate();
  const [featuredBlog, setFeaturedBlog] = useState(null);
  const [secondBlog, setSecondBlog] = useState(null);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCateringServices = async () => {
      try {
        // Lấy danh sách bài viết theo type CATERING_SERVICES
        const blogsData = await getBlogsByType(BLOG_TYPES.CATERING_SERVICES, 0, 10);
        const blogs = Array.isArray(blogsData?.content) ? blogsData.content : [];

        if (blogs.length === 0) {
          setLoading(false);
          return;
        }

        // Tìm bài viết nổi bật (isFeatured = true) hoặc lấy bài đầu tiên
        const featuredItem = blogs.find((blog) => blog.isFeatured) || blogs[0];
        setFeaturedBlog(featuredItem);

        // Lọc các bài còn lại (không bao gồm featured)
        const remainingBlogs = blogs.filter((blog) => blog.id !== featuredItem.id);

        if (remainingBlogs.length > 0) {
          setSecondBlog(remainingBlogs[0]);
          // Lấy 4 bài còn lại cho bên phải
          setLatestBlogs(remainingBlogs.slice(1, 5));
        }
      } catch (error) {
        console.error("Lỗi khi tải dịch vụ đãi tiệc:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCateringServices();
  }, []);

  if (loading) {
    return <NewsSkeleton />;
  }

  // Kiểm tra không có dữ liệu
  if (!featuredBlog && latestBlogs.length === 0) {
    return (
      <div className="glass-box p-8 text-center">
        <div className="text-gray-500 text-md">
          <i className="fa-solid fa-utensils text-4xl mb-3 text-gray-400"></i>
          <p>Chưa có dịch vụ đãi tiệc nào.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-box p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Layout chính: 2 bài bên trái, danh sách bên phải */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Cột trái - 2 bài viết (Featured + Horizontal) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Featured Blog - Bài nổi bật lớn */}
            {featuredBlog && (
              <div className="flex-1">
                <CateringCard blog={featuredBlog} variant="featured" />
              </div>
            )}

            {/* Second Blog - Bài thứ 2 dạng horizontal */}
            {secondBlog && (
              <div>
                <CateringCard blog={secondBlog} variant="horizontal" />
              </div>
            )}
          </div>

          {/* Cột phải - Danh sách bài viết mới */}
          <div className="lg:col-span-5">
            <div className="flex flex-col gap-3 sm:gap-4">
              {latestBlogs.map((blog) => (
                <CateringCard key={blog.id} blog={blog} variant="horizontal" />
              ))}
            </div>
          </div>
        </div>

        {/* Nút xem thêm */}
        <div className="text-center mt-6 sm:mt-8">
          <button
            onClick={() => navigate("/dai-tiec")}
            className="px-8 py-3 bg-[#f59e0b] text-white text-md font-medium rounded-lg hover:bg-[#d97706] transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center gap-2">
            <span>Xem tất cả gói tiệc</span>
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CateringServicesSection;
