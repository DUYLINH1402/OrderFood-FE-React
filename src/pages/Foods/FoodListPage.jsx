import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import FoodSidebar from "./FoodSidebar";
import FoodGrid from "./FoodGrid";
import "../styles/FoodListPage.scss";
import { getCategoryById } from "../../services/service/categoriesService";

const FoodListPage = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const location = useLocation();
  const [categoryName, setCategoryName] = useState("");

  // Lấy tên danh mục khi selectedCategoryId thay đổi
  useEffect(() => {
    const fetchCategoryName = async () => {
      if (selectedCategoryId) {
        const category = await getCategoryById(selectedCategoryId); // Gọi API để lấy thông tin danh mục
        setCategoryName(category.name); // Lưu tên danh mục
      } else {
        setCategoryName(""); // Xóa tên danh mục nếu không có danh mục được chọn
      }
    };

    fetchCategoryName();
  }, [selectedCategoryId]);

  // Tạo breadcrumbs từ đường dẫn hiện tại
  const pathnames = location.pathname.split("/").filter((x) => x);
  const breadcrumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Tất cả sản phẩm", path: "/foods" },
    ...(selectedCategoryId ? [{ name: categoryName, path: `/foods/${selectedCategoryId}` }] : []),
  ];

  return (
    <div className="food-list-page-container">
      <nav className="breadcrumb">
        {breadcrumbs.map((crumb, index) => (
          <span key={index}>
            <Link to={crumb.path}>{crumb.name} </Link>
            {index < breadcrumbs.length - 1 && " > "}
          </span>
        ))}
      </nav>
      <div className="food-list-page">
        <aside className="sidebar-menu-foods">
          <FoodSidebar onSelectCategory={setSelectedCategoryId} />
        </aside>
        <main className="main-content">
          <h2 className="title-food-grid">
            {selectedCategoryId ? "Danh sách món theo danh mục" : "Tất cả sản phẩm"}
          </h2>
          <FoodGrid categoryId={selectedCategoryId} />
        </main>
      </div>
    </div>
  );
};

export default FoodListPage;
