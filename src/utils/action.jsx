import React, { useRef } from "react";

// Hành động thêm món ăn vào giỏ hàng
// và tạo hiệu ứng bay đến biểu tượng giỏ hàng
export const flyToCart = (imageRef) => {
  const cartIcon = document.querySelector(".header__cart");
  const image = imageRef?.current;

  if (!cartIcon || !image) return;
  // Kiểm tra nếu ảnh chưa render xong
  // Nếu ảnh chưa render xong thì không thực hiện hiệu ứng
  // và không thêm món ăn vào giỏ hàng
  const imgRect = image.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  if (imgRect.width === 0 || imgRect.height === 0) {
    console.warn("Ảnh món ăn chưa sẵn sàng, hủy flyToCart");
    return;
  }
  if (!cartIcon) {
    console.warn("Không tìm thấy biểu tượng giỏ hàng");
  }
  if (!image) {
    console.warn("Không tìm thấy ảnh món ăn");
  }

  const clone = image.cloneNode(true);
  clone.style.position = "fixed";
  clone.style.zIndex = "9999";
  clone.style.left = imgRect.left + "px";
  clone.style.top = imgRect.top + "px";
  clone.style.width = imgRect.width + "px";
  clone.style.height = imgRect.height + "px";
  clone.style.transition = "all 0.8s ease-in-out";
  clone.style.borderRadius = "12px";
  clone.style.opacity = "1";
  clone.style.pointerEvents = "none";

  document.body.appendChild(clone);

  setTimeout(() => {
    clone.style.left = cartRect.left + "px";
    clone.style.top = cartRect.top + "px";
    clone.style.width = "24px";
    clone.style.height = "24px";
    clone.style.opacity = "0.6";
  }, 50);

  clone.addEventListener("transitionend", () => {
    clone.remove();
    cartIcon.classList.add("cart-bounce");
    setTimeout(() => cartIcon.classList.remove("cart-bounce"), 300);
  });
};

// Hành động trượt ngang cho các phần tử

const HorizontalScrollSection = ({ items, renderItem }) => {
  const scrollRef = useRef();
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      handleScroll();
    }
    return () => {
      if (el) el.removeEventListener("scroll", handleScroll);
    };
  }, [items]);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -350, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 350, behavior: "smooth" });
  };

  return (
    <div className="relative px-2 py-6">
      <div className="relative">
        {/* Left gradient overlay */}
        {canScrollLeft && (
          <div
            className="pointer-events-none absolute left-0 top-0 h-full w-12 z-10"
            style={{
              background:
                "linear-gradient(90deg,rgba(255,255,255,0.95) 60%,rgba(255,255,255,0) 100%)",
            }}></div>
        )}
        {/* Right gradient overlay */}
        {canScrollRight && (
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-12 z-10"
            style={{
              background:
                "linear-gradient(-90deg,rgba(255,255,255,0.95) 60%,rgba(255,255,255,0) 100%)",
            }}></div>
        )}

        {/* Left button - nửa trong nửa ngoài */}
        <button
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className={`absolute -left-7 top-1/2 -translate-y-1/2 z-20 bg-white/90 shadow-lg border border-gray-200 rounded-full transition-all duration-150 hover:bg-[#f3fcf7] hover:scale-110 active:scale-95 focus:outline-none flex items-center justify-center ${
            !canScrollLeft ? "opacity-30 cursor-default" : ""
          }`}
          style={{ width: 56, height: 56, boxShadow: "0 2px 8px #0001" }}
          aria-label="Scroll left">
          <i className="fas fa-chevron-left text-3xl text-[#199b7e]"></i>
        </button>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto no-scrollbar pb-2 scroll-smooth gap-3 sm:gap-4 lg:gap-6 px-4 sm:px-8 lg:px-14"
          style={{ scrollbarWidth: "none" }}>
          {(items || []).map((item, index) => (
            <div key={index} className="flex-shrink-0 w-[200px] sm:w-[220px] lg:w-[300px]">
              {renderItem(item)}
            </div>
          ))}
        </div>

        {/* Right button - nửa trong nửa ngoài */}
        <button
          onClick={scrollRight}
          disabled={!canScrollRight}
          className={`absolute -right-7 top-1/2 -translate-y-1/2 z-20 bg-white/90 shadow-lg border border-gray-200 rounded-full transition-all duration-150 hover:bg-[#f3fcf7] hover:scale-110 active:scale-95 focus:outline-none flex items-center justify-center ${
            !canScrollRight ? "opacity-30 cursor-default" : ""
          }`}
          style={{ width: 56, height: 56, boxShadow: "0 2px 8px #0001" }}
          aria-label="Scroll right">
          <i className="fas fa-chevron-right text-3xl text-[#199b7e]"></i>
        </button>
      </div>
    </div>
  );
};

export default HorizontalScrollSection;
