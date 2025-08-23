import React, { useState } from "react";
import { Modal, Button, Card, Space, Typography, Divider, Input } from "antd";
import { CheckCircleOutlined, EditOutlined, TrophyOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CompleteDeliveryModal = ({ open, orderInfo, onConfirm, onCancel, loading = false }) => {
  const [staffNote, setStaffNote] = useState(""); // Khởi tạo là string rỗng

  if (!orderInfo) return null;

  const handleConfirm = async () => {
    // Đảm bảo staffNote là string và xử lý an toàn
    const noteValue = typeof staffNote === "string" ? staffNote.trim() : "";

    // Gọi callback từ component cha để xử lý API call
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
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
          <span>Xác nhận hoàn tất giao hàng</span>
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
            backgroundColor: "#f6ffed",
            borderColor: "#b7eb8f",
            marginTop: 16,
          }}>
          <Space align="start">
            <TrophyOutlined style={{ color: "#52c41a", fontSize: 16 }} />
            <div>
              <Title level={5} style={{ margin: 0, color: "#389e0d" }}>
                {orderInfo.deliveryType === "DELIVERY"
                  ? "Đơn hàng đã được giao thành công!"
                  : "Khách đã nhận đơn hàng!"}
              </Title>
              <Text style={{ color: "#52c41a", fontSize: 13 }}>
                Xác nhận để hoàn tất đơn hàng và chuyển sang trạng thái "Đã hoàn thành"
              </Text>
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

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong>Số điện thoại:</Text>
              <Text style={{ fontWeight: 600 }}>{orderInfo.receiverPhone || "N/A"}</Text>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong>Tổng tiền:</Text>
              <Text style={{ color: "#f5222d", fontWeight: 600 }}>
                {orderInfo.totalPrice?.toLocaleString() || 0} VNĐ
              </Text>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong>Thanh toán:</Text>
              <Text>{orderInfo.paymentMethod || "N/A"}</Text>
            </div>

            <Divider style={{ margin: "8px 0" }} />

            {/* Hiển thị thông tin giao hàng */}
            {orderInfo.deliveryType === "DELIVERY" && (
              <div>
                <Text strong>Đã giao tại địa chỉ:</Text>
                <Paragraph
                  style={{
                    margin: "4px 0 0 0",
                    color: "#666",
                    fontSize: 13,
                    backgroundColor: "#f6ffed",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #b7eb8f",
                  }}>
                  {(() => {
                    // Tạo địa chỉ đầy đủ từ các thành phần
                    const addressParts = [
                      orderInfo.deliveryAddress,
                      orderInfo.wardName,
                      orderInfo.districtName,
                      orderInfo.provinceName || orderInfo.cityName,
                    ].filter((part) => part && part.trim() !== "");

                    if (addressParts.length > 0) {
                      return addressParts.join(", ");
                    }

                    return "Chưa có địa chỉ giao hàng";
                  })()}
                </Paragraph>
              </div>
            )}

            {/* Hiển thị thông tin lấy tại cửa hàng */}
            {orderInfo.deliveryType === "TAKE_AWAY" && (
              <div>
                <Text strong style={{ color: "#52c41a" }}>
                  <CheckCircleOutlined style={{ marginRight: 4 }} />
                  Khách đã nhận tại cửa hàng
                </Text>
                <Paragraph
                  style={{
                    margin: "4px 0 0 0",
                    color: "#666",
                    fontSize: 13,
                    backgroundColor: "#f6ffed",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #b7eb8f",
                  }}>
                  Khách hàng đã đến cửa hàng và nhận đơn hàng thành công.
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
              <span>Ghi chú hoàn tất đơn hàng</span>
            </Space>
          }
          size="small">
          <TextArea
            placeholder="Nháp ghi chú về việc hoàn tất đơn hàng (tùy chọn)..."
            value={staffNote}
            onChange={(e) => setStaffNote(e.target.value)}
            rows={3}
            maxLength={200}
            showCount
            disabled={loading}
          />
          <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
            {orderInfo.deliveryType === "DELIVERY"
              ? 'Ví dụ: "Giao hàng thành công, khách hài lòng với chất lượng món ăn"'
              : 'Ví dụ: "Khách đã nhận và thanh toán đầy đủ, cảm ơn khách hàng"'}
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
            icon={<CheckCircleOutlined />}
            size="large"
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}>
            {loading ? "Đang xử lý..." : "Hoàn tất đơn hàng"}
          </Button>
        </Space>
      </Space>
    </Modal>
  );
};

export default CompleteDeliveryModal;
