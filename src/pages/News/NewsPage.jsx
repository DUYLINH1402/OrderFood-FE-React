import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getBlogsByType,
  getBlogCategoriesByType,
  searchBlogs,
} from "../../services/service/blogService";
import { BLOG_TYPES } from "../../constants/blogConstants";
import NewsCard from "../../components/NewsCard";
import { NewsPageSkeleton } from "../../components/Skeleton/NewsSkeleton";
import GlassPageWrapper from "../../components/GlassPageWrapper";
import AOS from "aos";
import "aos/dist/aos.css";

const NewsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 9;

  // Filters
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "all");
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

  // Load categories theo loại NEWS_PROMOTIONS
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getBlogCategoriesByType(BLOG_TYPES.NEWS_PROMOTIONS);
      // Đảm bảo data luôn là mảng để tránh lỗi .map()
      setCategories(Array.isArray(data) ? data : []);
    };
    fetchCategories();
  }, []);

  // Load blogs based on filters
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
          // Tìm kiếm và lọc theo NEWS_PROMOTIONS
          data = await searchBlogs(searchKeyword, pageNum, pageSize);
          if (Array.isArray(data?.content)) {
            data.content = data.content.filter(
              (blog) => blog.blogType === BLOG_TYPES.NEWS_PROMOTIONS
            );
          }
        } else if (activeCategory && activeCategory !== "all") {
          // Lấy bài viết theo type và lọc theo danh mục
          data = await getBlogsByType(BLOG_TYPES.NEWS_PROMOTIONS, pageNum, pageSize);
          if (Array.isArray(data?.content)) {
            data.content = data.content.filter((blog) => blog.category?.slug === activeCategory);
          }
        } else {
          // Lấy bài viết theo type NEWS_PROMOTIONS
          data = await getBlogsByType(BLOG_TYPES.NEWS_PROMOTIONS, pageNum, pageSize);
        }

        // Đảm bảo newBlogs luôn là mảng để tránh lỗi .map()
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
        console.error("Lỗi khi tải tin tức:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeCategory, searchKeyword]
  );

  // Initial load and filter changes
  useEffect(() => {
    fetchBlogs(0, false);
  }, [fetchBlogs]);

  // Handle category change
  const handleCategoryChange = (categorySlug) => {
    setActiveCategory(categorySlug);
    setSearchKeyword("");
    setSearchInput("");

    // Update URL params
    if (categorySlug === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", categorySlug);
    }
    searchParams.delete("search");
    setSearchParams(searchParams);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchKeyword(searchInput.trim());
      setActiveCategory("all");
      searchParams.set("search", searchInput.trim());
      searchParams.delete("category");
      setSearchParams(searchParams);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchKeyword("");
    setSearchInput("");
    setActiveCategory("all");
    searchParams.delete("search");
    searchParams.delete("category");
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
      <div className=" pb-16">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1
              data-aos="fade-down"
              data-aos-duration="600"
              className="dongxanh-section-title text-3xl font-bold mb-6 text-[#fff]">
              Tin tức & Blog
            </h1>
            <p
              data-aos="fade-up"
              data-aos-delay="100"
              data-aos-duration="600"
              className="text-md sm:text-base text-gray-600 max-w-2xl mx-auto">
              Cập nhật những thông tin mới nhất về khuyến mãi, sự kiện và các bài viết hữu ích từ
              Đồng Xanh
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
                    placeholder="Tìm kiếm bài viết..."
                    className="w-full px-5 py-3 pl-11 
            border-2 border-gray-200 rounded-xl
            focus:outline-none focus:border-[#199b7e] focus:ring-4 focus:ring-[#199b7e]/10
            transition-all duration-300
            text-gray-700 placeholder:text-gray-400 text-sm
            shadow-sm hover:shadow-md"
                  />
                  <i
                    className="fa-solid fa-search text-base
          absolute left-4 top-1/2 -translate-y-1/2 
          text-gray-400 group-focus-within:text-[#199b7e]
          transition-colors duration-300"></i>

                  {/* Clear button inside input */}
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
          bg-gradient-to-r from-[#199b7e] to-[#148567]
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
                  className="mt-4 p-3.5 bg-gradient-to-r from-[#199b7e]/5 to-[#148567]/5 
        rounded-xl border border-[#199b7e]/20
        flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-filter text-[#199b7e] text-sm"></i>
                    <span className="text-gray-700 text-sm">
                      Tìm thấy <span className="font-semibold text-[#199b7e]">{totalElements}</span>{" "}
                      kết quả cho
                      <span className="font-semibold text-gray-800"> "{searchKeyword}"</span>
                    </span>
                  </div>

                  <button
                    onClick={clearSearch}
                    className="flex items-center gap-1.5 px-3.5 py-2
            text-[#199b7e] hover:text-white
            hover:bg-[#199b7e] 
            rounded-lg border border-[#199b7e]
            transition-all duration-300
            font-medium text-sm">
                    <span>Xóa bộ lọc</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Categories filter */}
          <div className="mb-8" data-aos="fade-up" data-aos-delay="300" data-aos-duration="600">
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              <button
                onClick={() => handleCategoryChange("all")}
                className={`px-4 py-2 rounded-full text-sm sm:text-md font-medium transition-all duration-200 ${
                  activeCategory === "all"
                    ? "bg-[#199b7e] text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}>
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm sm:text-md font-medium transition-all duration-200 ${
                    activeCategory === cat.slug
                      ? "bg-[#199b7e] text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}>
                  {cat.name}
                  {cat.blogCount > 0 && (
                    <span className="ml-1.5 text-sm opacity-75">({cat.blogCount})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <NewsPageSkeleton />
          ) : blogs.length === 0 ? (
            <div className="text-center py-16">
              <i className="fa-regular fa-newspaper text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Không tìm thấy bài viết</h3>
              <p className="text-gray-500 text-md mb-4">
                {searchKeyword
                  ? `Không có kết quả cho "${searchKeyword}"`
                  : "Chưa có bài viết nào trong danh mục này"}
              </p>
              {(searchKeyword || activeCategory !== "all") && (
                <button
                  onClick={clearSearch}
                  className="px-6 py-2 bg-[#199b7e] text-white rounded-lg hover:bg-[#148567] transition-colors text-md">
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
                    <NewsCard blog={blog} variant="vertical" />
                  </div>
                ))}
              </div>

              {/* Load more button */}
              {page < totalPages - 1 && (
                <div className="text-center mt-10" data-aos="fade-up" data-aos-duration="600">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-white border-2 border-[#199b7e] text-[#199b7e] rounded-lg hover:bg-[#199b7e] hover:text-white transition-all duration-300 font-medium text-md disabled:opacity-50 inline-flex items-center gap-2">
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

export default NewsPage;
