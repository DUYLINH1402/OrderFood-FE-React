import React from "react";
import BaseLayout from "./BaseLayout";

const AdminLayout = ({ children }) => {
  // Cấu hình header gradient cho Admin
  const adminHeaderGradient = {
    background:
      "linear-gradient(90deg, rgba(253, 230, 138, 0.95) 0%, rgba(245, 158, 11, 0.90) 60%, rgba(255, 255, 255, 0.15) 100%)",
    boxShadow: "0 4px 20px 0 rgba(217, 119, 6, 0.15), 0 2px 0 0 #d97706",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
  };

  return (
    <BaseLayout
      title="Quản trị hệ thống"
      subtitle="Admin Dashboard - Đồng Xanh"
      headerGradient={adminHeaderGradient}>
      {children}
    </BaseLayout>
  );
};

export default AdminLayout;
