import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FoodSidebar from "../FoodSidebar";

const FoodSidebarMobileWrapper = ({ onSelectCategory }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Đóng khi nhấn ESC hoặc click ngoài
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed sm:top-[110px] top-[80px] right-4 z-[10] flex items-center gap-2 px-4 py-2 bg-[#199b7e] text-white font-semibold text-[1.2rem] sm:text-[2rem] rounded-[8px] shadow-md transition-all">
        Thực đơn
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay đen mờ khi menu mở */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar trượt từ phải */}
            <motion.div
              className="fixed top-0 right-0 z-[1001] h-full w-[300px] sm:w-[400px] bg-[#f8fafb] shadow-md z-40 p-2 pt-0 overflow-y-auto rounded-l-2xl border-l border-[#e0e0e0]"
              style={{ marginRight: 6, boxShadow: "0 2px 16px 0 rgba(0,0,0,0.08)" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3 }}>
              <div className="flex mt-[60px] justify-between items-center mb-3 px-2">
                <h2 className="text-base font-bold">Danh mục</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-2xl px-1 rounded hover:bg-gray-200 transition"></button>
              </div>
              <FoodSidebar
                onSelectCategory={(id) => {
                  setIsOpen(false);
                  onSelectCategory(id);
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FoodSidebarMobileWrapper;
