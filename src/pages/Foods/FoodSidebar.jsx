import React, { useState, useEffect } from "react";
import {
  getCategoriesByParentSlug,
  getRootCategories,
} from "../../services/service/categoriesService";
import { FontAwesomeIcon, faChevronUp, faChevronDown } from "../../utils/icons.js";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import "../styles/FoodSidebar.scss";
const FoodSidebar = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState([{ id: null, name: "Tất cả" }]);
  const [expandedParent, setExpandedParent] = useState(null);
  const [childrenMap, setChildrenMap] = useState({});
  // Dùng useParams() để theo dõi categoryId hiện tại từ URL
  const { slug } = useParams();
  const selectedSlug = slug || null;
  // Load danh mục gốc
  useEffect(() => {
    const fetchRoot = async () => {
      const data = await getRootCategories();
      // console.log("Data: ", data);
      setCategories(data);
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
    <div className="food-sidebar">
      <ul className="food-sidebar-list ">
        {categories.map((cat) => (
          <React.Fragment key={cat.slug}>
            <li>
              <button
                onClick={async () => {
                  if (cat.slug === null) {
                    onSelectCategory(null);
                    setExpandedParent(null);
                    setSelectedId(null);
                  } else {
                    // lấy children
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
                className={`food-sidebar-item flex justify-between items-center w-full ${
                  selectedSlug === cat.slug ? "active" : ""
                }`}>
                <span>{cat.name}</span>

                {/* Mũi tên nếu có children */}
                {cat.hasChildren && (
                  <FontAwesomeIcon
                    icon={expandedParent === cat.slug ? faChevronUp : faChevronDown}
                    className="ml-2 arrow-up-down"
                  />
                )}
              </button>
            </li>

            {/* Hiển thị con nếu đang được expand */}
            <AnimatePresence>
              {expandedParent === cat.slug && childrenMap[cat.slug] && (
                <motion.ul
                  className="ml-4 food-sidebar-subitem-wrapper"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}>
                  {childrenMap[cat.slug].map((child) => (
                    <li key={child.slug}>
                      <button
                        onClick={() => {
                          onSelectCategory(child.slug);
                        }}
                        className={`food-sidebar-subitem ${
                          selectedSlug === child.slug ? "active" : ""
                        }`}>
                        - {child.name}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};

export default FoodSidebar;
