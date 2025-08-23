import React, { useState } from "react";
import { Modal, Button, Card, Space, Typography, Divider, Input } from "antd";
import { PhoneOutlined, InfoCircleOutlined, EditOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const PhoneConfirmModal = ({ open, orderInfo, onConfirm, onCancel, loading = false }) => {
  const [staffNote, setStaffNote] = useState(""); // Đảm bảo khởi tạo là string rỗng
  if (!orderInfo) return null;

  const handleConfirm = async () => {
    // Đảm bảo staffNote là string và xử lý an toàn
    const noteValue = typeof staffNote === "string" ? staffNote.trim() : "";

    // Gọi callback từ component cha để xử lý API call
    // Component cha (StaffDashboard) sẽ xử lý API call và cập nhật UI
    if (onConfirm) {
      onConfirm(noteValue);
    }
    setStaffNote("");
  };

  const handleCancel = () => {
    if (!loading) {
      setStaffNote("");
      onCancel();
    }
  };

  return (
    <Modal
      title={
        <Space>
          <PhoneOutlined style={{ color: "#1890ff" }} />
          <span>Xác nhận với khách hàng</span>
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
      maskClosable={!loading}
      closable={!loading}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Alert Message */}
        <Card
          size="small"
          style={{
            backgroundColor: "#e6f7ff",
            borderColor: "#91d5ff",
            marginTop: 16,
          }}>
          <Space align="start">
            <InfoCircleOutlined style={{ color: "#1890ff", fontSize: 16 }} />
            <div>
              <Title level={5} style={{ margin: 0, color: "#096dd9" }}>
                Hãy xác nhận đơn hàng với khách qua số điện thoại!
              </Title>
            </div>
          </Space>
        </Card>

        {/* Order Information */}
        <Card title="Thông tin đơn hàng" size="small" style={{ backgroundColor: "#fafafa" }}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong>Mã đơn:</Text>
              <Text>#{orderInfo.orderCode || orderInfo.id}</Text>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong>Khách hàng:</Text>
              <Text>{orderInfo.receiverName || "N/A"}</Text>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text strong>Số điện thoại:</Text>
              <Button
                type="link"
                icon={<PhoneOutlined />}
                href={`tel:${orderInfo.receiverPhone}`}
                style={{
                  padding: 0,
                  height: "auto",
                  fontWeight: 600,
                  fontSize: 14,
                }}>
                {orderInfo.receiverPhone || "N/A"}
              </Button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong>Tổng tiền:</Text>
              <Text style={{ color: "#f5222d", fontWeight: 600 }}>
                {orderInfo.totalPrice?.toLocaleString() || 0} VNĐ
              </Text>
            </div>

            <Divider style={{ margin: "8px 0" }} />

            {(orderInfo.deliveryAddress ||
              orderInfo.wardName ||
              orderInfo.districtName ||
              orderInfo.provinceName ||
              orderInfo.cityName) && (
              <div>
                <Text strong>Địa chỉ giao hàng:</Text>
                <Paragraph
                  style={{
                    margin: "4px 0 0 0",
                    color: "#666",
                    fontSize: 13,
                  }}>
                  {(() => {
                    // Tạo địa chỉ đầy đủ từ các thành phần
                    const addressParts = [
                      orderInfo.deliveryAddress, // Địa chỉ chi tiết từ API
                      orderInfo.wardName, // Phường/Xã
                      orderInfo.districtName, // Quận/Huyện
                      orderInfo.provinceName || orderInfo.cityName, // Tỉnh/Thành phố
                    ].filter((part) => part && part.trim() !== "");

                    if (addressParts.length > 0) {
                      return addressParts.join(", ");
                    }

                    return "Chưa có địa chỉ giao hàng";
                  })()}
                </Paragraph>
              </div>
            )}

            {orderInfo.customerNote && (
              <>
                <Divider style={{ margin: "8px 0" }} />
                <div>
                  <Text strong>Ghi chú khách hàng:</Text>
                  <Paragraph
                    style={{
                      margin: "4px 0 0 0",
                      color: "#666",
                      fontSize: 13,
                      fontStyle: "italic",
                    }}>
                    {orderInfo.customerNote}
                  </Paragraph>
                </div>
              </>
            )}
          </Space>
        </Card>

        {/* Staff Note Input */}
        <Card
          title={
            <Space>
              <EditOutlined />
              <span>Ghi chú của nhân viên</span>
            </Space>
          }
          size="small">
          <TextArea
            placeholder="Nhập ghi chú về cuộc gọi xác nhận với khách hàng (tùy chọn)..."
            value={staffNote}
            onChange={(e) => setStaffNote(e.target.value)}
            rows={3}
            maxLength={200}
            showCount
            disabled={loading}
          />
          <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
            Ví dụ: "Khách xác nhận đặt hàng, yêu cầu giao trước 7h tối"
          </Text>
        </Card>

        {/* Action Buttons */}
        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={handleCancel} disabled={loading} size="large">
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleConfirm}
            loading={loading}
            icon={<PhoneOutlined />}
            size="large">
            {loading ? "Đang xác nhận..." : "Đã xác nhận qua điện thoại"}
          </Button>
        </Space>
      </Space>
    </Modal>
  );
};

export default PhoneConfirmModal;
