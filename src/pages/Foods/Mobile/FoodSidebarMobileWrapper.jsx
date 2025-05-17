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
        className="fixed sm:top-[150px] top-[80px] right-4 z-[10] flex items-center gap-2 px-4 py-2 bg-[#32c828] text-white font-semibold text-[1.2rem] sm:text-[2rem] rounded-[8px] shadow-md transition-all">
        🍽️ Thực đơn
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
              className="fixed top-0 right-0 z-[1001] h-full w-72 bg-white shadow-lg z-40 p-4 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3 }}>
              <div className="flex mt-[60px] justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Danh mục</h2>
                <button onClick={() => setIsOpen(false)} className="text-2xl">
                  &times;
                </button>
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
