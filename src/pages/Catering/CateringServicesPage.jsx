import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getBlogsByType, searchBlogs } from "../../services/service/blogService";
import { BLOG_TYPES } from "../../constants/blogConstants";
import CateringCard from "../../components/CateringCard";
import { NewsPageSkeleton } from "../../components/Skeleton/NewsSkeleton";
import GlassPageWrapper from "../../components/GlassPageWrapper";
import AOS from "aos";
import "aos/dist/aos.css";

const CateringServicesPage = () => {
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
          // Tìm kiếm và lọc theo CATERING_SERVICES
          data = await searchBlogs(searchKeyword, pageNum, pageSize);
          if (Array.isArray(data?.content)) {
            data.content = data.content.filter(
              (blog) => blog.blogType === BLOG_TYPES.CATERING_SERVICES
            );
          }
        } else {
          // Lấy bài viết theo type CATERING_SERVICES
          data = await getBlogsByType(BLOG_TYPES.CATERING_SERVICES, pageNum, pageSize);
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
        console.error("Lỗi khi tải dịch vụ đãi tiệc:", error);
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
              Dịch vụ Đãi tiệc lưu động
            </h1>
            <p
              data-aos="fade-up"
              data-aos-delay="100"
              data-aos-duration="600"
              className="text-md sm:text-base text-gray-600 max-w-2xl mx-auto">
              Dịch vụ đãi tiệc chuyên nghiệp cho tiệc cưới, sinh nhật, hội nghị và các sự kiện đặc
              biệt
            </p>
          </div>

          {/* Highlight features */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            data-aos="fade-up"
            data-aos-delay="150"
            data-aos-duration="600">
            <div className="bg-white rounded-xl p-4 text-center shadow-md">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fa-solid fa-utensils text-amber-500 text-xl"></i>
              </div>
              <p className="text-sm font-medium text-gray-700">Thực đơn đa dạng</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-md">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fa-solid fa-users text-amber-500 text-xl"></i>
              </div>
              <p className="text-sm font-medium text-gray-700">Từ 50 - 1000+ khách</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-md">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fa-solid fa-truck text-amber-500 text-xl"></i>
              </div>
              <p className="text-sm font-medium text-gray-700">Phục vụ tận nơi</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-md">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fa-solid fa-certificate text-amber-500 text-xl"></i>
              </div>
              <p className="text-sm font-medium text-gray-700">Chất lượng đảm bảo</p>
            </div>
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
                    placeholder="Tìm kiếm gói tiệc, dịch vụ..."
                    className="w-full px-5 py-3 pl-11 
                      border-2 border-gray-200 rounded-xl
                      focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10
                      transition-all duration-300
                      text-gray-700 placeholder:text-gray-400 text-sm
                      shadow-sm hover:shadow-md"
                  />
                  <i
                    className="fa-solid fa-search text-base
                      absolute left-4 top-1/2 -translate-y-1/2 
                      text-gray-400 group-focus-within:text-amber-500
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
                    bg-gradient-to-r from-amber-500 to-amber-600
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
                  className="mt-4 p-3.5 bg-gradient-to-r from-amber-500/5 to-amber-600/5 
                    rounded-xl border border-amber-500/20
                    flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-filter text-amber-500 text-sm"></i>
                    <span className="text-gray-700 text-sm">
                      Tìm thấy <span className="font-semibold text-amber-500">{totalElements}</span>{" "}
                      kết quả cho
                      <span className="font-semibold text-gray-800"> "{searchKeyword}"</span>
                    </span>
                  </div>

                  <button
                    onClick={clearSearch}
                    className="flex items-center gap-1.5 px-3.5 py-2
                      text-amber-500 hover:text-white
                      hover:bg-amber-500 
                      rounded-lg border border-amber-500
                      transition-all duration-300
                      font-medium text-sm">
                    <span>Xóa bộ lọc</span>
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
              <i className="fa-solid fa-utensils text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Không tìm thấy dịch vụ</h3>
              <p className="text-gray-500 text-md mb-4">
                {searchKeyword
                  ? `Không có kết quả cho "${searchKeyword}"`
                  : "Chưa có dịch vụ nào trong danh mục này"}
              </p>
              {searchKeyword && (
                <button
                  onClick={clearSearch}
                  className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-md">
                  Xem tất cả dịch vụ
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
                    <CateringCard blog={blog} variant="vertical" />
                  </div>
                ))}
              </div>

              {/* Load more button */}
              {page < totalPages - 1 && (
                <div className="text-center mt-10" data-aos="fade-up" data-aos-duration="600">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-white border-2 border-amber-500 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-all duration-300 font-medium text-md disabled:opacity-50 inline-flex items-center gap-2">
                    {loadingMore ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <span>Đang tải...</span>
                      </>
                    ) : (
                      <>
                        <span>Xem thêm gói tiệc</span>
                        <i className="fa-solid fa-chevron-down"></i>
                      </>
                    )}
                  </button>
                  <p className="text-gray-500 text-sm mt-2">
                    Hiển thị {blogs.length} / {totalElements} gói tiệc
                  </p>
                </div>
              )}
            </>
          )}

          {/* Contact CTA */}
          <div
            className="mt-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-8 text-center text-white"
            data-aos="fade-up"
            data-aos-duration="600">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              Bạn cần tư vấn về dịch vụ đãi tiệc?
            </h2>
            <p className="text-sm text-white/90 mb-6 max-w-xl mx-auto">
              Liên hệ với chúng tôi để được tư vấn miễn phí và nhận báo giá chi tiết cho sự kiện của
              bạn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:19001234"
                className="text-sm px-6 py-3 bg-white text-amber-600 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2">
                <i className="fa-solid fa-phone"></i>
                Hotline: 1900.1234
              </a>
              <a
                href="/lien-he"
                className="text-sm px-6 py-3 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 transition-colors inline-flex items-center justify-center gap-2">
                <i className="fa-solid fa-envelope"></i>
                Gửi yêu cầu báo giá
              </a>
            </div>
          </div>
        </div>
      </div>
    </GlassPageWrapper>
  );
};

export default CateringServicesPage;
