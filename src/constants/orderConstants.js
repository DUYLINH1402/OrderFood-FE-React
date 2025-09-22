export const ORDER_STATUS = {
  PENDING: "PENDING", // Đơn mới tạo, chưa thanh toán (PaymentStatus = PENDING)
  PROCESSING: "PROCESSING", // Đã thanh toán, chờ nhà hàng xác nhận (PaymentStatus = PAID)
  CONFIRMED: "CONFIRMED", // Đã xác nhận, nhà hàng đang chế biến món
  DELIVERING: "DELIVERING", // Đang giao hàng (món đã chế biến xong)
  COMPLETED: "COMPLETED", // Đã giao thành công
  CANCELLED: "CANCELLED", // Đã hủy
};

// Order Status Labels (Vietnamese)
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Chờ thanh toán",
  [ORDER_STATUS.PROCESSING]: "Chờ xác nhận",
  [ORDER_STATUS.CONFIRMED]: "Đang chế biến",
  [ORDER_STATUS.DELIVERING]: "Đang giao hàng",
  [ORDER_STATUS.COMPLETED]: "Đã hoàn thành",
  [ORDER_STATUS.CANCELLED]: "Đã hủy",
};

// Order Status Colors and Icons Configuration
export const ORDER_STATUS_CONFIG = {
  [ORDER_STATUS.PENDING]: {
    label: ORDER_STATUS_LABELS[ORDER_STATUS.PENDING],
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    icon: "faClock",
  },
  [ORDER_STATUS.PROCESSING]: {
    label: ORDER_STATUS_LABELS[ORDER_STATUS.PROCESSING],
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: "faCheckCircle",
  },
  [ORDER_STATUS.CONFIRMED]: {
    label: ORDER_STATUS_LABELS[ORDER_STATUS.CONFIRMED],
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: "faUtensils",
  },
  [ORDER_STATUS.DELIVERING]: {
    label: ORDER_STATUS_LABELS[ORDER_STATUS.DELIVERING],
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: "faTruck",
  },
  [ORDER_STATUS.COMPLETED]: {
    label: ORDER_STATUS_LABELS[ORDER_STATUS.COMPLETED],
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: "faCheckCircle",
  },
  [ORDER_STATUS.CANCELLED]: {
    label: ORDER_STATUS_LABELS[ORDER_STATUS.CANCELLED],
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: "faTimesCircle",
  },
};

// Payment Methods
export const PAYMENT_METHODS = {
  COD: "COD",
  ZALOPAY: "ZALOPAY",
  MOMO: "MOMO",
  VNPAY: "VNPAY",
  BANK_TRANSFER: "BANK_TRANSFER",
};

// Payment Method Labels
export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.COD]: "Thanh toán khi nhận hàng",
  [PAYMENT_METHODS.ZALOPAY]: "ZaloPay",
  [PAYMENT_METHODS.MOMO]: "MoMo",
  [PAYMENT_METHODS.VNPAY]: "VNPay",
  [PAYMENT_METHODS.BANK_TRANSFER]: "Chuyển khoản ngân hàng",
};

// Delivery Types
export const DELIVERY_TYPES = {
  DELIVERY: "DELIVERY",
  PICKUP: "PICKUP",
};

// Delivery Type Labels
export const DELIVERY_TYPE_LABELS = {
  [DELIVERY_TYPES.DELIVERY]: "Giao hàng tận nơi",
  [DELIVERY_TYPES.PICKUP]: "Đến lấy tại cửa hàng",
};

// Order Action Types (for status updates)
export const ORDER_ACTIONS = {
  CONFIRM: "CONFIRM",
  PREPARE: "PREPARE",
  SHIP: "SHIP",
  DELIVER: "DELIVER",
  CANCEL: "CANCEL",
};

// Allowed status transitions - Matching Backend Logic
export const STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED], // Customer pays or cancels
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED], // Staff confirms or cancels
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.DELIVERING, ORDER_STATUS.CANCELLED], // Start delivery or cancel
  [ORDER_STATUS.DELIVERING]: [ORDER_STATUS.COMPLETED], // Complete delivery
  [ORDER_STATUS.COMPLETED]: [], // Final state
  [ORDER_STATUS.CANCELLED]: [], // Final state
};

// Status that allow cancellation
export const CANCELLABLE_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.CONFIRMED,
];

// Common validation constants
export const ORDER_CONSTRAINTS = {
  MIN_ORDER_VALUE: 20000, // 20,000 VND
  FREE_SHIPPING_THRESHOLD: 500000, // 500,000 VND
  DEFAULT_DELIVERY_FEE: 30000, // 30,000 VND
  MAX_POINTS_DISCOUNT_PERCENTAGE: 0.5, // 50%
  POINTS_TO_VND_RATE: 1, // 1000 points = 1000 VND
};
