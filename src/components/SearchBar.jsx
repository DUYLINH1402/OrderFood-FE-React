// Fixed SearchBar.jsx
import "../assets/styles/components/SearchBar.module.scss";
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon, faSearch, faTimes } from "../utils/icons.js";
import FullPageSkeleton from "./Skeleton/FullPageSkeleton";
import { Link, NavLink } from "react-router-dom";

const SearchBar = ({ onSearch, placeholder, setIsSearchExpanded }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => document.body.classList.remove("no-scroll");
  }, [isExpanded]);

  // Click outside để đóng search bar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (isExpanded) {
          handleCollapse();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  const handleExpand = () => {
    setIsExpanded(true);
    setIsSearchExpanded?.(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setIsSearchExpanded?.(false);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isExpanded) {
      handleExpand();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`p-3 overflow-hidden cursor-pointer
        ${isExpanded ? "w-[270px]" : "w-[30px] md:w-[40px]"}
        h-[30px] md:h-[40px]
        bg-[#199b7e] shadow-[2px_2px_20px_rgba(0,0,0,0.08)] 
        rounded-full flex group items-center transition-all duration-300 ease-in-out`}
      onClick={handleClick}>
      <div className="flex items-center justify-center fill-white/70 md:ml-1 md:mt-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="white"
          strokeWidth={1.8}
          className="w-6 h-6 laptop:w-[22px] laptop:h-[22px]">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
          />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder={isExpanded ? "Tìm kiếm..." : ""}
        className="border-none outline-none text-sm md:text-base bg-transparent w-full text-white placeholder-white/70"
        onClick={(e) => e.stopPropagation()} // Prevent triggering parent click when clicking input
      />
    </div>
  );
};

export default SearchBar;
