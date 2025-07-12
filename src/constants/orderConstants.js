// Order Status Constants
export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  SHIPPING: "SHIPPING",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

// Order Status Labels (Vietnamese)
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Chờ xác nhận",
  [ORDER_STATUS.CONFIRMED]: "Đã xác nhận",
  [ORDER_STATUS.PREPARING]: "Đang chuẩn bị",
  [ORDER_STATUS.SHIPPING]: "Đang giao hàng",
  [ORDER_STATUS.DELIVERED]: "Đã giao hàng",
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
  [ORDER_STATUS.CONFIRMED]: {
    label: ORDER_STATUS_LABELS[ORDER_STATUS.CONFIRMED],
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: "faCheckCircle",
  },
  [ORDER_STATUS.PREPARING]: {
    label: ORDER_STATUS_LABELS[ORDER_STATUS.PREPARING],
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: "faClock",
  },
  [ORDER_STATUS.SHIPPING]: {
    label: ORDER_STATUS_LABELS[ORDER_STATUS.SHIPPING],
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: "faTruck",
  },
  [ORDER_STATUS.DELIVERED]: {
    label: ORDER_STATUS_LABELS[ORDER_STATUS.DELIVERED],
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

// Allowed status transitions
export const STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [], // Final state
  [ORDER_STATUS.CANCELLED]: [], // Final state
};

// Status that allow cancellation
export const CANCELLABLE_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
];

// Common validation constants
export const ORDER_CONSTRAINTS = {
  MIN_ORDER_VALUE: 20000, // 20,000 VND
  FREE_SHIPPING_THRESHOLD: 500000, // 500,000 VND
  DEFAULT_DELIVERY_FEE: 30000, // 30,000 VND
  MAX_POINTS_DISCOUNT_PERCENTAGE: 0.5, // 50%
  POINTS_TO_VND_RATE: 1, // 1000 points = 1000 VND
};
