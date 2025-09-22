import React, { useState, useEffect } from "react";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import "../../assets/styles/components/ScrollToTop.scss";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Hiển thị button khi scroll xuống quá 300px
      const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`scroll-to-top ${isVisible ? "visible" : ""}`}
      onClick={scrollToTop}
      title="Lên đầu trang">
      <ChevronUpIcon className="w-6 h-6" />
    </div>
  );
};

export default ScrollToTop;
