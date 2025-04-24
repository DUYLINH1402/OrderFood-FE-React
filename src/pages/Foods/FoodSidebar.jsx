import React, { useState, useEffect } from "react";
import { getCategoriesByParent, getRootCategories } from "../../services/service/categoriesService";
import { FontAwesomeIcon, faChevronUp, faChevronDown } from "../../utils/icons.js";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/FoodSidebar.scss";

const FoodSidebar = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState([{ id: null, name: "Tất cả" }]);
  const [expandedParent, setExpandedParent] = useState(null);
  const [childrenMap, setChildrenMap] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  // Load danh mục gốc
  useEffect(() => {
    const fetchRoot = async () => {
      const data = await getRootCategories();
      console.log("Data: ", data);
      setCategories(data);
    };
    fetchRoot();
  }, []);

  const handleToggleExpand = async (cat) => {
    if (expandedParent === cat.id) {
      setExpandedParent(null); // thu gọn lại nếu đang mở
    } else {
      // nếu chưa có trong cache thì fetch
      if (!childrenMap[cat.id]) {
        const children = await getCategoriesByParent(cat.id);
        setChildrenMap((prev) => ({ ...prev, [cat.id]: children }));
      }
      setExpandedParent(cat.id); // mở danh mục cha
    }
  };

  return (
    <div className="food-sidebar">
      <ul className="food-sidebar-list">
        {categories.map((cat) => (
          <React.Fragment key={cat.id}>
            <li>
              <button
                onClick={() => {
                  if (cat.id === null) {
                    onSelectCategory(null);
                    setExpandedParent(null);
                    setSelectedId(null);
                    navigate(`/foods/${child.id}`);
                  } else {
                    handleToggleExpand(cat);
                  }
                }}
                className={`food-sidebar-item flex justify-between items-center w-full ${
                  selectedId === cat.id ? "active" : ""
                }`}>
                <span>{cat.name}</span>

                {/* Mũi tên nếu có children */}
                {cat.hasChildren && (
                  <FontAwesomeIcon
                    icon={expandedParent === cat.id ? faChevronUp : faChevronDown}
                    className="ml-2 arrow-up-down"
                  />
                )}
              </button>
            </li>

            {/* Hiển thị con nếu đang được expand */}
            <AnimatePresence>
              {expandedParent === cat.id && childrenMap[cat.id] && (
                <motion.ul
                  className="ml-4 food-sidebar-subitem-wrapper"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}>
                  {childrenMap[cat.id].map((child) => (
                    <li key={child.id}>
                      <button
                        onClick={() => {
                          onSelectCategory(child.id);
                          setSelectedId(child.id);
                        }}
                        className={`food-sidebar-subitem ${
                          selectedId === child.id ? "active" : ""
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
