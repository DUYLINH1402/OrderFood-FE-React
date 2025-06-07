// ✅ SearchBar.jsx
import "./styles//SearchBar.modul.scss";
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon, faSearch, faTimes } from "../utils/icons.js";
import FullPageSkeleton from "./Skeleton/FullPageSkeleton";
import { Link, NavLink } from "react-router-dom";

const SearchBar = ({ onSearch, placeholder, setIsSearchExpanded }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => document.body.classList.remove("no-scroll");
  }, [isExpanded]);

  const handleExpand = () => {
    setIsExpanded(true);
    setIsSearchExpanded?.(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setIsSearchExpanded?.(false);
  };

  const handleBlur = () => {
    if (window.innerWidth < 768) {
      handleCollapse();
    }
  };

  return (
    <div
      className={`p-3 overflow-hidden
        ${isExpanded ? "w-[270px]" : "w-[30px] md:w-[40px]"}
        h-[30px] md:h-[40px]
        bg-[#279736] shadow-[2px_2px_20px_rgba(0,0,0,0.08)] 
        rounded-full flex group items-center transition-all duration-1000 ease-in-out`}
      onMouseEnter={() => {
        if (window.innerWidth >= 768) handleExpand();
      }}
      onMouseLeave={() => {
        if (window.innerWidth >= 768) handleCollapse();
      }}
      onClick={() => {
        if (window.innerWidth < 768) handleExpand();
      }}>
      <div className="flex items-center justify-center fill-white md:ml-1 md:mt-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          id="Isolation_Mode"
          data-name="Isolation Mode"
          viewBox="0 0 24 24"
          className="md:w-[22px] md:h-[22px] w-6 h-6">
          <path d="M18.9,16.776A10.539,10.539,0,1,0,16.776,18.9l5.1,5.1L24,21.88ZM10.5,18A7.5,7.5,0,1,1,18,10.5,7.507,7.507,0,0,1,10.5,18Z" />
        </svg>
      </div>
      <input
        ref={inputRef}
        onBlur={handleBlur}
        type="text"
        className="border-none outline-none text-sm md:text-base bg-transparent w-full text-white"
      />
    </div>
  );
};

export default SearchBar;
