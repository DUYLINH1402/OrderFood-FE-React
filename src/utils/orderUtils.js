// Order utility functions for data transformation and mapping
import { ORDER_STATUS, PAYMENT_METHODS, DELIVERY_TYPES } from "../constants/orderConstants";

/**
 * Transform API order response to frontend format
 * @param {Object} apiOrder - Order data from API
 * @returns {Object} - Transformed order data
 */
export const transformApiOrderToFrontend = (apiOrder) => {
  if (!apiOrder) return null;

  return {
    id: apiOrder.orderId || apiOrder.id, // Sử dụng orderId từ API
    orderCode: apiOrder.orderCode,
    status: apiOrder.status?.toUpperCase(),
    createdAt: apiOrder.createdAt,
    updatedAt: apiOrder.updatedAt,

    // Customer info
    receiverName: apiOrder.receiverName,
    receiverPhone: apiOrder.receiverPhone,
    receiverEmail: apiOrder.receiverEmail,

    // Delivery info
    deliveryType: apiOrder.deliveryType?.toUpperCase(),
    deliveryAddress: apiOrder.deliveryAddress,
    districtId: apiOrder.districtId,
    wardId: apiOrder.wardId,
    estimatedDelivery: apiOrder.estimatedDelivery,
    deliveryTime: apiOrder.deliveryTime,
    deliveryFee: apiOrder.deliveryFee,

    // Payment info
    paymentMethod: apiOrder.paymentMethod?.toUpperCase(),
    paymentStatus: apiOrder.paymentStatus,
    totalPrice: apiOrder.totalPrice,
    total: apiOrder.totalPrice, // Thêm trường total cho compatibility
    pointsToUse: apiOrder.pointsToUse,
    pointsDiscount: apiOrder.pointsDiscount,

    // Order items
    items:
      apiOrder.items?.map((item) => ({
        id: item.id,
        foodId: item.foodId,
        foodName: item.foodName,
        foodSlug: item.foodSlug,
        imageUrl: item.imageUrl,
        variantId: item.variantId,
        variantName: item.variantName,
        price: item.price,
        quantity: item.quantity,
        name: item.foodName, // For compatibility
      })) || [],

    // Status specific fields
    cancelReason: apiOrder.cancelReason,
    cancelledAt: apiOrder.cancelledAt,
    statusNote: apiOrder.statusNote,

    // Deprecated fields for backward compatibility
    date: apiOrder.createdAt,
    address:
      apiOrder.deliveryAddress ||
      `${apiOrder.receiverName || ""} - ${apiOrder.receiverPhone || ""}`,
    customerName: apiOrder.receiverName,
    customerPhone: apiOrder.receiverPhone,
  };
};

/**
 * Transform Firebase order to frontend format
 * @param {Object} firebaseOrder - Order data from Firebase
 * @returns {Object} - Transformed order data
 */
export const transformFirebaseOrderToFrontend = (firebaseOrder) => {
  if (!firebaseOrder) return null;

  return {
    id: firebaseOrder.id,
    orderCode: firebaseOrder.orderCode,
    status: firebaseOrder.status?.toUpperCase(),
    createdAt: firebaseOrder.createdAt,
    updatedAt: firebaseOrder.updatedAt,

    // Customer info
    receiverName: firebaseOrder.receiverName,
    receiverPhone: firebaseOrder.receiverPhone,
    receiverEmail: firebaseOrder.receiverEmail,

    // Delivery info
    deliveryType: firebaseOrder.deliveryType?.toUpperCase(),
    deliveryAddress: firebaseOrder.deliveryAddress,
    estimatedDelivery: firebaseOrder.estimatedDelivery,
    deliveryTime: firebaseOrder.deliveryTime,
    deliveryFee: firebaseOrder.deliveryFee,

    // Payment info
    paymentMethod: firebaseOrder.paymentMethod?.toUpperCase(),
    totalPrice: firebaseOrder.totalPrice,
    pointsToUse: firebaseOrder.pointsToUse,
    pointsDiscount: firebaseOrder.pointsDiscount,

    // Order items
    items:
      firebaseOrder.items?.map((item) => ({
        id: item.id,
        foodId: item.foodId,
        foodName: item.foodName,
        variantId: item.variantId,
        variantName: item.variantName,
        price: item.price,
        quantity: item.quantity,
        name: item.foodName, // For compatibility
      })) || [],

    // Status specific fields
    cancelReason: firebaseOrder.cancelReason,
    cancelledAt: firebaseOrder.cancelledAt,
    statusNote: firebaseOrder.statusNote,

    // Deprecated fields for backward compatibility
    date: firebaseOrder.createdAt,
    total: firebaseOrder.totalPrice,
    address: firebaseOrder.deliveryAddress,
    customerName: firebaseOrder.receiverName,
    customerPhone: firebaseOrder.receiverPhone,
  };
};

/**
 * Transform frontend order data to API format
 * @param {Object} frontendOrder - Order data from frontend
 * @returns {Object} - Transformed order data for API
 */
