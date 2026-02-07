// NewsSection.jsx - Component hiển thị tin tức trên trang chủ
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFeaturedBlogs, getBlogs } from "../services/service/blogService";
import NewsCard from "./NewsCard";
import NewsSkeleton from "./Skeleton/NewsSkeleton";

const NewsSection = () => {
  const navigate = useNavigate();
  const [featuredBlog, setFeaturedBlog] = useState(null);
  const [secondBlog, setSecondBlog] = useState(null);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Lấy bài viết nổi bật để làm featured
        const featured = await getFeaturedBlogs(1);

        // Lấy danh sách bài viết mới nhất
        const blogsData = await getBlogs(0, 6);
        const blogs = blogsData?.content || [];

        // Set featured blog (bài đầu tiên bên trái)
        if (featured && featured.length > 0) {
          setFeaturedBlog(featured[0]);
        } else if (blogs.length > 0) {
          setFeaturedBlog(blogs[0]);
        }

        // Set second blog (bài thứ 2 bên trái)
        const featuredId = featured?.[0]?.id || blogs[0]?.id;
        const remainingBlogs = blogs.filter((blog) => blog.id !== featuredId);

        if (remainingBlogs.length > 0) {
          setSecondBlog(remainingBlogs[0]);
          // Lấy 4 bài còn lại cho bên phải
          setLatestBlogs(remainingBlogs.slice(1, 5));
        }
      } catch (error) {
        console.error("Lỗi khi tải tin tức:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <NewsSkeleton />;
  }

  // Kiểm tra không có dữ liệu
  if (!featuredBlog && latestBlogs.length === 0) {
    return (
      <div className="glass-box p-8 text-center">
        <div className="text-gray-500 text-md">
          <i className="fa-regular fa-newspaper text-4xl mb-3 text-gray-400"></i>
          <p>Chưa có tin tức nào.</p>
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
                <NewsCard blog={featuredBlog} variant="featured" />
              </div>
            )}

            {/* Second Blog - Bài thứ 2 dạng horizontal */}
            {secondBlog && (
              <div>
                <NewsCard blog={secondBlog} variant="horizontal" />
              </div>
            )}
          </div>

          {/* Cột phải - Danh sách bài viết mới */}
          <div className="lg:col-span-5">
            <div className="flex flex-col gap-3 sm:gap-4">
              {latestBlogs.map((blog) => (
                <NewsCard key={blog.id} blog={blog} variant="horizontal" />
              ))}
            </div>
          </div>
        </div>

        {/* Nút xem thêm */}
        <div className="text-center mt-6 sm:mt-8">
          <button
            onClick={() => navigate("/tin-tuc")}
            className="px-8 py-3 bg-[#199b7e] text-white text-md font-medium rounded-lg hover:bg-[#148567] transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center gap-2">
            <span>Xem tất cả tin tức</span>
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsSection;
