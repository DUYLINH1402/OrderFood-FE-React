import React from "react";
import { motion } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";

const MobileMenuToggle = ({ isOpen, onToggle, className = "" }) => {
  return (
    <motion.button
      onClick={onToggle}
      className={`
        relative p-2 hover:bg-gray-100 rounded-lg transition-colors 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        ${className}
      `}
      whileTap={{ scale: 0.95 }}
      aria-label={isOpen ? "Đóng menu" : "Mở menu"}>
      <div className="relative w-5 h-5">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{ rotate: isOpen ? 180 : 0, opacity: isOpen ? 0 : 1 }}
          transition={{ duration: 0.2 }}>
          <FiMenu className="w-5 h-5 text-gray-600" />
        </motion.div>

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{ rotate: isOpen ? 0 : -180, opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.2 }}>
          <FiX className="w-5 h-5 text-gray-600" />
        </motion.div>
      </div>
    </motion.button>
  );
};

export default MobileMenuToggle;
