// Hàm ánh xạ lỗi liên quan đến Order (đặt hàng, coupon, points, delivery...)
export const mapOrderError = (errorCode) => {
  switch (errorCode) {
    case "COUPON_INVALID":
    case "COUPON_NOT_FOUND":
      return { coupon: "Mã giảm giá không hợp lệ" };
    case "COUPON_EXPIRED":
      return { coupon: "Mã giảm giá đã hết hạn" };
    case "COUPON_USED":
      return { coupon: "Mã giảm giá đã được sử dụng" };
    case "COUPON_MIN_ORDER_AMOUNT":
      return { coupon: "Đơn hàng chưa đủ giá trị tối thiểu để áp dụng coupon" };
    case "COUPON_NOT_APPLICABLE":
      return { coupon: "Coupon không áp dụng cho sản phẩm này" };
    case "POINTS_INVALID":
      return { points: "Số điểm sử dụng không hợp lệ" };
    case "POINTS_EXCEED":
      return { points: "Số điểm sử dụng vượt quá số điểm hiện có" };
    case "DELIVERY_ADDRESS_INVALID":
      return { delivery: "Địa chỉ giao hàng không hợp lệ" };
    case "ORDER_ITEMS_EMPTY":
      return { general: "Không có sản phẩm nào trong đơn hàng" };
    case "ORDER_USER_NOT_FOUND":
      return { general: "Người dùng không tồn tại" };
    case "ORDER_PAYMENT_FAILED":
      return { payment: "Thanh toán thất bại. Vui lòng thử lại" };
    default:
      return { general: errorCode };
  }
};
