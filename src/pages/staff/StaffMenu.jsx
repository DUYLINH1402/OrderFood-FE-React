import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useAuth, usePermissions } from "../../hooks/auth/useAuth";
import { PERMISSIONS } from "../../utils/roleConfig";
import { getAllFoods, updateFoodStatus } from "../../services/service/foodService";

const StaffMenu = () => {
  const { hasPermission } = usePermissions();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (hasPermission(PERMISSIONS.VIEW_FOODS)) {
      fetchFoods();
    } else {
      setError("Bạn không có quyền xem thực đơn");
      setLoading(false);
    }
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const response = await getAllFoods();
      if (response.success) {
        setFoods(response.data);
        // Tạo danh sách categories từ foods
        const uniqueCategories = [...new Set(response.data.map((food) => food.category))];
        setCategories(uniqueCategories);
      } else {
        setError(response.message || "Không thể tải thực đơn");
      }
    } catch (err) {
      console.error("Error fetching foods:", err);
      setError("Có lỗi xảy ra khi tải thực đơn");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (foodId, newStatus) => {
    try {
      const response = await updateFoodStatus(foodId, newStatus);
      if (response.success) {
        setFoods((prev) =>
          prev.map((food) => (food.id === foodId ? { ...food, status: newStatus } : food))
        );
        toast.success(`Đã ${newStatus === "AVAILABLE" ? "kích hoạt" : "ẩn"} món ăn`);
      } else {
        toast.error(response.message || "Không thể cập nhật trạng thái");
      }
    } catch (err) {
      console.error("Error updating food status:", err);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const filteredFoods = foods.filter((food) => {
    const matchesSearch =
      food.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || food.category === selectedCategory;
    const matchesStatus = selectedStatus === "ALL" || food.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (!hasPermission(PERMISSIONS.VIEW_FOODS)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-base text-gray-600">Bạn không có quyền xem thực đơn.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Quản lý thực đơn</h1>
          <p className="text-base text-gray-600">Xem và quản lý trạng thái món ăn trong thực đơn</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Tìm kiếm món ăn..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base">
                <option value="ALL">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base">
                <option value="ALL">Tất cả trạng thái</option>
                <option value="AVAILABLE">Có sẵn</option>
                <option value="UNAVAILABLE">Hết hàng</option>
                <option value="HIDDEN">Đã ẩn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Food Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Danh sách món ăn ({filteredFoods.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 text-base">Đang tải...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 m-6">
              <p className="text-red-800 text-base">{error}</p>
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-base">Không có món ăn nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredFoods.map((food) => (
                <div
                  key={food.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={food.image || "/placeholder-food.jpg"}
                      alt={food.name}
                      className="w-full h-48 object-cover rounded-md"
                      onError={(e) => {
                        e.target.src = "/placeholder-food.jpg";
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-900 text-base">{food.name}</h4>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          food.status === "AVAILABLE"
                            ? "bg-green-100 text-green-800"
                            : food.status === "UNAVAILABLE"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {food.status === "AVAILABLE"
                          ? "Có sẵn"
                          : food.status === "UNAVAILABLE"
                          ? "Hết hàng"
                          : "Đã ẩn"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {food.description || "Không có mô tả"}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{food.category}</span>
                      <span className="font-semibold text-lg text-gray-900">
                        {food.price?.toLocaleString()} VNĐ
                      </span>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      {food.status === "AVAILABLE" ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(food.id, "UNAVAILABLE")}
                            className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm">
                            Đánh dấu hết hàng
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(food.id, "HIDDEN")}
                            className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm">
                            Ẩn món
                          </button>
                        </>
                      ) : food.status === "UNAVAILABLE" ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(food.id, "AVAILABLE")}
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                            Có sẵn trở lại
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(food.id, "HIDDEN")}
                            className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm">
                            Ẩn món
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(food.id, "AVAILABLE")}
                          className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                          Hiển thị lại
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffMenu;
