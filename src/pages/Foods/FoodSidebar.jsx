import React, { useState, useEffect } from "react";
import LoadingIcon from "../../components/Skeleton/LoadingIcon";
import {
  getCategoriesByParentSlug,
  getRootCategories,
} from "../../services/service/categoriesService";
import { FontAwesomeIcon, faChevronUp, faChevronDown } from "../../utils/icons.js";
import greenCircle from "../../assets/icons/green_circle.png";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import "../../assets/styles/pages/FoodSidebar.scss";
const FoodSidebar = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState([{ id: null, name: "Tất cả" }]);
  const [loading, setLoading] = useState(true);
  const [expandedParent, setExpandedParent] = useState(null);
  const [childrenMap, setChildrenMap] = useState({});
  // Dùng useParams() để theo dõi categoryId hiện tại từ URL
  const { slug } = useParams();
  const selectedSlug = slug || null;
  // Load danh mục gốc
  useEffect(() => {
    const fetchRoot = async () => {
      setLoading(true);
      const data = await getRootCategories();
      setCategories(data);
      setLoading(false);
    };
    fetchRoot();
  }, []);

  const handleToggleExpand = async (cat) => {
    if (expandedParent === cat.slug) {
      setExpandedParent(null); // thu gọn lại nếu đang mở
    } else {
      // nếu chưa có trong cache thì fetch
      if (!childrenMap[cat.slug]) {
        const children = await getCategoriesByParentSlug(cat.slug);
        setChildrenMap((prev) => ({ ...prev, [cat.slug]: children }));
      }
      setExpandedParent(cat.slug); // mở danh mục cha
    }
  };

  return (
    <div className="food-sidebar bg-white rounded-xl shadow-md p-3">
      <ul className="food-sidebar-list ml-2 text-sm md:text-base">
        {loading ? (
          <li className="mb-1 flex items-center justify-center py-2">
            <LoadingIcon size="22px" />
          </li>
        ) : (
          (categories || []).map((cat) => (
            <React.Fragment key={cat.slug}>
              <li className="mb-1">
                <button
                  onClick={async () => {
                    if (cat.slug === null) {
                      onSelectCategory(null);
                      setExpandedParent(null);
                      setSelectedId && setSelectedId(null);
                    } else {
                      const children =
                        childrenMap[cat.slug] || (await getCategoriesByParentSlug(cat.slug));
                      if (!childrenMap[cat.slug]) {
                        setChildrenMap((prev) => ({ ...prev, [cat.slug]: children }));
                      }
                      if (children.length > 0) {
                        setExpandedParent(expandedParent === cat.slug ? null : cat.slug);
                      } else {
                        onSelectCategory(cat.slug);
                        setExpandedParent(null);
                      }
                    }
                  }}
                  className={`food-sidebar-item flex justify-between items-center w-full px-5 py-1.5 rounded-md transition-all duration-150 text-md ${
                    selectedSlug === cat.slug
                      ? "font-medium bg-[#f3fcf7] text-[#199b7e] border border-[#7ed6a6]"
                      : "font-normal hover:bg-gray-100 text-gray-800 border border-transparent"
                  } ${cat.hasChildren ? "cursor-pointer" : ""}`}
                  style={{
                    boxShadow: "none",
                    borderRadius: "8px",
                  }}>
                  <span className="flex items-center gap-2">
                    <img
                      src={greenCircle}
                      alt="icon"
                      className="w-5 h-5"
                      style={{ minWidth: 14 }}
                    />
                    {cat.name}
                  </span>
                  {cat.hasChildren && (
                    <FontAwesomeIcon
                      icon={expandedParent === cat.slug ? faChevronUp : faChevronDown}
                      className="ml-2 arrow-up-down text-[#199b7e]"
                    />
                  )}
                </button>
              </li>
              <AnimatePresence>
                {expandedParent === cat.slug && childrenMap[cat.slug] && (
                  <motion.ul
                    className="ml-3 food-sidebar-subitem-wrapper border-l-2 border-[#e0e0e0] pl-2 mt-1"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}>
                    {(childrenMap[cat.slug] || []).map((child) => (
                      <li key={child.slug} className="mb-1">
                        <button
                          onClick={() => {
                            onSelectCategory(child.slug);
                          }}
                          className={`food-sidebar-subitem block w-full text-left px-5 py-1.5 rounded-md transition-all duration-150 text-[13.5px] font-normal
                            ${
                              selectedSlug === child.slug
                                ? "bg-[#f3fcf7] text-[#199b7e] font-medium border border-[#7ed6a6]"
                                : "hover:bg-gray-100 text-gray-700 border border-transparent"
                            }
                          `}
                          style={{
                            boxShadow: "none",
                            borderRadius: "7px",
                          }}>
                          <span className="flex items-center gap-2">
                            <span
                              className="inline-block w-2 h-2 rounded-full bg-[#b2b2b2] mr-2"
                              style={{ minWidth: 8 }}></span>
                            {child.name}
                          </span>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </React.Fragment>
          ))
        )}
      </ul>
    </div>
  );
};

export default FoodSidebar;
