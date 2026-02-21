// SearchBar.jsx - Tích hợp Algolia Search với Debounce
import "../assets/styles/components/SearchBar.module.scss";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import algoliasearch from "algoliasearch/lite";

// Khởi tạo Algolia client với biến môi trường
const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY
);
const index = searchClient.initIndex(import.meta.env.VITE_ALGOLIA_INDEX_NAME || "foods");

// Custom hook debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Format giá tiền VND
const formatPrice = (price) => {
  if (!price && price !== 0) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const SearchBar = ({ placeholder, setIsSearchExpanded }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Debounce search query với delay 300ms
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Xử lý body scroll khi expand
  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => document.body.classList.remove("no-scroll");
  }, [isExpanded]);

  // Gọi Algolia API khi debounced query thay đổi
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      try {
        const { hits } = await index.search(debouncedSearchQuery, {
          hitsPerPage: 20, // Giới hạn số kết quả hiển thị
          attributesToRetrieve: ["objectID", "name", "price", "image", "imageUrl", "slug"],
        });
        setSearchResults(hits);
        setShowDropdown(true);
      } catch (error) {
        console.log("Algolia search error:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  // Click outside để đóng search bar và dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (isExpanded) {
          handleCollapse();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  const handleExpand = () => {
    setIsExpanded(true);
    setIsSearchExpanded?.(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setIsSearchExpanded?.(false);
    setShowDropdown(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isExpanded) {
      handleExpand();
    }
  };

  // Xử lý input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      setIsLoading(true);
    }
  };

  // Xử lý click vào kết quả - chuyển hướng đến trang chi tiết món ăn theo slug
  const handleResultClick = (item) => {
    navigate(`/mon-an/chi-tiet/${item.slug}`);
    handleCollapse();
  };

  // Xử lý phím Enter
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleCollapse();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input Container */}
      <div
        className={`p-3 overflow-hidden cursor-pointer
          ${isExpanded ? "w-[270px]" : "w-[30px] md:w-[40px]"}
          h-[30px] md:h-[40px]
          bg-[#199b7e] shadow-[2px_2px_20px_rgba(0,0,0,0.08)] 
          rounded-full flex group items-center transition-all duration-300 ease-in-out`}
        onClick={handleClick}>
        <div className="flex items-center justify-center fill-white/70 md:ml-1 md:mt-1">
          {isLoading ? (
            // Loading spinner
            <svg
              className="animate-spin w-5 h-5 laptop:w-[20px] laptop:h-[20px] text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            // Search icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={1.8}
              className="w-6 h-6 laptop:w-[22px] laptop:h-[22px]">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
              />
            </svg>
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isExpanded ? placeholder || "Tìm kiếm món ăn..." : ""}
          className="border-none outline-none text-sm md:text-base bg-transparent w-full text-white placeholder-white/70 ml-2"
          onClick={(e) => e.stopPropagation()}
        />
        {/* Clear button */}
        {isExpanded && searchQuery && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSearchQuery("");
              setSearchResults([]);
              setShowDropdown(false);
              inputRef.current?.focus();
            }}
            className="text-white/70 hover:text-white transition-colors p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isExpanded && showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            // Loading state
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <svg
                  className="animate-spin w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm">Đang tìm kiếm...</span>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            // Empty state - Không tìm thấy kết quả
            <div className="p-4 text-center text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-10 h-10 mx-auto mb-2 text-gray-300">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <p className="font-medium">Không tìm thấy món ăn phù hợp</p>
              <p className="text-sm text-gray-400 mt-1">Thử tìm kiếm với từ khóa khác</p>
            </div>
          ) : (
            // Search results
            <ul className="divide-y divide-gray-100">
              {searchResults.map((item) => (
                <li
                  key={item.objectID}
                  onClick={() => handleResultClick(item)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                  {/* Ảnh món ăn */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={item.image || item.imageUrl || "/placeholder-food.png"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder-food.png";
                      }}
                    />
                  </div>
                  {/* Thông tin món ăn */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                    <p className="text-sm text-[#199b7e] font-semibold mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  {/* Arrow icon */}
                  <div className="flex-shrink-0 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Overlay khi dropdown mở (optional - để làm mờ background) */}
      {isExpanded && showDropdown && (
        <div className="fixed inset-0 bg-black/10 -z-10" onClick={handleCollapse} />
      )}
    </div>
  );
};

export default SearchBar;
