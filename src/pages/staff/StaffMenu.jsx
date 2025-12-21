import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Pagination, TreeSelect, Select, Input } from "antd";
import { useAuth, usePermissions } from "../../hooks/auth/useAuth";
import { PERMISSIONS, ROLES } from "../../utils/roleConfig";
import {
  getBestSellerFoods,
  getFeaturedFoods,
  updateFoodStatusWithNote,
  getAllCategoriesWithChildren,
  getStaffMenuWithFilter,
  getFoodStats,
  invalidateStatsCache,
} from "../../services/service/staffMenuService";
import FoodDetailModal from "./modal/FoodDetailModal";
import StatusChangeModal from "./modal/StatusChangeModal";
import SpinnerCube from "../../components/Skeleton/SpinnerCube";
import {
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiStar,
  FiTrendingUp,
  FiTag,
  FiClock,
  FiEye,
  FiAlertCircle,
  FiCheckCircle,
  FiPackage,
  FiPercent,
  FiList,
  FiGrid,
  FiInfo,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

// Tab definitions
const TABS = {
  MENU: "menu",
  BESTSELLERS: "bestsellers",
  PROMOTIONS: "promotions",
};

// Placeholder image khi không có ảnh món ăn
const PLACEHOLDER_IMAGE = "https://placehold.co/400x300/f3f4f6/9ca3af?text=No+Image";

const StaffMenu = () => {
  const { userRole } = useAuth();
  const { hasPermission } = usePermissions();
  const { user: userFromRedux } = useSelector((state) => state.auth);

  // Main data states
  const [foods, setFoods] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [categories, setCategories] = useState([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.MENU);
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [showFilters, setShowFilters] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modal states
  const [selectedFood, setSelectedFood] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [foodsLoading, setFoodsLoading] = useState(false);

  // Last updated
  const [lastUpdated, setLastUpdated] = useState(null);

  // Global stats (thống kê toàn bộ hệ thống, không phụ thuộc vào filter/pagination)
  const [globalStats, setGlobalStats] = useState({
    total: 0,
    available: 0,
    unavailable: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Kiểm tra quyền ROLE_STAFF
  const isStaff = userRole === ROLES.STAFF || userRole === ROLES.ADMIN;

  // Danh sách các category slug "ảo" (virtual) - không filter được bằng categoryId
  // Các category này dựa trên flags (isBestSeller, isFeatured...) chứ không phải categoryId
  const VIRTUAL_CATEGORY_SLUGS = ["best-seller", "combo-khuyen-mai"];

  // Chuyển đổi categories thành treeData cho TreeSelect
  // Loại bỏ các virtual categories vì chúng không thể filter theo categoryId
  const categoryTreeData = useMemo(() => {
    const treeData = [
      {
        title: "Tất cả danh mục",
        value: "ALL",
        key: "ALL",
      },
    ];

    categories
      .filter((category) => category.id != null)
      // Loại bỏ virtual categories (BEST SELLER, Combo & Khuyến Mãi)
      .filter((category) => !VIRTUAL_CATEGORY_SLUGS.includes(category.slug))
      .forEach((category) => {
        const hasChildren = category.children?.length > 0;
        const parentNode = {
          title: (
            <span className="font-medium text-gray-800">
              {category.name}
              {hasChildren && (
                <span className="text-gray-400 text-xs ml-1">({category.children.length})</span>
              )}
            </span>
          ),
          value: `parent_${category.id}`,
          key: `parent_${category.id}`,
          children: hasChildren
            ? category.children.map((child) => ({
                title: <span className="text-gray-600">{child.name}</span>,
                value: `child_${child.id}`,
                key: `child_${child.id}`,
              }))
            : undefined,
        };
        treeData.push(parentNode);
      });

    return treeData;
  }, [categories]);

  // Helper: Lấy tất cả categoryIds từ selectedCategory (bao gồm cả children)
  // Nếu chọn category cha có children, trả về mảng tất cả children IDs
  // Nếu chọn category con (leaf), trả về mảng chỉ chứa ID đó
  const getCategoryIdsFromSelection = useCallback(
    (categoryValue) => {
      if (!categoryValue || categoryValue === "ALL") return [];

      // Parse categoryValue (có thể là "parent_4" hoặc "child_11")
      const parts = categoryValue.toString().split("_");
      if (parts.length !== 2) return [];

      const [type, idStr] = parts;
      const id = parseInt(idStr, 10);
      if (isNaN(id)) return [];

      if (type === "child") {
        // Nếu chọn category con, chỉ trả về ID đó
        return [id];
      }

      if (type === "parent") {
        // Nếu chọn category cha, lấy tất cả children IDs
        const parentCategory = categories.find((cat) => cat.id === id);
        if (parentCategory?.children?.length > 0) {
          return parentCategory.children.map((child) => child.id);
        }
        // Nếu category cha không có children, trả về ID của chính nó
        return [id];
      }

      return [];
    },
    [categories]
  );

  // Fetch foods với server-side pagination và filter (dùng API /api/foods/management)
  const fetchFoods = useCallback(
    async (page = 1, size = pageSize, filters = {}) => {
      try {
        setFoodsLoading(true);

        // API page bắt đầu từ 0
        const apiPage = page - 1;

        // Lấy danh sách categoryIds từ selection
        const categoryIds = filters.categoryIds || [];

        // Nếu có nhiều categoryIds (chọn category cha có children), gọi API cho từng category và merge
        if (categoryIds.length > 1) {
          // Gọi song song API cho tất cả categoryIds
          const promises = categoryIds.map((catId) =>
            getStaffMenuWithFilter({
              page: 0,
              size: 1000, // Lấy nhiều để merge
              name: filters.name || "",
              categoryId: catId,
              status: filters.status || "ALL",
            })
          );

          const responses = await Promise.all(promises);

          // Merge tất cả foods từ các response
          let allFoods = [];
          responses.forEach((response) => {
            if (response?.content && Array.isArray(response.content)) {
              allFoods = [...allFoods, ...response.content];
            } else if (Array.isArray(response)) {
              allFoods = [...allFoods, ...response];
            }
          });

          // Loại bỏ duplicate theo id
          const uniqueFoods = allFoods.filter(
            (food, index, self) => index === self.findIndex((f) => f.id === food.id)
          );

          // Phân trang client-side cho kết quả merge
          const startIndex = (page - 1) * size;
          const paginatedFoods = uniqueFoods.slice(startIndex, startIndex + size);

          setFoods(paginatedFoods);
          setTotalElements(uniqueFoods.length);
          setTotalPages(Math.ceil(uniqueFoods.length / size));
        } else {
          // Gọi API bình thường với 1 categoryId hoặc ALL
          const singleCategoryId = categoryIds.length === 1 ? categoryIds[0] : "ALL";

          const response = await getStaffMenuWithFilter({
            page: apiPage,
            size,
            name: filters.name || "",
            categoryId: singleCategoryId,
            status: filters.status || "ALL",
          });

          if (response?.content && Array.isArray(response.content)) {
            setFoods(response.content);
            setTotalElements(response.totalElements || 0);
            setTotalPages(response.totalPages || 0);
          } else if (Array.isArray(response)) {
            setFoods(response);
            setTotalElements(response.length);
            setTotalPages(Math.ceil(response.length / size));
          }
        }
      } catch (err) {
        console.log("Không thể tải món ăn:", err.message);
        setFoods([]);
      } finally {
        setFoodsLoading(false);
      }
    },
    [pageSize]
  );

  // Fetch stats bất đồng bộ (không block UI chính)
  const fetchStats = useCallback(async (forceRefresh = false) => {
    try {
      setStatsLoading(true);
      const statsData = await getFoodStats(forceRefresh);
      if (statsData) {
        setGlobalStats({
          total: statsData.total || 0,
          available: statsData.available || 0,
          unavailable: statsData.unavailable || 0,
        });
      }
    } catch (err) {
      console.log("Không thể tải thống kê:", err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch initial data (categories, bestsellers, featured) - chỉ 1 lần
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories kèm children
      try {
        const categoriesData = await getAllCategoriesWithChildren();
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }
      } catch (err) {
        console.log("Không thể tải danh mục:", err.message);
      }

      // Fetch best sellers
      try {
        const bestSellersResponse = await getBestSellerFoods(0, 10);
        if (bestSellersResponse?.content && Array.isArray(bestSellersResponse.content)) {
          setBestSellers(bestSellersResponse.content);
        } else if (Array.isArray(bestSellersResponse)) {
          setBestSellers(bestSellersResponse);
        }
      } catch (err) {
        console.log("Không thể tải món bán chạy:", err.message);
      }

      // Fetch featured foods
      try {
        const featuredResponse = await getFeaturedFoods(0, 10);
        if (featuredResponse?.content && Array.isArray(featuredResponse.content)) {
          setFeaturedFoods(featuredResponse.content);
        } else if (Array.isArray(featuredResponse)) {
          setFeaturedFoods(featuredResponse);
        }
      } catch (err) {
        console.log("Không thể tải món đặc biệt:", err.message);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch - chỉ load categories, bestsellers, featured 1 lần
  useEffect(() => {
    if (isStaff) {
      fetchInitialData();
      // Load stats bất đồng bộ (không block UI)
      fetchStats();
    } else {
      setError("Bạn không có quyền truy cập trang này");
      setLoading(false);
    }
  }, [isStaff, fetchInitialData, fetchStats]);

  // Debounce search term (300ms delay để tránh gọi API quá nhiều)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Khi filter thay đổi, reset về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory, selectedStatus]);

  // Fetch foods khi page/pageSize hoặc filter thay đổi (server-side pagination + filtering)
  useEffect(() => {
    if (isStaff && activeTab === TABS.MENU) {
      const categoryIds = getCategoryIdsFromSelection(selectedCategory);
      fetchFoods(currentPage, pageSize, {
        name: debouncedSearchTerm,
        categoryIds: categoryIds,
        status: selectedStatus,
      });
    }
  }, [
    isStaff,
    activeTab,
    currentPage,
    pageSize,
    debouncedSearchTerm,
    selectedCategory,
    selectedStatus,
    fetchFoods,
    getCategoryIdsFromSelection,
  ]);

  // Handle refresh
  const handleRefresh = async () => {
    if (activeTab === TABS.MENU) {
      const categoryIds = getCategoryIdsFromSelection(selectedCategory);
      fetchFoods(currentPage, pageSize, {
        name: debouncedSearchTerm,
        categoryIds: categoryIds,
        status: selectedStatus,
      });
      // Refresh global stats (forceRefresh = true để bỏ qua cache)
      fetchStats(true);
    } else {
      fetchInitialData();
      fetchStats(true);
    }
    toast.info("Đang làm mới dữ liệu...");
  };

  // Handle page change
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    if (size !== pageSize) {
      setPageSize(size);
    }
    // Scroll lên đầu danh sách
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // Foods đã được filter từ server, không cần filter lại ở client
  const filteredFoods = foods;

  // Statistics - sử dụng global stats từ toàn bộ hệ thống
  const stats = globalStats;

  // Open food detail modal
  const handleViewDetail = (food) => {
    setSelectedFood(food);
    setShowDetailModal(true);
  };

  // Open status change modal
  const handleOpenStatusModal = (food, newStatus) => {
    setSelectedFood(food);
    setPendingStatus(newStatus);
    setShowStatusModal(true);
  };

  // Confirm status change
  const handleConfirmStatusChange = async (foodId, newStatus, note) => {
    try {
      setStatusLoading(true);
      // API trả về FoodResponse trực tiếp (không có wrapper success)
      const response = await updateFoodStatusWithNote(foodId, newStatus, note);

      // Kiểm tra response hợp lệ (có id hoặc status)
      if (response && (response.id || response.status)) {
        // Update local state
        setFoods((prev) =>
          prev.map((food) =>
            food.id === foodId
              ? { ...food, status: newStatus, statusNote: note, lastStatusNote: note }
              : food
          )
        );

        // Cập nhật local stats ngay lập tức (không đợi API)
        setGlobalStats((prev) => {
          const oldStatus = foods.find((f) => f.id === foodId)?.status;
          if (oldStatus === newStatus) return prev;

          return {
            ...prev,
            available: newStatus === "AVAILABLE" ? prev.available + 1 : prev.available - 1,
            unavailable: newStatus === "UNAVAILABLE" ? prev.unavailable + 1 : prev.unavailable - 1,
          };
        });

        // Invalidate cache để lần sau sẽ lấy dữ liệu mới
        invalidateStatsCache();

        const statusLabels = {
          AVAILABLE: "có sẵn",
          UNAVAILABLE: "hết hàng",
        };
        toast.success(`Đã cập nhật món ăn thành "${statusLabels[newStatus]}"`);

        // Close modal
        setShowStatusModal(false);
        setSelectedFood(null);
        setPendingStatus(null);

      } else {
        // Response không hợp lệ
        toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Error updating food status:", err);
      // Hiển thị lỗi chi tiết từ server nếu có
      const errorMessage = err.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái";
      toast.error(errorMessage);
    } finally {
      setStatusLoading(false);
    }
  };

  // Get status badge config
  const getStatusConfig = (status) => {
    switch (status) {
      case "AVAILABLE":
        return { bg: "bg-green-100", text: "text-green-800", label: "Có sẵn", icon: FiCheckCircle };
      case "UNAVAILABLE":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          label: "Hết hàng",
          icon: FiAlertCircle,
        };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", label: "Không xác định", icon: FiInfo };
    }
  };

  // Render không có quyền
  if (!isStaff) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 tablet:p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
          <FiAlertCircle className="w-12 h-12 tablet:w-16 tablet:h-16 text-red-500 mx-auto mb-3 tablet:mb-4" />
          <h2 className="text-md tablet:text-lg desktop:text-xl font-semibold text-gray-900 mb-2">
            Không có quyền truy cập
          </h2>
          <p className="text-sm tablet:text-md desktop:text-base text-gray-600">
            Bạn cần có quyền Staff hoặc Admin để xem trang này.
          </p>
        </div>
      </div>
    );
  }

  // Render Food Card (Grid View)
  const renderFoodCardGrid = (food) => {
    const statusConfig = getStatusConfig(food.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div
        key={food.id}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
        {/* Image */}
        <div className="relative h-36 tablet:h-44 desktop:h-48 bg-gray-100 overflow-hidden">
          <img
            src={food.imageUrl || PLACEHOLDER_IMAGE}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = PLACEHOLDER_IMAGE;
            }}
          />
          {/* Status badge */}
          <div className="absolute top-2 tablet:top-3 right-2 tablet:right-3">
            <span
              className={`inline-flex items-center px-2 tablet:px-2.5 py-0.5 tablet:py-1 text-sx tablet:text-sm font-semibold rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
              <StatusIcon className="w-5 h-5 tablet:w-5 tablet:h-5 mr-0.5 tablet:mr-1" />
              {statusConfig.label}
            </span>
          </div>
          {/* Featured / BestSeller / New badges */}
          {(food.isFeatured || food.isBestSeller || food.isNew) && (
            <div className="absolute top-2 tablet:top-3 left-2 tablet:left-3 flex flex-col gap-1">
              {food.isBestSeller && (
                <span className="inline-flex items-center px-2 tablet:px-2.5 py-0.5 tablet:py-1 text-sx tablet:text-sm font-semibold rounded-full bg-red-100 text-red-800">
                  <FiTrendingUp className="w-5 h-5 tablet:w-5 tablet:h-5 mr-0.5 tablet:mr-1" />
                  Bán chạy
                </span>
              )}
              {food.isFeatured && (
                <span className="inline-flex items-center px-2 tablet:px-2.5 py-0.5 tablet:py-1 text-sx tablet:text-sm font-semibold rounded-full bg-orange-100 text-orange-800">
                  <FiStar className="w-5 h-5 tablet:w-5 tablet:h-5 mr-0.5 tablet:mr-1" />
                  Đặc biệt
                </span>
              )}
              {food.isNew && (
                <span className="inline-flex items-center px-2 tablet:px-2.5 py-0.5 tablet:py-1 text-sx tablet:text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                  <FiTag className="w-5 h-5 tablet:w-5 tablet:h-5 mr-0.5 tablet:mr-1" />
                  Mới
                </span>
              )}
            </div>
          )}
          {/* View detail button */}
          <button
            onClick={() => handleViewDetail(food)}
            className="absolute bottom-2 tablet:bottom-3 right-2 tablet:right-3 p-1.5 tablet:p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
            title="Xem chi tiết">
            <FiEye className="w-6 h-6 tablet:w-6 tablet:h-6 text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 tablet:p-4">
          {/* Name & Slug */}
          <div className="mb-1.5 tablet:mb-2">
            <h4 className="font-semibold text-gray-900 text-sm tablet:text-md desktop:text-base line-clamp-1">
              {food.name}
            </h4>
          </div>

          {/* Category */}
          <div className="mb-2">
            <span className="inline-flex items-center px-1.5 tablet:px-2 py-0.5 tablet:py-1 bg-gray-100 text-gray-600 rounded text-sx tablet:text-sm max-w-full">
              <FiPackage className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{food.categoryName || "Chưa phân loại"}</span>
            </span>
          </div>

          {/* Price */}
          <div className="mb-3 tablet:mb-4">
            <span className="font-bold text-md tablet:text-base desktop:text-lg text-orange-600">
              {food.price?.toLocaleString()} VNĐ
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 tablet:gap-2">
            {food.status === "AVAILABLE" ? (
              <button
                onClick={() => handleOpenStatusModal(food, "UNAVAILABLE")}
                className="w-full px-2 tablet:px-3 py-1.5 tablet:py-2 bg-[#8C732A] text-white rounded-lg hover:bg-yellow-600 text-sx tablet:text-sm font-medium transition-colors flex items-center justify-center">
                <FiAlertCircle className="w-5 h-5 tablet:w-5 tablet:h-5 mr-0.5 tablet:mr-1" />
                Đánh dấu hết hàng
              </button>
            ) : (
              <button
                onClick={() => handleOpenStatusModal(food, "AVAILABLE")}
                className="w-full px-2 tablet:px-3 py-1.5 tablet:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sx tablet:text-sm font-medium transition-colors flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 tablet:w-4 tablet:h-4 mr-0.5 tablet:mr-1" />
                Đánh dấu có sẵn
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Food Card (List View)
  const renderFoodCardList = (food) => {
    const statusConfig = getStatusConfig(food.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div
        key={food.id}
        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 flex gap-4">
        {/* Image */}
        <div className="relative w-20 h-20 tablet:w-28 tablet:h-28 desktop:w-32 desktop:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={food.imageUrl || PLACEHOLDER_IMAGE}
            alt={food.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = PLACEHOLDER_IMAGE;
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1.5 tablet:mb-2">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm tablet:text-md desktop:text-base line-clamp-1">
                {food.name}
              </h4>
              <div className="flex items-center gap-1.5 tablet:gap-2 mt-0.5 tablet:mt-1 flex-wrap">
                {food.slug && (
                  <span className="text-sx tablet:text-sm text-gray-500">#{food.slug}</span>
                )}
                <span className="inline-flex items-center px-1.5 tablet:px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-sx tablet:text-sm">
                  <FiPackage className="w-5 h-5 tablet:w-5 tablet:h-5 mr-0.5" />
                  {food.categoryName || "Chưa phân loại"}
                </span>
              </div>
            </div>
            <span
              className={`inline-flex items-center px-2 tablet:px-2.5 py-0.5 tablet:py-1 text-sx tablet:text-sm font-semibold rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
              <StatusIcon className="w-5 h-5 tablet:w-5 tablet:h-5 mr-0.5 tablet:mr-1" />
              {statusConfig.label}
            </span>
          </div>

          <p className="text-sx tablet:text-sm text-gray-600 line-clamp-2 mb-2 tablet:mb-3">
            {food.description || "Không có mô tả"}
          </p>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-bold text-md tablet:text-lg desktop:text-18 text-orange-600">
              {food.price?.toLocaleString()} VNĐ
            </span>

            <div className="flex gap-1.5 tablet:gap-2">
              <button
                onClick={() => handleViewDetail(food)}
                className="px-2 tablet:px-3 py-1 tablet:py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sx tablet:text-sm font-medium transition-colors flex items-center">
                <FiInfo className="w-5 h-5 tablet:w-6 tablet:h-6 mr-0.5 tablet:mr-1" />
                Chi tiết
              </button>
              {food.status === "AVAILABLE" ? (
                <button
                  onClick={() => handleOpenStatusModal(food, "UNAVAILABLE")}
                  className="px-2 tablet:px-3 py-1 tablet:py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sx tablet:text-sm font-medium transition-colors flex items-center">
                  <FiAlertCircle className="w-5 h-5 tablet:w-6 tablet:h-6 mr-0.5 tablet:mr-1" />
                  <span className="hidden tablet:inline">Đánh dấu </span> <span> Hết hàng</span>
                </button>
              ) : (
                <button
                  onClick={() => handleOpenStatusModal(food, "AVAILABLE")}
                  className="px-2 tablet:px-3 py-1 tablet:py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm tablet:text-sm font-medium transition-colors flex items-center">
                  <FiCheckCircle className="w-5 h-5 tablet:w-6 tablet:h-6 mr-0.5 tablet:mr-1" />
                  <span className="hidden tablet:inline">Đánh dấu </span>Có sẵn
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Best Sellers / Featured Section
  const renderBestSellersSection = () => {
    const displayFoods = [...bestSellers, ...featuredFoods].slice(0, 12);

    if (displayFoods.length === 0) {
      return (
        <div className="text-center py-12">
          <FiTrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có dữ liệu món bán chạy / đặc biệt</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiTrendingUp className="w-5 h-5 mr-2 text-orange-500" />
              Món bán chạy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {bestSellers.slice(0, 8).map((food) => (
                <div
                  key={food.id}
                  className="bg-white border border-gray-200 rounded-lg p-2.5 tablet:p-3 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleViewDetail(food)}>
                  <div className="flex gap-2.5 tablet:gap-3">
                    <img
                      src={food.imageUrl || PLACEHOLDER_IMAGE}
                      alt={food.name}
                      className="w-14 h-14 tablet:w-16 tablet:h-16 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sx tablet:text-sm line-clamp-1">
                        {food.name}
                      </h4>
                      <p className="text-sx tablet:text-sm text-gray-500">
                        {food.categoryName || "Chưa phân loại"}
                      </p>
                      <p className="text-sm tablet:text-md font-semibold text-orange-600 mt-0.5 tablet:mt-1">
                        {food.price?.toLocaleString()} VNĐ
                      </p>
                      {food.soldCount && (
                        <p className="text-sx tablet:text-sm text-green-600">
                          Đã bán: {food.soldCount}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Foods */}
        {featuredFoods.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiStar className="w-5 h-5 mr-2 text-yellow-500" />
              Món đặc biệt - Gợi ý cho khách
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {featuredFoods.slice(0, 8).map((food) => (
                <div
                  key={food.id}
                  className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-2.5 tablet:p-3 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleViewDetail(food)}>
                  <div className="flex gap-2.5 tablet:gap-3">
                    <img
                      src={food.imageUrl || PLACEHOLDER_IMAGE}
                      alt={food.name}
                      className="w-14 h-14 tablet:w-16 tablet:h-16 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sx tablet:text-sm line-clamp-1">
                        {food.name}
                      </h4>
                      <p className="text-sx tablet:text-sm text-gray-500">
                        {food.categoryName || "Chưa phân loại"}
                      </p>
                      <p className="text-sm tablet:text-md font-semibold text-orange-600 mt-0.5 tablet:mt-1">
                        {food.price?.toLocaleString()} VNĐ
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Promotions Section
  const renderPromotionsSection = () => {
    if (promotions.length === 0) {
      return (
        <div className="text-center py-12">
          <FiPercent className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-sm md:text-base text-gray-500">
            Hiện không có khuyến mãi nào đang hoạt động
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map((promo, index) => (
          <div
            key={promo.id || index}
            className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FiPercent className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{promo.code || promo.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{promo.description}</p>
                {promo.discountPercent && (
                  <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                    Giảm {promo.discountPercent}%
                  </span>
                )}
                {promo.discountAmount && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                    Giảm {promo.discountAmount?.toLocaleString()} VNĐ
                  </span>
                )}
                {promo.expiryDate && (
                  <p className="text-sm text-gray-500 mt-2">
                    <FiClock className="w-3 h-3 inline mr-1" />
                    HSD: {new Date(promo.expiryDate).toLocaleDateString("vi-VN")}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col tablet:flex-row tablet:items-center tablet:justify-between mb-6">
          <div>
            <h1 className="text-lg tablet:text-xl desktop:text-xxl font-bold text-gray-900 mb-1">
              Quản lý Thực đơn
            </h1>
            <p className="text-sm tablet:text-md desktop:text-base text-gray-600">
              Xem và quản lý trạng thái món ăn, hỗ trợ phục vụ khách hàng
            </p>
            {lastUpdated && (
              <p className="text-sx tablet:text-sm text-gray-400 mt-1">
                Cập nhật lần cuối: {lastUpdated.toLocaleTimeString("vi-VN")}
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="mt-4 tablet:mt-0 inline-flex items-center justify-center px-3 tablet:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm tablet:text-md desktop:text-base">
            <FiRefreshCw className={`w-6 h-6 mr-2 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3 tablet:gap-4 mb-6">
          <div className="bg-white rounded-xl p-3 tablet:p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 tablet:gap-3">
              <div className="w-8 h-8 tablet:w-10 tablet:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FiPackage className="w-6 h-6 tablet:w-5 tablet:h-5 text-blue-600" />
              </div>
              <div>
                {statsLoading ? (
                  <div className="h-7 w-12 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <p className="text-lg tablet:text-xl desktop:text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                )}
                <p className="text-sx tablet:text-sm desktop:text-md text-gray-500">Tổng món</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 tablet:p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 tablet:gap-3">
              <div className="w-8 h-8 tablet:w-10 tablet:h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 tablet:w-5 tablet:h-5 text-green-600" />
              </div>
              <div>
                {statsLoading ? (
                  <div className="h-7 w-12 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <p className="text-lg tablet:text-xl desktop:text-2xl font-bold text-green-600">
                    {stats.available}
                  </p>
                )}
                <p className="text-sm tablet:text-sm desktop:text-md text-gray-500">Có sẵn</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 tablet:p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 tablet:gap-3">
              <div className="w-8 h-8 tablet:w-10 tablet:h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 tablet:w-5 tablet:h-5 text-yellow-600" />
              </div>
              <div>
                {statsLoading ? (
                  <div className="h-7 w-12 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <p className="text-lg tablet:text-xl desktop:text-2xl font-bold text-yellow-600">
                    {stats.unavailable}
                  </p>
                )}
                <p className="text-sx tablet:text-sm desktop:text-md text-gray-500">Hết hàng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab(TABS.MENU)}
              className={`flex items-center px-3 tablet:px-6 py-3 tablet:py-4 text-sx tablet:text-sm desktop:text-md font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === TABS.MENU
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              <FiList className="w-5 h-5 tablet:w-6 tablet:h-6 mr-1.5 tablet:mr-2" />
              <span className="hidden tablet:inline">Danh sách thực đơn</span>
              <span className="tablet:hidden">Thực đơn</span>
            </button>
            <button
              onClick={() => setActiveTab(TABS.BESTSELLERS)}
              className={`flex items-center px-3 tablet:px-6 py-3 tablet:py-4 text-sx tablet:text-sm desktop:text-md font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === TABS.BESTSELLERS
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              <FiTrendingUp className="w-5 h-5 tablet:w-6 tablet:h-6 mr-1.5 tablet:mr-2" />
              <span className="hidden tablet:inline">Hỗ trợ phục vụ</span>
              <span className="tablet:hidden">Phục vụ</span>
            </button>
            <button
              onClick={() => setActiveTab(TABS.PROMOTIONS)}
              className={`flex items-center px-3 tablet:px-6 py-3 tablet:py-4 text-sx tablet:text-sm desktop:text-md font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === TABS.PROMOTIONS
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              <FiPercent className="w-5 h-5 tablet:w-6 tablet:h-6 mr-1.5 tablet:mr-2" />
              Khuyến mãi
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 tablet:p-6">
            {loading ? (
              <div className="flex flex-col min-h-[400px] items-center justify-center py-8 tablet:py-12">
                <SpinnerCube />
                <p className="mt-6 tablet:mt-8 text-sm tablet:text-md desktop:text-base text-gray-600">
                  Đang tải dữ liệu...
                </p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 tablet:p-4">
                <div className="flex items-center">
                  <FiAlertCircle className="w-6 h-6 tablet:w-5 tablet:h-5 text-red-500 mr-2" />
                  <p className="text-sm tablet:text-md desktop:text-base text-red-800">{error}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Menu Tab */}
                {activeTab === TABS.MENU && (
                  <>
                    {/* Filters */}
                    <div className="mb-4 tablet:mb-6">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center text-sx tablet:text-sm desktop:text-md text-gray-600 hover:text-gray-900 mb-3 tablet:mb-4">
                        <FiFilter className="w-5 h-5 tablet:w-6 tablet:h-6 mr-1.5 tablet:mr-2" />
                        Bộ lọc
                        {showFilters ? (
                          <FiChevronUp className="w-6 h-6 tablet:w-6 tablet:h-6 ml-1" />
                        ) : (
                          <FiChevronDown className="w-6 h-6 tablet:w-6 tablet:h-6 ml-1" />
                        )}
                      </button>

                      {showFilters && (
                        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-3 tablet:gap-4 p-3 tablet:p-4 bg-gray-50 rounded-lg">
                          {/* Search - Ant Design Input */}
                          <Input
                            placeholder="Tìm kiếm tên món..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            prefix={<FiSearch className="text-gray-400 w-4 h-4" />}
                            allowClear
                            size="large"
                            className="w-full"
                          />

                          {/* Category - TreeSelect phân cấp */}
                          <TreeSelect
                            value={selectedCategory}
                            onChange={(value) => setSelectedCategory(value || "ALL")}
                            treeData={categoryTreeData}
                            placeholder="Chọn danh mục"
                            allowClear
                            showSearch
                            treeDefaultExpandAll
                            treeLine={{ showLeafIcon: false }}
                            className="w-full"
                            size="large"
                            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                            filterTreeNode={(input, treeNode) => {
                              const title =
                                typeof treeNode.title === "string"
                                  ? treeNode.title
                                  : treeNode.title?.props?.children?.[0] || "";
                              return title.toLowerCase().includes(input.toLowerCase());
                            }}
                          />

                          {/* Status - Ant Design Select */}
                          <Select
                            value={selectedStatus}
                            onChange={(value) => setSelectedStatus(value)}
                            className="w-full"
                            size="large"
                            options={[
                              { value: "ALL", label: "Tất cả trạng thái" },
                              { value: "AVAILABLE", label: "Có sẵn" },
                              { value: "UNAVAILABLE", label: "Hết hàng" },
                            ]}
                          />

                          {/* View Mode */}
                          <div className="flex items-center gap-2 h-10">
                            <button
                              onClick={() => setViewMode("grid")}
                              className={`p-2 rounded-lg h-10 w-10 flex items-center justify-center ${
                                viewMode === "grid"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                              }`}
                              title="Xem dạng lưới">
                              <FiGrid className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setViewMode("list")}
                              className={`p-2 rounded-lg h-10 w-10 flex items-center justify-center ${
                                viewMode === "list"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                              }`}
                              title="Xem dạng danh sách">
                              <FiList className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Results count */}
                    {foodsLoading ? (
                      <div className="flex flex-col min-h-[300px] items-center justify-center py-8 tablet:py-12">
                        <SpinnerCube />
                        <p className="mt-6 tablet:mt-8 text-sm tablet:text-md desktop:text-base text-gray-600">
                          Đang tải dữ liệu...
                        </p>
                      </div>
                    ) : (
                      <p className="text-sx tablet:text-sm desktop:text-md text-gray-600">
                        Trang {currentPage} - Hiển thị {filteredFoods.length} món
                        {totalElements > 0 && ` (Tổng: ${totalElements} món)`}
                      </p>
                    )}

                    {/* Loading indicator */}
                    {foodsLoading && (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    )}

                    {/* Food Grid/List */}
                    {!foodsLoading && filteredFoods.length === 0 ? (
                      <div className="text-center py-8 tablet:py-12">
                        <FiPackage className="w-12 h-12 tablet:w-16 tablet:h-16 text-gray-300 mx-auto mb-3 tablet:mb-4" />
                        <p className="text-sm tablet:text-md desktop:text-base text-gray-500">
                          Không tìm thấy món ăn nào
                        </p>
                        <p className="text-sx tablet:text-sm text-gray-400 mt-2">
                          Thử thay đổi bộ lọc hoặc chuyển sang trang khác
                        </p>
                      </div>
                    ) : !foodsLoading && viewMode === "grid" ? (
                      <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 gap-3 tablet:gap-4">
                        {filteredFoods.map(renderFoodCardGrid)}
                      </div>
                    ) : !foodsLoading ? (
                      <div className="space-y-3">{filteredFoods.map(renderFoodCardList)}</div>
                    ) : null}

                    {/* Pagination - Server-side */}
                    {totalElements > pageSize && (
                      <div className="flex justify-center mt-4 tablet:mt-6">
                        <Pagination
                          current={currentPage}
                          total={totalElements}
                          pageSize={pageSize}
                          onChange={handlePageChange}
                          showSizeChanger
                          pageSizeOptions={["8", "12", "24", "48"]}
                          showTotal={(total, range) => (
                            <span className="text-sx tablet:text-sm text-gray-600">
                              {range[0]}-{range[1]} của {total} món
                            </span>
                          )}
                          size="small"
                          responsive
                          disabled={foodsLoading}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Best Sellers Tab */}
                {activeTab === TABS.BESTSELLERS && renderBestSellersSection()}

                {/* Promotions Tab */}
                {activeTab === TABS.PROMOTIONS && renderPromotionsSection()}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Food Detail Modal */}
      <FoodDetailModal
        food={selectedFood}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedFood(null);
        }}
      />

      {/* Status Change Modal */}
      <StatusChangeModal
        food={selectedFood}
        newStatus={pendingStatus}
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedFood(null);
          setPendingStatus(null);
        }}
        onConfirm={handleConfirmStatusChange}
        loading={statusLoading}
      />
    </div>
  );
};

export default StaffMenu;
