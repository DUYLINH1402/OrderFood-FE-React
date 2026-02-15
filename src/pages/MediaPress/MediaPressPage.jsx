import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getBlogsByType, searchBlogs } from "../../services/service/blogService";
import { BLOG_TYPES } from "../../constants/blogConstants";
import MediaPressCard from "../../components/MediaPressCard";
import { NewsPageSkeleton } from "../../components/Skeleton/NewsSkeleton";
import GlassPageWrapper from "../../components/GlassPageWrapper";
import AOS from "aos";
import "aos/dist/aos.css";

const MediaPressPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 9;

  // Search
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get("search") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  // Khởi tạo AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 50,
    });
  }, []);

  // Refresh AOS khi blogs thay đổi
  useEffect(() => {
    AOS.refresh();
  }, [blogs]);

  // Load blogs based on search
  const fetchBlogs = useCallback(
    async (pageNum = 0, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        let data;

        if (searchKeyword) {
          // Tìm kiếm và lọc theo MEDIA_PRESS
          data = await searchBlogs(searchKeyword, pageNum, pageSize);
          if (Array.isArray(data?.content)) {
            data.content = data.content.filter((blog) => blog.blogType === BLOG_TYPES.MEDIA_PRESS);
          }
        } else {
          // Lấy bài viết theo type MEDIA_PRESS
          data = await getBlogsByType(BLOG_TYPES.MEDIA_PRESS, pageNum, pageSize);
        }

        const newBlogs = Array.isArray(data?.content) ? data.content : [];

        if (append) {
          setBlogs((prev) => [...prev, ...newBlogs]);
        } else {
          setBlogs(newBlogs);
        }

        setTotalPages(data?.totalPages || 0);
        setTotalElements(data?.totalElements || 0);
        setPage(pageNum);
      } catch (error) {
        console.error("Lỗi khi tải bài báo chí:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchKeyword]
  );

  // Initial load and filter changes
  useEffect(() => {
    fetchBlogs(0, false);
  }, [fetchBlogs]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchKeyword(searchInput.trim());
      searchParams.set("search", searchInput.trim());
      setSearchParams(searchParams);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchKeyword("");
    setSearchInput("");
    searchParams.delete("search");
    setSearchParams(searchParams);
  };

  // Load more
  const handleLoadMore = () => {
    if (page < totalPages - 1) {
      fetchBlogs(page + 1, true);
    }
  };

  return (
    <GlassPageWrapper>
      <div className="pt-32 pb-16">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1
              data-aos="fade-down"
              data-aos-duration="600"
              className="dongxanh-section-title text-3xl font-bold mb-6 text-[#fff]">
              Báo chí & Truyền thông
            </h1>
            <p
              data-aos="fade-up"
              data-aos-delay="100"
              data-aos-duration="600"
              className="text-md sm:text-base text-gray-600 max-w-4xl mx-auto">
              Những bài viết từ báo chí và truyền thông nói về Đồng Xanh
            </p>
          </div>

          {/* Search bar */}
          <div className="mb-8" data-aos="fade-up" data-aos-delay="200" data-aos-duration="600">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-3">
                <div className="relative flex-1 group">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Tìm kiếm bài báo..."
                    className="w-full px-5 py-3 pl-11 
                      border-2 border-gray-200 rounded-xl
                      focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                      transition-all duration-300
                      text-gray-700 placeholder:text-gray-400 text-sm
                      shadow-sm hover:shadow-md"
                  />
                  <i
                    className="fa-solid fa-search text-base
                      absolute left-4 top-1/2 -translate-y-1/2 
                      text-gray-400 group-focus-within:text-blue-500
                      transition-colors duration-300"></i>

                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => setSearchInput("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2
                        text-gray-400 hover:text-gray-600 text-base
                        transition-colors duration-200">
                      <i className="fa-solid fa-times"></i>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-7 py-3 
                    bg-gradient-to-r from-blue-500 to-blue-600
                    text-white rounded-xl font-medium text-sm
                    hover:shadow-lg hover:scale-105
                    active:scale-95
                    transition-all duration-300
                    flex items-center gap-2
                    min-w-[100px] justify-center">
                  <span className="hidden sm:inline">Tìm kiếm</span>
                </button>
              </div>

              {/* Search result info */}
              {searchKeyword && (
                <div
                  className="mt-4 p-3.5 bg-gradient-to-r from-blue-500/5 to-blue-600/5 
                    rounded-xl border border-blue-500/20
                    flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-filter text-blue-500 text-sm"></i>
                    <span className="text-gray-700 text-sm">
                      Tìm thấy <span className="font-semibold text-blue-500">{totalElements}</span>{" "}
                      kết quả cho
                      <span className="font-semibold text-gray-800"> "{searchKeyword}"</span>
                    </span>
                  </div>

                  <button
                    onClick={clearSearch}
                    className="flex items-center gap-1.5 px-3.5 py-2
                      text-blue-500 hover:text-white
                      hover:bg-blue-500 
                      rounded-lg border border-blue-500
                      transition-all duration-300
                      font-medium text-sm">
                    <span>Xóa tìm kiếm</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Content */}
          {loading ? (
            <NewsPageSkeleton />
          ) : blogs.length === 0 ? (
            <div className="text-center py-16">
              <i className="fa-solid fa-bullhorn text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Không tìm thấy bài viết</h3>
              <p className="text-gray-500 text-md mb-4">
                {searchKeyword
                  ? `Không có kết quả cho "${searchKeyword}"`
                  : "Chưa có bài viết báo chí nào"}
              </p>
              {searchKeyword && (
                <button
                  onClick={clearSearch}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-md">
                  Xem tất cả bài viết
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Blogs grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {blogs.map((blog, index) => (
                  <div
                    key={blog.id}
                    data-aos="fade-up"
                    data-aos-delay={100 + (index % 3) * 100}
                    data-aos-duration="600">
                    <MediaPressCard blog={blog} variant="vertical" />
                  </div>
                ))}
              </div>

              {/* Load more button */}
              {page < totalPages - 1 && (
                <div className="text-center mt-10" data-aos="fade-up" data-aos-duration="600">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-white border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300 font-medium text-md disabled:opacity-50 inline-flex items-center gap-2">
                    {loadingMore ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <span>Đang tải...</span>
                      </>
                    ) : (
                      <>
                        <span>Xem thêm bài viết</span>
                        <i className="fa-solid fa-chevron-down"></i>
                      </>
                    )}
                  </button>
                  <p className="text-gray-500 text-sm mt-2">
                    Hiển thị {blogs.length} / {totalElements} bài viết
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </GlassPageWrapper>
  );
};

export default MediaPressPage;
