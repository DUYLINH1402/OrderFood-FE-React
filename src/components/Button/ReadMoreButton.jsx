import React from "react";

export default function ReadMoreButton({
  isExpanded,
  onToggle,
  expandText = "Xem thêm",
  collapseText = "Thu gọn",
  showItemCount = false,
  itemCount = 0,
  className = "",
}) {
  const displayText = isExpanded
    ? collapseText
    : showItemCount && itemCount > 0
    ? `${expandText} ${itemCount} món`
    : expandText;

  return (
    <div
      className={`flex flex-col items-center select-none cursor-pointer ${className}`}
      onClick={onToggle}>
      <ArrowAnimation isExpanded={isExpanded} />
      <button
        className="text-gray-400 text-2xl font-medium focus:outline-none hover:text-blue-500 transition"
        onClick={onToggle}
        style={{ fontFamily: "Google Sans, Arial, sans-serif" }}>
        {displayText}
      </button>
    </div>
  );
}

// Mũi tên động
function ArrowAnimation({ isExpanded }) {
  // Nếu isExpanded = true → hiệu ứng bay lên (thu gọn), ngược lại là bay xuống (xem thêm)
  const direction = isExpanded ? -1 : 1;
  const offsetY = (y) => (direction === 1 ? y : 60 - y); // Đảo tọa độ y cho mũi tên

  return (
    <svg
      width="32"
      height="60"
      viewBox="0 0 32 60"
      fill="none"
      className="block"
      style={{ display: "block" }}>
      {/* Arrow 1 */}
      <polyline
        points={`8,${offsetY(16)} 16,${offsetY(24)} 24,${offsetY(16)}`}
        stroke="#757575"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="1">
        <animate
          attributeName="opacity"
          values="1;0.3;0"
          keyTimes="0;0.6;1"
          dur="1s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="points"
          values={
            direction === 1
              ? // Bay xuống
                `
                8,16 16,24 24,16;
                8,26 16,34 24,26;
                8,36 16,44 24,36
              `
              : // Bay lên
                `
                8,44 16,36 24,44;
                8,34 16,26 24,34;
                8,24 16,16 24,24
              `
          }
          keyTimes="0;0.6;1"
          dur="1s"
          repeatCount="indefinite"
        />
      </polyline>
      {/* Arrow 2 */}
      <polyline
        points={`8,${offsetY(26)} 16,${offsetY(34)} 24,${offsetY(26)}`}
        stroke="#757575"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.5">
        <animate
          attributeName="opacity"
          values="0.5;0.3;0"
          keyTimes="0;0.6;1"
          dur="1s"
          begin="0.2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="points"
          values={
            direction === 1
              ? `
                8,26 16,34 24,26;
                8,36 16,44 24,36;
                8,46 16,54 24,46
              `
              : `
                8,34 16,26 24,34;
                8,24 16,16 24,24;
                8,14 16,6 24,14
              `
          }
          keyTimes="0;0.6;1"
          dur="1s"
          begin="0.2s"
          repeatCount="indefinite"
        />
      </polyline>
      {/* Arrow 3 */}
      <polyline
        points={`8,${offsetY(36)} 16,${offsetY(44)} 24,${offsetY(36)}`}
        stroke="#757575"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.2">
        <animate
          attributeName="opacity"
          values="0.2;0.1;0"
          keyTimes="0;0.6;1"
          dur="1s"
          begin="0.4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="points"
          values={
            direction === 1
              ? `
                8,36 16,44 24,36;
                8,46 16,54 24,46;
                8,56 16,64 24,56
              `
              : `
                8,24 16,16 24,24;
                8,14 16,6 24,14;
                8,4 16,-4 24,4
              `
          }
          keyTimes="0;0.6;1"
          dur="1s"
          begin="0.4s"
          repeatCount="indefinite"
        />
      </polyline>
    </svg>
  );
}
