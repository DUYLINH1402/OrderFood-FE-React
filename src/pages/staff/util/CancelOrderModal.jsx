import React from "react";
import { Modal, Input, Button } from "antd";

const { TextArea } = Input;

/**
 * Modal component để hủy đơn hàng - sử dụng Ant Design
 * @param {Object} props - Props của component
 * @param {boolean} props.open - Trạng thái hiển thị modal
 * @param {string|number} props.orderId - ID của đơn hàng cần hủy
 * @param {string} props.cancelReason - Lý do hủy đơn hàng
 * @param {Function} props.onReasonChange - Callback khi thay đổi lý do hủy
 * @param {Function} props.onConfirm - Callback khi xác nhận hủy đơn hàng
 * @param {Function} props.onCancel - Callback khi đóng modal hoặc hủy bỏ
 * @param {boolean} props.loading - Trạng thái loading khi đang xử lý
 */
const CancelOrderModal = ({
  open,
  orderId,
  cancelReason,
  onReasonChange,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  // Xử lý xác nhận hủy đơn hàng
  const handleConfirm = () => {
    if (!cancelReason.trim()) {
      // Có thể thêm validation hoặc toast warning ở đây
      return;
    }
    onConfirm();
  };

  return (
    <Modal
      title={
        <div className="text-md tablet:text-lg desktop:text-xl font-semibold text-gray-900">
          Hủy đơn hàng
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button
          key="cancel"
          size="large"
          onClick={onCancel}
          disabled={loading}
          className="text-sm tablet:text-md desktop:text-base">
          Đóng
        </Button>,
        <Button
          key="confirm"
          type="primary"
          danger
          size="large"
          loading={loading}
          onClick={handleConfirm}
          className="text-sm tablet:text-md desktop:text-base">
          Xác nhận hủy
        </Button>,
      ]}
      width={500}
      centered
      maskClosable={!loading} // Không cho phép đóng bằng click backdrop khi đang loading
      closable={!loading} // Không cho phép đóng bằng nút X khi đang loading
    >
      <div className="py-4">
        <p className="text-sm tablet:text-md desktop:text-base text-gray-600 mb-4">
          Vui lòng nhập lý do hủy đơn hàng <strong>#{orderId}</strong>
        </p>
        <TextArea
          rows={3}
          placeholder="Lý do hủy đơn hàng..."
          value={cancelReason}
          onChange={(e) => onReasonChange(e.target.value)}
          className="text-sm tablet:text-md desktop:text-base"
          disabled={loading}
          maxLength={500} // Giới hạn độ dài lý do
          showCount // Hiển thị số ký tự
        />
      </div>
    </Modal>
  );
};

export default CancelOrderModal;
