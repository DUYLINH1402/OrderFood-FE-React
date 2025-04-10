import React from "react";
import { Skeleton } from "antd";

const SkeletonSection = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "400px",
        background: "#f0f2f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        borderRadius: "8px",
      }}>
      <Skeleton
        active
        title={{ width: "60%" }} // Tiêu đề chiếm 60% chiều rộng
        paragraph={{ rows: 3, width: ["100%", "80%", "90%"] }} // Các đoạn có chiều rộng khác nhau
      />
    </div>
  );
};

export default SkeletonSection;