export const transformFrontendOrderToApi = (frontendOrder) => {
  if (!frontendOrder) return null;

  return {
    userId: frontendOrder.userId,
    receiverName: frontendOrder.receiverName,
    receiverPhone: frontendOrder.receiverPhone,
    receiverEmail: frontendOrder.receiverEmail,

    deliveryType: frontendOrder.deliveryType,
    deliveryAddress: frontendOrder.deliveryAddress,
    districtId: frontendOrder.districtId,
    wardId: frontendOrder.wardId,

    paymentMethod: frontendOrder.paymentMethod,
    totalPrice: frontendOrder.totalPrice,
    pointsToUse: frontendOrder.pointsToUse,
    pointsDiscount: frontendOrder.pointsDiscount,

    items:
      frontendOrder.items?.map((item) => ({
        foodId: item.foodId,
        variantId: item.variantId,
        price: item.price,
        quantity: item.quantity,
      })) || [],
  };
};

/**
 * Validate order data before submission
 * @param {Object} orderData - Order data to validate
 * @returns {Object} - Validation result
 */
export const validateOrderData = (orderData) => {
  const errors = [];

  // Required fields validation
  if (!orderData.receiverName?.trim()) {
    errors.push("Tên người nhận không được để trống");
  }

  if (!orderData.receiverPhone?.trim()) {
    errors.push("Số điện thoại không được để trống");
  }

  if (orderData.deliveryType === DELIVERY_TYPES.DELIVERY && !orderData.deliveryAddress?.trim()) {
    errors.push("Địa chỉ giao hàng không được để trống");
  }

  if (!orderData.paymentMethod) {
    errors.push("Vui lòng chọn phương thức thanh toán");
  }

  if (!orderData.items || orderData.items.length === 0) {
    errors.push("Giỏ hàng không được để trống");
  }

  if (orderData.totalPrice <= 0) {
    errors.push("Tổng tiền đơn hàng không hợp lệ");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate order summary
 * @param {Object} orderData - Order data
 * @returns {Object} - Order summary
 */
export const calculateOrderSummary = (orderData) => {
  if (!orderData || !orderData.items) {
    return {
      subtotal: 0,
      deliveryFee: 0,
      pointsDiscount: 0,
      total: 0,
    };
  }

  const subtotal = orderData.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const deliveryFee = orderData.deliveryFee || 0;
  const pointsDiscount = orderData.pointsDiscount || 0;
  const total = subtotal + deliveryFee - pointsDiscount;

  return {
    subtotal,
    deliveryFee,
    pointsDiscount,
    total: Math.max(0, total),
  };
};

/**
 * Check if order can be cancelled
 * @param {Object} order - Order data
 * @returns {boolean} - Can cancel order
 */
export const canCancelOrder = (order) => {
  if (!order || !order.status) return false;

  const status = order.status.toUpperCase();
  return [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING].includes(status);
};

/**
 * Get next possible statuses for an order
 * @param {string} currentStatus - Current order status
 * @returns {Array} - Array of possible next statuses
 */
export const getNextStatuses = (currentStatus) => {
  const status = currentStatus?.toUpperCase();

  switch (status) {
    case ORDER_STATUS.PENDING:
      return [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED];
    case ORDER_STATUS.CONFIRMED:
      return [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED];
    case ORDER_STATUS.PREPARING:
      return [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCELLED];
    case ORDER_STATUS.SHIPPING:
      return [ORDER_STATUS.DELIVERED];
    default:
      return [];
  }
};

/**
 * Format order tracking information
 * @param {Object} order - Order data
 * @returns {Array} - Array of tracking steps
 */
export const formatOrderTracking = (order) => {
  if (!order) return [];

  const tracking = [];
  const status = order.status?.toUpperCase();

  // Order placed
  tracking.push({
    status: ORDER_STATUS.PENDING,
    label: "Đơn hàng đã được đặt",
    timestamp: order.createdAt,
    completed: true,
  });

  // Order confirmed
  tracking.push({
    status: ORDER_STATUS.CONFIRMED,
    label: "Đơn hàng đã được xác nhận",
    timestamp: status === ORDER_STATUS.CONFIRMED ? order.updatedAt : null,
    completed: [
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PREPARING,
      ORDER_STATUS.SHIPPING,
      ORDER_STATUS.DELIVERED,
    ].includes(status),
  });

  // Order preparing
  tracking.push({
    status: ORDER_STATUS.PREPARING,
    label: "Đang chuẩn bị món ăn",
    timestamp: status === ORDER_STATUS.PREPARING ? order.updatedAt : null,
    completed: [ORDER_STATUS.PREPARING, ORDER_STATUS.SHIPPING, ORDER_STATUS.DELIVERED].includes(
      status
    ),
  });

  // Order shipping
  tracking.push({
    status: ORDER_STATUS.SHIPPING,
    label: "Đang giao hàng",
    timestamp: status === ORDER_STATUS.SHIPPING ? order.updatedAt : null,
    completed: [ORDER_STATUS.SHIPPING, ORDER_STATUS.DELIVERED].includes(status),
  });

  // Order delivered
  tracking.push({
    status: ORDER_STATUS.DELIVERED,
    label: "Đã giao hàng thành công",
    timestamp: order.deliveryTime || (status === ORDER_STATUS.DELIVERED ? order.updatedAt : null),
    completed: status === ORDER_STATUS.DELIVERED,
  });

  return tracking;
};
