import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import FoodSidebar from "./FoodSidebar";
import FoodGrid from "./FoodGrid";
import "../styles/FoodListPage.scss";
import { getCategoryById } from "../../services/service/categoriesService";

const FoodListPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [categoryNameChain, setCategoryNameChain] = useState([]);
  const [categoryError, setCategoryError] = useState(false);

  useEffect(() => {
    const fetchCategoryChain = async () => {
      if (!categoryId) {
        setCategoryNameChain([]);
        setCategoryError(false);
        return;
      }

      try {
        const child = await getCategoryById(categoryId);
        let breadcrumbChain = [];

        if (child.parentId) {
          const parent = await getCategoryById(child.parentId);
          breadcrumbChain.push({ name: parent.name, path: `/foods/${parent.id}` });
        }

        breadcrumbChain.push({ name: child.name, path: `/foods/${child.id}` });
        setCategoryNameChain(breadcrumbChain);
        setCategoryError(false);
      } catch (error) {
        console.error("Lỗi khi lấy breadcrumb:", error);
        setCategoryNameChain([]);
        setCategoryError(true);
      }
    };

    fetchCategoryChain();
  }, [categoryId]);

  const breadcrumbs = [{ name: "Trang chủ", path: "/" }, ...categoryNameChain];
  console.log("Category Name Chain: ", categoryNameChain);
  return (
    <div className="food-list-page-container">
      <nav className="breadcrumb">
        {breadcrumbs.map((crumb, index) => (
          <span key={index}>
            <Link to={crumb.path}>{crumb.name}</Link>
            {index < breadcrumbs.length - 1 && " > "}
          </span>
        ))}
      </nav>
      <div className="food-list-page">
        <aside className="sidebar-menu-foods">
          <FoodSidebar
            onSelectCategory={(id) => {
              if (id) navigate(`/foods/${id}`);
              else navigate(`/foods`);
            }}
          />
        </aside>
        <main className="main-content">
          {categoryError ? (
            <h2 className="title-food-grid title-error">Không tìm thấy danh mục "{categoryId}"</h2>
          ) : (
            <>
              <h2 className="title-food-grid">
                {categoryNameChain?.length > 0 &&
                categoryNameChain[categoryNameChain.length - 1]?.name
                  ? `Danh mục ${categoryNameChain[categoryNameChain.length - 1].name}`
                  : "Tất cả các món"}
              </h2>
              <FoodGrid categoryId={categoryId ? parseInt(categoryId) : null} />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default FoodListPage;
