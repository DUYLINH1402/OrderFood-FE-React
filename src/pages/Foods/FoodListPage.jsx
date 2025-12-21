import React, { useState, useEffect, useRef } from "react";
import useScrollReveal from "../../hooks/useScrollReveal";
import { useParams, useNavigate } from "react-router-dom";
import FoodSidebar from "./FoodSidebar";
import FoodGrid from "./FoodGrid";
import { Breadcrumb } from "antd";
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

  // Breadcrumbs: Nếu đang ở trang thực đơn gốc, hiển thị "Thực đơn" thay vì chỉ "Trang chủ"
  // Đường dẫn đúng cho trang thực đơn là "/mon-an"
  const breadcrumbs =
    slug || isBestSellerPage
      ? [
          { name: "Trang chủ", path: "/" },
          { name: "Món ăn", path: "/mon-an" },
          ...categoryNameChain,
        ]
      : [
          { name: "Trang chủ", path: "/" },
          { name: "Món ăn", path: "/mon-an" },
        ];

  // Scroll reveal effect for main title and child categories
  const h2Ref = useRef();
  const childCatRefs = useRef([]);
  useScrollReveal(h2Ref);
  useScrollReveal(childCatRefs);

  return (
    <div className="relative overflow-hidden">
      {/* Hiệu ứng blob nền */}
      <div className="bg-blob bg-blob-1 pointer-events-none select-none"></div>
      <div className="bg-blob bg-blob-2 pointer-events-none select-none"></div>
      <div className="bg-blob bg-blob-3 pointer-events-none select-none"></div>
      <div className="bg-blob bg-blob-4 pointer-events-none select-none"></div>
      <div className="bg-blob bg-blob-5 pointer-events-none select-none"></div>
      <div className="bg-blob bg-blob-6 pointer-events-none select-none"></div>
      <div className="food-list-page-container">
        <div className="food-list-page">
          {/* Sidebar trên desktop - Cố định khi cuộn */}
          <aside className="sidebar-menu-foods hidden lg:block">
            <div className="sticky top-24">
              <div className="mb-4">
                <h3 className="flex items-center text-base font-semibold text-gray-800 mb-3">
                  <i className="fas fa-list-ul text-green-600 mr-2"></i>
                  Danh mục món ăn
                </h3>
              </div>
              <FoodSidebar
                onSelectCategory={(id) => {
                  if (id) navigate(`/mon-an/${id}`);
                  else navigate(`/mon-an`);
                }}
              />
            </div>
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
                <div
                  className="breadcrumb-wrapper mb-6 rounded-lg shadow-sm"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    alignItems: "left",
                    minHeight: 48,
                    border: "1px solid #e5e7eb",
                  }}>
                  <Breadcrumb
                    className="breadcrumb"
                    separator={<span style={{ color: "#bdbdbd", fontWeight: 400 }}>/</span>}
                    items={(breadcrumbs || []).map((crumb, index) => ({
                      title:
                        crumb.path && index !== breadcrumbs.length - 1 ? (
                          <a
                            href={crumb.path}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(crumb.path);
                            }}
                            style={{
                              color: "#1976d2",
                              textDecoration: "none",
                              fontWeight: 500,
                              transition: "color 0.2s",
                            }}
                            onMouseOver={(e) => (e.target.style.color = "#1565c0")}
                            onMouseOut={(e) => (e.target.style.color = "#1976d2")}>
                            {crumb.name}
                          </a>
                        ) : (
                          <span style={{ color: "#222", fontWeight: 600 }}>{crumb.name}</span>
                        ),
                    }))}
                  />
                </div>
                <h2 className="scroll-reveal title-food-grid dongxanh-section-title" ref={h2Ref}>
                  {isBestSellerPage
                    ? "Danh mục BEST SELLER"
                    : categoryNameChain?.length > 0 &&
                      categoryNameChain[categoryNameChain.length - 1]?.name
                    ? `Danh mục ${categoryNameChain[categoryNameChain.length - 1].name}`
                    : "Tất cả các món"}
                </h2>
                {isBestSellerPage ? (
                  <FoodGrid filterType="best-seller" categoryNameChain={categoryNameChain} />
                ) : isLoadedChildren ? (
                  childCategories.length > 0 ? (
                    <div className="child-category-list">
                      {(childCategories || []).map((child, idx) => (
                        <div
                          key={child.slug}
                          onClick={() => navigate(`/mon-an/${child.slug}`)}
                          className="scroll-reveal child-category-item"
                          ref={(el) => (childCatRefs.current[idx] = el)}>
                          {child.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <FoodGrid slug={slug} categoryNameChain={categoryNameChain} />
                  )
                ) : (
                  <LoadingPage />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default FoodListPage;
