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

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -400, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 400, behavior: "smooth" });
  };

  return (
    <div className="relative px-4 py-6">
      <div className="relative">
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:bg-gray-200">
          <i className="fas fa-chevron-left text-lg"></i>
        </button>

        <div ref={scrollRef} className="flex overflow-x-auto no-scrollbar pb-2 scroll-smooth gap-4">
          {items.map((item, index) => (
            <div key={index} className="flex-shrink-0 w-[300px]">
              {renderItem(item)}
            </div>
          ))}
        </div>

        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:bg-gray-200">
          <i className="fas fa-chevron-right text-lg"></i>
        </button>
      </div>
    </div>
  );
};

export default HorizontalScrollSection;
