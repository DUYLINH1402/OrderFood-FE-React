import React from "react";
import BaseLayout from "./BaseLayout";

const StaffLayout = ({ children }) => {
  // Cấu hình header gradient cho Staff
  const staffHeaderGradient = {
    background:
      "linear-gradient(90deg, rgba(228, 233, 230, 0.95) 0%, rgba(34, 197, 94, 0.90) 60%, rgba(255, 255, 255, 0.15) 100%)",
    boxShadow: "0 4px 20px 0 rgba(22, 163, 74, 0.15), 0 2px 0 0 #16a34a",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
  };

  return (
    <BaseLayout
      title="Quản lý nhà hàng"
      subtitle="Hệ thống quản lý Đồng Xanh"
      headerGradient={staffHeaderGradient}>
      {children}
    </BaseLayout>
  );
};

export default StaffLayout;
