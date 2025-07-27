import { toast } from "react-toastify";
import { validateName, validatePhoneNumber, validateEmail } from "../../utils/validation";
import { createOrder } from "../../services/service/orderService";

/**
 * Tính tổng giá tiền thực phẩm
 * @param {Array} items - Danh sách các món ăn
 * @returns {number} Tổng giá tiền
 */
export const calculateTotalFoodPrice = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

/**
 * Tính phí giao hàng hiệu quả (miễn phí nếu đơn hàng >= 500.000đ)
 * @param {number} totalFoodPrice - Tổng giá tiền thực phẩm
 * @param {number} deliveryFee - Phí giao hàng gốc
 * @returns {number} Phí giao hàng hiệu quả
 */
export const calculateEffectiveDeliveryFee = (totalFoodPrice, deliveryFee) => {
  return totalFoodPrice >= 500000 ? 0 : deliveryFee;
};

/**
 * Tính tổng giá tiền đơn hàng
 * @param {number} totalFoodPrice - Tổng giá tiền thực phẩm
 * @param {number} effectiveDeliveryFee - Phí giao hàng hiệu quả
 * @returns {number} Tổng giá tiền đơn hàng
 */
export const calculateTotalPrice = (totalFoodPrice, effectiveDeliveryFee) => {
  return totalFoodPrice + effectiveDeliveryFee;
};

/**
 * Tính tổng giá tiền đơn hàng với điểm thưởng
 * @param {number} totalFoodPrice - Tổng giá tiền thực phẩm
 * @param {number} effectiveDeliveryFee - Phí giao hàng hiệu quả
 * @param {number} pointsDiscount - Số tiền giảm từ điểm thưởng
 * @returns {number} Tổng giá tiền đơn hàng sau khi áp dụng điểm
 */
export const calculateTotalPriceWithPoints = (
  totalFoodPrice,
  effectiveDeliveryFee,
  pointsDiscount = 0
) => {
  const subtotal = totalFoodPrice + effectiveDeliveryFee;
  return Math.max(0, subtotal - pointsDiscount);
};

/**
 * Tính số tiền giảm tối đa có thể từ điểm thưởng (tối đa 50% tổng tiền)
 * @param {number} totalFoodPrice - Tổng giá tiền thực phẩm
 * @param {number} effectiveDeliveryFee - Phí giao hàng hiệu quả
 * @returns {number} Số tiền giảm tối đa
 */
export const calculateMaxPointsDiscount = (totalFoodPrice, effectiveDeliveryFee) => {
  const subtotal = totalFoodPrice + effectiveDeliveryFee;
  return Math.floor(subtotal * 0.5); // Tối đa 50% tổng tiền
};

/**
 * Tính số điểm cần sử dụng để được giảm một số tiền nhất định
 * @param {number} discountAmount - Số tiền muốn giảm
 * @param {number} pointsToVndRate - Tỷ lệ quy đổi điểm sang VND (mặc định 1000 điểm = 1000 VND)
 * @returns {number} Số điểm cần sử dụng
 */
export const calculatePointsNeeded = (discountAmount, pointsToVndRate = 1) => {
  return Math.ceil(discountAmount / pointsToVndRate);
};

/**
 * Tính số tiền giảm từ số điểm sử dụng
 * @param {number} pointsToUse - Số điểm muốn sử dụng
 * @param {number} pointsToVndRate - Tỷ lệ quy đổi điểm sang VND (mặc định 1000 điểm = 1000 VND)
 * @returns {number} Số tiền được giảm
 */
export const calculateDiscountFromPoints = (pointsToUse, pointsToVndRate = 1) => {
  return pointsToUse * pointsToVndRate;
};

/**
 * Validate số điểm sử dụng
 * @param {number} pointsToUse - Số điểm muốn sử dụng
 * @param {number} availablePoints - Số điểm có sẵn
 * @param {number} maxPointsDiscount - Số tiền giảm tối đa cho phép
 * @param {number} pointsToVndRate - Tỷ lệ quy đổi điểm sang VND
 * @returns {Object} Kết quả validation
 */
