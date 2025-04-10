import React from "react";
import { Skeleton, Layout, Row, Col } from "antd";
const { Content } = Layout; // Giải cấu trúc các phần của Layout từ Ant Design

const FullPageSkeleton = () => {
  return (
    <div className="skeleton-container">
      {/* Layout tổng thể bao phủ toàn bộ trang */}
      <Layout style={{ minHeight: "100vh" }}>
        {" "}
        {/* Đảm bảo chiều cao tối thiểu là toàn màn hình */}
        <>
          {/* Content chứa danh sách các Skeleton Card */}
          <Content style={{ padding: "24px", background: "#f0f2f5" }}>
            <Row gutter={[16, 16]}>
              {" "}
              {/* Gutter thêm khoảng cách giữa các cột */}
              {Array.from({ length: 6 }).map((_, index) => (
                <Col key={index} xs={24} sm={12} lg={8}>
                  {" "}
                  {/* Mỗi Skeleton Card được đặt trong một cột */}
                  <Skeleton
                    active
                    title={{ width: "80%" }} // Chiều rộng của tiêu đề giả lập
                    paragraph={{ rows: 4 }} // Số lượng dòng mô phỏng trong đoạn văn
                  />
                </Col>
              ))}
            </Row>
          </Content>
        </>
      </Layout>
    </div>
  );
};

export default FullPageSkeleton;
