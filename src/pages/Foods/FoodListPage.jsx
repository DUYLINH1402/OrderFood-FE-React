import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FoodSidebar from "./FoodSidebar";
import FoodGrid from "./FoodGrid";
import "../../assets/styles/pages/FoodListPage.scss";
import LoadingPage from "../../components/Skeleton/LoadingPage";
import {
  getCategoryBySlug,
  getCategoriesByParentSlug,
  getCategoryById,
} from "../../services/service/categoriesService";
import FoodSidebarMobileWrapper from "./Mobile/FoodSidebarMobileWrapper";

const FoodListPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [categoryNameChain, setCategoryNameChain] = useState([]);
  const [categoryError, setCategoryError] = useState(false);
  const [childCategories, setChildCategories] = useState([]);
  const [isLoadedChildren, setIsLoadedChildren] = useState(false);

  const isBestSellerPage = slug === "1"; // id BEST SELLER trong DB

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!slug || isBestSellerPage) {
        setCategoryNameChain([]);
        setCategoryError(false);
        setChildCategories([]);
        setIsLoadedChildren(true);
        return;
      }

      try {
        const child = await getCategoryBySlug(slug);
        const children = await getCategoriesByParentSlug(slug);

        let breadcrumbChain = [];

        if (child.parentId) {
          const parent = await getCategoryById(child.parentId);
          breadcrumbChain.push({ name: parent.name, path: `/mon-an/${parent.slug}` });
        }
        breadcrumbChain.push({ name: child.name, path: `/mon-an/${child.slug}` });

        setCategoryNameChain(breadcrumbChain);
        setChildCategories(children);
        setCategoryError(false);
        setIsLoadedChildren(true);
      } catch (error) {
        console.error("Lỗi khi lấy breadcrumb hoặc danh mục con:", error);
        setCategoryNameChain([]);
        setCategoryError(true);
        setChildCategories([]);
        setIsLoadedChildren(true);
      }
    };

    fetchCategoryData();
  }, [slug]);

  const breadcrumbs = [{ name: "Trang chủ", path: "/" }, ...categoryNameChain];

  return (
    <div className="food-list-page-container">
      <nav className="breadcrumb">
        {breadcrumbs.map((crumb, index) => (
          <span key={index}>
            <a
              href={crumb.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(crumb.path);
              }}
              style={{
                color: "#007bff",
                textDecoration: "underline",
                cursor: "pointer",
              }}>
              {crumb.name}
            </a>
            {index < breadcrumbs.length - 1 && " > "}
          </span>
        ))}
      </nav>
      <div className="food-list-page">
        {/* Sidebar trên desktop */}
        <aside className="sidebar-menu-foods hidden lg:block">
          <FoodSidebar
            onSelectCategory={(id) => {
              if (id) navigate(`/mon-an/${id}`);
              else navigate(`/mon-an`);
            }}
          />
        </aside>

        {/* Sidebar trên mobile (dropdown) */}
        <div className="block lg:hidden">
          <FoodSidebarMobileWrapper
            onSelectCategory={(id) => {
              if (id) navigate(`/mon-an/${id}`);
              else navigate(`/mon-an`);
            }}
          />
        </div>

        <main className="main-content mt-[80px] md:mt-0">
          {categoryError ? (
            <h2 className="title-food-grid title-error">Không tìm thấy danh mục "{slug}"</h2>
          ) : (
            <>
              <h2 className="title-food-grid">
                {isBestSellerPage
                  ? "Danh mục BEST SELLER"
                  : categoryNameChain?.length > 0 &&
                    categoryNameChain[categoryNameChain.length - 1]?.name
                  ? `Danh mục ${categoryNameChain[categoryNameChain.length - 1].name}`
                  : "Tất cả các món"}
              </h2>

              {isBestSellerPage ? (
                <FoodGrid filterType="best-seller" />
              ) : isLoadedChildren ? (
                childCategories.length > 0 ? (
                  <div className="child-category-list">
                    {childCategories.map((child) => (
                      <div
                        key={child.slug}
                        onClick={() => navigate(`/mon-an/${child.slug}`)}
                        className="child-category-item">
                        {child.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <FoodGrid slug={slug} />
                )
              ) : (
                <LoadingPage />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default FoodListPage;