export const validatePointsUsage = (
  pointsToUse,
  availablePoints,
  maxPointsDiscount,
  pointsToVndRate = 1
) => {
  if (pointsToUse < 0) {
    return { isValid: false, message: "Số điểm không thể âm" };
  }

  if (pointsToUse > availablePoints) {
    return { isValid: false, message: "Không đủ điểm thưởng" };
  }

  const discountAmount = calculateDiscountFromPoints(pointsToUse, pointsToVndRate);
  if (discountAmount > maxPointsDiscount) {
    return { isValid: false, message: "Chỉ được sử dụng tối đa 50% tổng tiền" };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate thông tin đơn hàng
 * @param {Object} orderInfo - Thông tin đơn hàng
 * @returns {Object} Kết quả validation
 */
export const validateOrderInfo = (orderInfo) => {
  const {
    receiverName,
    receiverPhone,
    receiverEmail,
    deliveryAddress,
    selectedDistrictId,
    selectedWardId,
    deliveryType,
    checkoutItems,
  } = orderInfo;

  const errors = {
    name: validateName(receiverName),
    phone: validatePhoneNumber(receiverPhone),
    email: validateEmail(receiverEmail),
  };

  // Kiểm tra lỗi validation
  if (errors.name || errors.phone || errors.email) {
    return {
      isValid: false,
      errors,
      message: "Vui lòng kiểm tra lại thông tin người nhận.",
    };
  }

  // Kiểm tra thông tin bắt buộc
  if (!receiverName.trim() || !receiverPhone.trim() || !receiverEmail.trim()) {
    return {
      isValid: false,
      errors,
      message: "Vui lòng điền đầy đủ thông tin người nhận.",
    };
  }

  // Kiểm tra địa chỉ giao hàng nếu là giao tận nơi
  if (deliveryType === "DELIVERY") {
    if (!deliveryAddress.trim() || !selectedDistrictId || !selectedWardId) {
      return {
        isValid: false,
        errors,
        message: "Vui lòng điền đầy đủ thông tin giao hàng.",
      };
    }
  }

  // Kiểm tra sản phẩm
  if (!checkoutItems || checkoutItems.length === 0) {
    return {
      isValid: false,
      errors,
      message: "Không có món nào để đặt hàng.",
    };
  }

  return {
    isValid: true,
    errors: { name: "", phone: "", email: "" },
    message: "",
  };
};

/**
 * Chuẩn bị dữ liệu đơn hàng để gửi lên server
 * @param {Object} orderData - Dữ liệu đơn hàng
 * @returns {Object} Payload đã được chuẩn bị
 */
export const prepareOrderPayload = (orderData) => {
  const {
    user,
    receiverName,
    receiverPhone,
    receiverEmail,
    deliveryAddress,
    selectedDistrictId,
    selectedWardId,
    deliveryType,
    paymentMethod,
    totalPrice,
    checkoutItems,
    discountAmount = 0,
  } = orderData;

  return {
    userId: user?.id || null,
    receiverName: receiverName.trim(),
    receiverPhone: receiverPhone.trim(),
    receiverEmail: receiverEmail.trim(),
    deliveryAddress: deliveryType === "DELIVERY" ? deliveryAddress.trim() : "",
    districtId: deliveryType === "DELIVERY" ? parseInt(selectedDistrictId) : null,
    wardId: deliveryType === "DELIVERY" ? parseInt(selectedWardId) : null,
    deliveryType,
    paymentMethod,
    totalPrice: Math.round(totalPrice),
    discountAmount: Math.round(discountAmount) || 0,
    items: checkoutItems.map((item) => ({
      foodId: parseInt(item.foodId),
      variantId: item.variantId ? parseInt(item.variantId) : null,
      price: Math.round(item.price),
      quantity: parseInt(item.quantity),
    })),
  };
};

/**
 * Xử lý đặt hàng
 * @param {Object} orderData - Dữ liệu đơn hàng
 * @param {Function} navigate - Hàm điều hướng
 * @returns {Promise} Kết quả đặt hàng
 */
export const handleOrderSubmission = async (orderData, navigate) => {
  try {
    const payload = prepareOrderPayload(orderData);
    const result = await createOrder(payload);

    // Kiểm tra nếu có paymentUrl trong response (dành cho ZaloPay, MoMo, v.v.)
    if (result && result.paymentUrl) {
      // Chuyển hướng người dùng đến trang thanh toán
      window.location.href = result.paymentUrl;
      return { success: true, hasPaymentUrl: true };
    }

    // Nếu không có paymentUrl (COD), hiển thị thông báo và chuyển về trang chủ
    toast.success("Đặt hàng thành công!");
    navigate("/");
    return { success: true, hasPaymentUrl: false };
  } catch (err) {
    console.error("Order submission error:", err);
    const errorMessage = err?.response?.data?.message || err?.message || "Đặt hàng thất bại!";
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Xử lý logic hiển thị sản phẩm
 * @param {Array} checkoutItems - Danh sách sản phẩm
 * @param {boolean} showAllItems - Có hiển thị tất cả sản phẩm
 * @param {number} itemsToShow - Số lượng sản phẩm hiển thị mặc định
 * @returns {Object} Thông tin hiển thị sản phẩm
 */
export const getDisplayItemsInfo = (checkoutItems, showAllItems, itemsToShow = 5) => {
  const hasMoreItems = checkoutItems.length > itemsToShow;
  const displayedItems = showAllItems ? checkoutItems : checkoutItems.slice(0, itemsToShow);
  const hiddenItemsCount = checkoutItems.length - itemsToShow;

  return {
    hasMoreItems,
    displayedItems,
    hiddenItemsCount,
  };
};

/**
 * Kiểm tra thông tin đơn hàng có hợp lệ không
 * @param {Object} orderInfo - Thông tin đơn hàng
 * @returns {boolean} Có hợp lệ không
 */
export const isOrderInfoValid = (orderInfo) => {
  const {
    receiverName,
    receiverPhone,
    receiverEmail,
    deliveryAddress,
    selectedDistrictId,
    selectedWardId,
    deliveryType,
  } = orderInfo;

  return (
    receiverName &&
    receiverPhone &&
    receiverEmail &&
    (deliveryType === "TAKE_AWAY" || (deliveryAddress && selectedDistrictId && selectedWardId))
  );
};

/**
 * Xử lý thay đổi quận/huyện
 * @param {string} districtId - ID quận/huyện
 * @param {Array} districts - Danh sách quận/huyện
 * @param {Function} setDeliveryFee - Hàm set phí giao hàng
 * @param {Function} getWardsByDistrict - Hàm lấy phường/xã theo quận/huyện
 * @param {Function} setWards - Hàm set danh sách phường/xã
 * @param {Function} setSelectedWardId - Hàm set ID phường/xã được chọn
 */
export const handleDistrictChange = async (
  districtId,
  districts,
  setDeliveryFee,
  getWardsByDistrict,
  setWards,
  setSelectedWardId
) => {
  if (districtId) {
    const district = districts.find((d) => String(d.id) === String(districtId));
    setDeliveryFee(district ? district.deliveryFee : 0);

    try {
      const wards = await getWardsByDistrict(districtId);
      setWards(wards);
    } catch (error) {
      console.error("Error fetching wards:", error);
      setWards([]);
    }
  } else {
    setWards([]);
    setSelectedWardId("");
    setDeliveryFee(0);
  }
};

/**
 * Xử lý thay đổi thông tin người dùng khi toggle "Dùng thông tin cá nhân đã lưu"
 * @param {boolean} useSavedInfo - Có sử dụng thông tin đã lưu không
 * @param {Object} user - Thông tin người dùng
 * @param {Object} setters - Các hàm setter
 */
export const handleUserInfoChange = (useSavedInfo, user, setters) => {
  const { setReceiverName, setReceiverPhone, setReceiverEmail, setDeliveryAddress } = setters;

  if (useSavedInfo && user) {
    setReceiverName(user.fullName || "");
    setReceiverPhone(user.phoneNumber || "");
    setReceiverEmail(user.email || "");
    setDeliveryAddress(user.address || "");
  } else {
    setReceiverName("");
    setReceiverPhone("");
    setReceiverEmail("");
    setDeliveryAddress("");
  }
};
