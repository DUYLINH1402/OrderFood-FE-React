import React, { useEffect, useState } from "react";
import { mapOrderError } from "../../utils/ErrorMapper";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getDistricts, getWardsByDistrict } from "../../services/service/zoneService";
import { getUserCoupons } from "../../services/service/couponService";
import { validateCoupon } from "../../services/service/couponService";
import shopping_cart from "../../assets/icons/shopping_cart.png";
import PaymentMethodModal from "./PaymentMethodModal";
import { LoadingButton } from "../../components/Skeleton/LoadingButton";
import PointsUsageSection from "./PointsUsageSection";
import { validateName, validatePhoneNumber, validateEmail } from "../../utils/validation";
import { fetchUserPoints } from "../../store/slices/pointsSlice";
import "../../assets/styles/main.scss";
import GlassPageWrapper from "../../components/GlassPageWrapper";
import ReadMoreButton from "../../components/Button/ReadMoreButton";
import {
  calculateTotalFoodPrice,
  calculateEffectiveDeliveryFee,
  calculateTotalPrice,
  calculateTotalPriceWithPoints,
  calculateMaxPointsDiscount,
  calculatePointsNeeded,
  calculateDiscountFromPoints,
  validatePointsUsage,
  validateOrderInfo,
  handleOrderSubmission,
  getDisplayItemsInfo,
  isOrderInfoValid as checkOrderInfoValid,
  handleDistrictChange,
  handleUserInfoChange,
} from "./orderUtils";
import LoadingIcon from "../../components/Skeleton/LoadingIcon";

export default function CheckoutPage() {
  // State cho kiểm tra coupon
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  // React Router hooks
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux selectors
  const cartItems = useSelector((state) => state.cart.items);
  const userFromStore = useSelector((state) => state.auth.user);
  const userPoints = useSelector((state) => state.points.value);

  // Lấy user thực từ Redux store
  const user = userFromStore;

  // Lấy điểm thưởng mới nhất từ Redux store
  const availablePoints = userPoints ?? user?.point ?? 0;

  // Data từ location state hoặc cart
  const checkoutItems = location.state?.checkoutItems || cartItems;

  // State cho coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [userCoupons, setUserCoupons] = useState([]);
  const [selectedCouponId, setSelectedCouponId] = useState("");

  // State cho delivery
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [useSavedInfo, setUseSavedInfo] = useState(true);

  // Constant cho UI
  const ITEMS_TO_SHOW = 5;

  // State cho thông tin người nhận
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // State cho địa chỉ giao hàng
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedWardId, setSelectedWardId] = useState("");

  // State cho UI và loading
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("COD");
  const [deliveryType, setDeliveryType] = useState("DELIVERY");
  const [showAllItems, setShowAllItems] = useState(false);

  // State cho validation errors
  const [errors, setErrors] = useState({ name: "", phone: "", email: "" });

  // State cho điểm thưởng
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [pointsError, setPointsError] = useState("");
  const [priceAnimated, setPriceAnimated] = useState(false);

  // Kiểm tra thông tin đơn hàng có hợp lệ không
  const isOrderInfoValid = checkOrderInfoValid({
    receiverName,
    receiverPhone,
    receiverEmail,
    deliveryAddress,
    selectedDistrictId,
    selectedWardId,
    deliveryType,
  });

  const pointsToVndRate = 1; // 1 điểm = 1 VND

  // Calculated values
  const totalFoodPrice = calculateTotalFoodPrice(checkoutItems);
  const effectiveDeliveryFee = calculateEffectiveDeliveryFee(totalFoodPrice, deliveryFee);
  const maxPointsDiscount = calculateMaxPointsDiscount(totalFoodPrice, effectiveDeliveryFee);
  const pointsDiscount = usePoints ? calculateDiscountFromPoints(pointsToUse, pointsToVndRate) : 0;

  // Tổng tiền sau khi trừ điểm thưởng và coupon
  const totalPrice = usePoints
    ? calculateTotalPriceWithPoints(totalFoodPrice, effectiveDeliveryFee, pointsDiscount) -
      couponDiscount
    : calculateTotalPrice(totalFoodPrice, effectiveDeliveryFee) - couponDiscount;

  const finalTotalPrice = Math.max(totalPrice, 0);

  // Display items logic
  const { hasMoreItems, displayedItems, hiddenItemsCount } = getDisplayItemsInfo(
    checkoutItems,
    showAllItems,
    ITEMS_TO_SHOW
  );

  // Lấy danh sách coupon của user
  useEffect(() => {
    async function fetchUserCoupons() {
      if (user?.id) {
        try {
          const coupons = await getUserCoupons();
          // console.log("Fetched user coupons:", coupons);
          setUserCoupons(coupons || []);
        } catch (err) {
          console.error("Error fetching user coupons:", err);
          setUserCoupons([]);
        }
      }
    }
    fetchUserCoupons();
  }, [user?.id]);

  // Hàm xử lý nhập coupon (không kiểm tra, chỉ lưu mã)
  const handleCouponInputChange = (e) => {
    const code = e.target.value.trim();
    setCouponCode(code);
    setCouponError("");
    setSelectedCouponId("");
    setCouponDiscount(0);
  };

  // Hàm chọn coupon từ danh sách
  const handleSelectCoupon = (coupon) => {
    setSelectedCouponId(coupon.id);
    setCouponCode(coupon.code);
    setCouponError("");
    setCouponDiscount(0);
  };

  // Hàm kiểm tra và áp dụng coupon
  const handleCheckCoupon = async () => {
    if (!couponCode) return;
    setIsCheckingCoupon(true); // Start loading state
    setCouponError("");

    const foodIds = checkoutItems.map((item) => item.foodId);
    const payload = {
      couponCode: couponCode,
      orderAmount: totalFoodPrice,
      foodIds: foodIds,
    };

    try {
      const res = await validateCoupon(payload);
      if (res && res.success) {
        setCouponDiscount(res.discountAmount || 0);
        setCouponError("");
      } else {
        setCouponDiscount(0);
        if (res?.errorCode) {
          const mapped = mapOrderError(res.errorCode);
          setCouponError(
            mapped.coupon || mapped.general || res?.message || "Mã coupon không hợp lệ!"
          );
        } else {
          setCouponError(res?.message || "Mã coupon không hợp lệ!");
        }
      }
    } catch (err) {
      setCouponDiscount(0);
      const errorCode = err?.response?.data?.errorCode;
      if (errorCode) {
        const mapped = mapOrderError(errorCode);
        setCouponError(mapped.coupon || mapped.general || "Có lỗi khi kiểm tra coupon!");
      } else {
        setCouponError("Có lỗi khi kiểm tra coupon!");
      }
    } finally {
      setIsCheckingCoupon(false); // End loading state
    }
  };

  useEffect(() => {
    getDistricts().then(setDistricts);
  }, []);

  useEffect(() => {
    if (selectedDistrictId) {
      handleDistrictChange(
        selectedDistrictId,
        districts,
        setDeliveryFee,
        getWardsByDistrict,
        setWards,
        setSelectedWardId
      );
    } else {
      setWards([]);
      setSelectedWardId("");
      setDeliveryFee(0);
    }
  }, [selectedDistrictId, districts]);

  useEffect(() => {
    handleUserInfoChange(useSavedInfo, user, {
      setReceiverName,
      setReceiverPhone,
      setReceiverEmail,
      setDeliveryAddress,
    });
  }, [useSavedInfo, user]);

  // Fetch điểm thưởng khi user đăng nhập
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserPoints());
    }
  }, [user?.id, dispatch]);

  // Animation cho giá khi thay đổi
  useEffect(() => {
    setPriceAnimated(true);
    const timer = setTimeout(() => setPriceAnimated(false), 300);
    return () => clearTimeout(timer);
  }, [totalPrice]);

  // Validate on blur
  const handleNameBlur = () => {
    const err = validateName(receiverName);
    setErrors((prev) => ({ ...prev, name: err }));
  };

  const handlePhoneBlur = () => {
    const err = validatePhoneNumber(receiverPhone);
    setErrors((prev) => ({ ...prev, phone: err }));
  };

  const handleEmailBlur = () => {
    const err = validateEmail(receiverEmail);
    setErrors((prev) => ({ ...prev, email: err }));
  };

  // Xử lý thay đổi điểm thưởng
  const handleUsePointsChange = (checked) => {
    setUsePoints(checked);
    if (!checked) {
      setPointsToUse(0);
      setPointsError("");
    }
  };

  const handlePointsInputChange = (value) => {
    const points = parseInt(value) || 0;
    setPointsToUse(points);

    const validation = validatePointsUsage(
      points,
      availablePoints,
      maxPointsDiscount,
      pointsToVndRate
    );
    setPointsError(validation.isValid ? "" : validation.message);
  };

  const handleUseMaxPoints = () => {
    const maxPointsNeeded = calculatePointsNeeded(maxPointsDiscount, pointsToVndRate);
    const maxUsablePoints = Math.min(availablePoints, maxPointsNeeded);
    setPointsToUse(maxUsablePoints);
    setPointsError("");
  };

  // Validate trước khi đặt hàng
  const handlePlaceOrder = async () => {
    const orderInfo = {
      receiverName,
      receiverPhone,
      receiverEmail,
      deliveryAddress,
      selectedDistrictId,
      selectedWardId,
      deliveryType,
      checkoutItems,
    };

    const validation = validateOrderInfo(orderInfo);
    setErrors(validation.errors);

    if (!validation.isValid) {
      toast.warn(validation.message);
      return;
    }

    if (user && user.hasOrdered) {
      setShowPaymentModal(true);
      return;
    }

    setShowPaymentModal(true);
    setSelectedPayment("MOMO");
  };

  // Xử lý submit đơn hàng
  const submitOrder = async (paymentMethod) => {
    try {
      setIsPlacingOrder(true);

      const orderData = {
        user,
        receiverName,
        receiverPhone,
        receiverEmail,
        deliveryAddress,
        selectedDistrictId,
        selectedWardId,
        deliveryType,
        paymentMethod,
        checkoutItems,
        effectiveDeliveryFee, // Gửi phí giao hàng đã tính khuyến mãi nếu có
        totalFoodPrice, // Gửi tổng tiền món ăn chưa giảm giá
        discountAmount: usePoints ? pointsDiscount : 0, // Số tiền giảm từ điểm thưởng
        couponCode: couponCode || undefined, // Mã coupon
        totalPrice: finalTotalPrice, // Tổng tiền cuối cùng sau tất cả giảm giá
      };

      const result = await handleOrderSubmission(orderData, navigate);

      if (!result.success) {
        // Xử lý lỗi dựa trên errorCode nếu có
        if (result.errorCode) {
          const mappedError = mapOrderError(result.errorCode);

          // Set lỗi cụ thể cho từng field
          if (mappedError.coupon) {
            setCouponError(mappedError.coupon);
          }
          if (mappedError.points) {
            setPointsError(mappedError.points);
          }
        } else {
          // Fallback cho lỗi không có errorCode (để tương thích với code cũ)
          if (result.error && result.error.toLowerCase().includes("coupon")) {
            setCouponError(result.error);
          }
        }
        return;
      }

      if (!result.hasPaymentUrl) {
        toast.success("Đặt hàng thành công!");
        if (user?.id) {
          dispatch(fetchUserPoints());
        }
      }
    } catch (err) {
      console.error("Order submission error:", err);
      // Lỗi đã được xử lý trong handleOrderSubmission, chỉ cần log ở đây
      toast.error("Có lỗi không mong muốn xảy ra!");
    } finally {
      setIsPlacingOrder(false);
      setShowPaymentModal(false);
    }
  };

  if (!checkoutItems || checkoutItems.length === 0) {
    return (
      <GlassPageWrapper className="max-w-2xl">
        <h2 className="text-sm md:text-base font-bold mb-4">Không có món nào để thanh toán!</h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm md:text-base"
          onClick={() => navigate("/mon-an")}>
          Quay lại thực đơn
        </button>
      </GlassPageWrapper>
    );
  }

  return (
    <div className="wrap-page" style={{ position: "relative", overflow: "hidden" }}>
      {/* Blob background elements */}
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />
      <div className="bg-blob bg-blob-4" />
      <div className="bg-blob bg-blob-5" />
      <div className="bg-blob bg-blob-6" />

      <div className="cart-wrap mx-auto mt-10 md:mt-20 p-2 sm:p-6">
        <div className="flex flex-col md:flex-row gap-10 md:gap-12">
          {/* Sản phẩm */}
          <div className="glass-box md:w-1/2 bg-white p-6 mb-6 md:mb-0">
            <h2 className="font-semibold mb-5 text-green-700 tracking-wide text-sm md:text-base text-center">
              Sản phẩm
            </h2>
            <div className="relative">
              <ul className="divide-y divide-gray-200 mb-0">
                {displayedItems.map((item) => (
                  <li
                    key={`${item.foodId}-${item.variantId}`}
                    className="flex items-start gap-4 md:gap-6 py-4 border-b last:border-b-0">
                    <img
                      src={item.imageUrl}
                      alt={item.foodName}
                      className="w-24 h-24 object-cover rounded-lg border flex-shrink-0 mt-1"
                    />
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="font-semibold truncate text-sm md:text-base mb-1">
                        {item.foodName}
                      </div>
                      {item.variant && (
                        <div className="text-gray-500 text-sm md:text-base mb-1 leading-tight">
                          {item.variant}
                        </div>
                      )}
                      <div className="text-gray-600 text-sm md:text-base leading-tight">
                        Số lượng: {item.quantity}
                      </div>
                    </div>
                    <div className="text-green-700 font-bold min-w-[70px] sm:min-w-[90px] text-right text-sm md:text-base pl-2 mt-1">
                      {item.price.toLocaleString()}₫
                    </div>
                  </li>
                ))}
              </ul>

              {/* Hiệu ứng rèm kéo cho items ẩn */}
              {hasMoreItems && (
                <div
                  className={`transition-all duration-500 overflow-hidden ${
                    showAllItems ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                  style={{ willChange: "max-height, opacity" }}>
                  <ul className="divide-y divide-gray-200 border-t">
                    {checkoutItems.slice(ITEMS_TO_SHOW).map((item) => (
                      <li
                        key={`${item.foodId}-${item.variantId}`}
                        className="flex items-start gap-4 md:gap-6 py-4 border-b last:border-b-0">
                        <img
                          src={item.imageUrl}
                          alt={item.foodName}
                          className="w-24 h-24 object-cover rounded-lg border flex-shrink-0 mt-1"
                        />
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <div className="font-semibold truncate text-sm md:text-base mb-1">
                            {item.foodName}
                          </div>
                          {item.variant && (
                            <div className="text-gray-500 text-sm md:text-base mb-1 leading-tight">
                              {item.variant}
                            </div>
                          )}
                          <div className="text-gray-600 text-sm md:text-base leading-tight">
                            Số lượng: {item.quantity}
                          </div>
                        </div>
                        <div className="text-green-700 font-bold min-w-[70px] sm:min-w-[90px] text-right text-sm md:text-base pl-2 mt-1">
                          {item.price.toLocaleString()}₫
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lớp phủ gradient mờ */}
              {hasMoreItems && !showAllItems && (
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none z-10"></div>
              )}
            </div>

            {/* Nút xem tất cả / thu gọn */}
            {hasMoreItems && (
              <ReadMoreButton
                isExpanded={showAllItems}
                onToggle={() => setShowAllItems(!showAllItems)}
                expandText="Xem thêm"
                collapseText="Thu gọn"
                showItemCount={false}
                itemCount={hiddenItemsCount}
              />
            )}
          </div>

          {/* Thông tin thanh toán */}
          <div className="glass-box md:w-1/2 bg-white p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-semibold mb-5 text-green-700 tracking-wide text-sm md:text-base text-center">
                Thông tin nhận hàng
              </h2>
              <p className="text-[12px] text-red-500 mb-4 font-semibold text-center">
                Lưu ý: Nhân viên sẽ liên hệ để xác nhận đơn hàng
              </p>
              {/* Checkbox sử dụng thông tin đã lưu */}
              {user && (
                <label className="flex items-center gap-2 mb-3 text-sm md:text-base select-none ">
                  <input
                    type="checkbox"
                    checked={useSavedInfo}
                    onChange={(e) => setUseSavedInfo(e.target.checked)}
                    className="accent-green-600 w-6 h-6 rounded border-gray-300 focus:ring-2 focus:ring-green-400 transition-all duration-150"
                  />
                  <span>Dùng thông tin cá nhân đã lưu</span>
                </label>
              )}
              {/* Khung 1: Chọn hình thức nhận hàng */}
              <div className="mb-4 border border-gray-400 rounded-lg px-5 py-4 bg-white shadow-md">
                <h3 className="font-semibold text-sm md:text-base mb-3 text-gray-700">
                  Chọn hình thức nhận hàng
                </h3>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm md:text-base">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="DELIVERY"
                      checked={deliveryType === "DELIVERY"}
                      onChange={() => setDeliveryType("DELIVERY")}
                      className="accent-green-600 w-6 h-6"
                    />
                    <span>Giao tận nơi</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm md:text-base">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="TAKE_AWAY"
                      checked={deliveryType === "TAKE_AWAY"}
                      onChange={() => setDeliveryType("TAKE_AWAY")}
                      className="accent-green-600 w-6 h-6"
                    />
                    <span>Nhận tại quán</span>
                  </label>
                </div>
              </div>

              {/* Khung 2: Thông tin người nhận */}
              <div className="mb-4 border border-gray-400 rounded-lg px-5 py-4 bg-white shadow-md">
                <h3 className="font-semibold text-sm md:text-base mb-3 text-gray-700">
                  Thông tin người nhận
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="Tên người nhận"
                    className={`border border-gray-300 rounded-lg px-4 py-4 text-sm md:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder:text-gray-400 placeholder:font-normal shadow-sm ${
                      errors.name ? "border-red-500" : ""
                    }`}
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    onBlur={handleNameBlur}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}

                  <input
                    type="text"
                    placeholder="Số điện thoại"
                    className={`border border-gray-300 rounded-lg px-4 py-4 text-sm md:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder:text-gray-400 placeholder:font-normal shadow-sm ${
                      errors.phone ? "border-red-500" : ""
                    }`}
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    onBlur={handlePhoneBlur}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}

                  <input
                    type="email"
                    placeholder="Email nhận thông báo"
                    className={`border border-gray-300 rounded-lg px-4 py-4 text-sm md:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder:text-gray-400 placeholder:font-normal shadow-sm ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                    onBlur={handleEmailBlur}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}

                  {/* Địa chỉ giao hàng - chỉ hiện khi chọn giao tận nơi */}
                  <div
                    className={`transition-all duration-500 overflow-hidden flex flex-col gap-4 ${
                      deliveryType === "DELIVERY"
                        ? "max-h-[1000px] opacity-100 mt-0"
                        : "max-h-0 opacity-0 -mt-4 pointer-events-none"
                    }`}
                    style={{ willChange: "max-height, opacity, margin-top" }}>
                    <select
                      className="border border-gray-300 rounded-lg px-4 py-4 text-sm md:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder:text-gray-400 placeholder:font-normal text-gray-700 shadow-sm appearance-none"
                      value={selectedDistrictId}
                      onChange={(e) => setSelectedDistrictId(e.target.value)}>
                      <option value="" className="text-gray-400 text-sm md:text-base">
                        -- Chọn quận/huyện --
                      </option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>

                    <select
                      className="border border-gray-300 rounded-lg px-4 py-4 text-sm md:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder:text-gray-400 placeholder:font-normal text-gray-700 shadow-sm appearance-none"
                      value={selectedWardId}
                      onChange={(e) => setSelectedWardId(e.target.value)}
                      disabled={!selectedDistrictId}>
                      <option value="" className="text-gray-400 text-sm md:text-base">
                        -- Chọn phường/xã --
                      </option>
                      {wards.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Địa chỉ cụ thể (Số nhà, tên đường...)"
                      className="border border-gray-300 rounded-lg px-4 py-4 text-sm md:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder:text-gray-400 placeholder:font-normal shadow-sm"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Khung 3: Sử dụng coupon */}
            {user && (
              <div className="mb-4 border border-gray-400 rounded-lg px-5 py-4 bg-white shadow-md">
                <h3 className="font-semibold text-sm md:text-base mb-3 text-gray-700">Mã Coupon</h3>

                {/* Danh sách coupon của user */}
                {userCoupons.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-500 mb-2">Chọn mã có sẵn:</p>
                    <div className="flex flex-wrap gap-2">
                      {userCoupons.map((coupon) => (
                        <button
                          key={coupon.id}
                          type="button"
                          className={`border px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-150 ${
                            selectedCouponId === coupon.id
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-white text-green-700 border-green-600 hover:bg-green-50"
                          }`}
                          onClick={() => handleSelectCoupon(coupon)}>
                          {coupon.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={handleCouponInputChange}
                    placeholder="Hoặc nhập mã...."
                    className="border border-gray-300 rounded-lg px-4 py-2 flex-1 text-sm md:text-base"
                  />
                  <button
                    type="button"
                    onClick={handleCheckCoupon}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold text-sm md:text-base flex items-center justify-center gap-2 min-w-[100px]"
                    disabled={isCheckingCoupon || !couponCode}>
                    {isCheckingCoupon ? <LoadingIcon size="16px" /> : "Áp dụng"}
                  </button>
                </div>

                {/* Hiển thị lỗi coupon từ BE hoặc API kiểm tra coupon */}
                {couponError && (
                  <p className="text-red-500 text-sm mt-1">
                    {mapOrderError(couponError)?.coupon || couponError}
                  </p>
                )}

                {/* Thông báo coupon đã áp dụng */}
                {couponDiscount > 0 && (
                  <p className="text-green-600 text-sm mt-1">
                    Đã áp dụng giảm giá: -{couponDiscount.toLocaleString()}₫
                  </p>
                )}
              </div>
            )}

            {/* Khung 4: Sử dụng điểm thưởng */}
            {user && (
              <div className="mb-4 border border-gray-400 rounded-lg px-5 py-4 bg-white shadow-md">
                <PointsUsageSection
                  user={user}
                  availablePoints={availablePoints}
                  usePoints={usePoints}
                  pointsToUse={pointsToUse}
                  pointsError={pointsError}
                  maxPointsDiscount={maxPointsDiscount}
                  pointsToVndRate={pointsToVndRate}
                  pointsDiscount={pointsDiscount}
                  onUsePointsChange={handleUsePointsChange}
                  onPointsInputChange={handlePointsInputChange}
                  onUseMaxPoints={handleUseMaxPoints}
                />
              </div>
            )}

            {/* Khung 5: Tổng tiền */}
            <div className="border border-gray-400 rounded-lg px-5 py-4 bg-white shadow-md">
              <h3 className="font-semibold text-sm md:text-base mb-3 text-gray-700">
                Tổng thanh toán
              </h3>
              <div className="flex justify-between items-center mb-2 text-sm md:text-base">
                <span className="font-bold">Tạm tính:</span>
                <span className="text-gray-700 font-semibold">
                  {totalFoodPrice.toLocaleString()}₫
                </span>
              </div>

              <div className="flex justify-between items-center mb-2 text-sm md:text-base">
                <span className="font-bold">Phí giao hàng:</span>
                <span className="text-gray-700 font-semibold">
                  {effectiveDeliveryFee === 0
                    ? "Miễn phí"
                    : `${effectiveDeliveryFee.toLocaleString()}₫`}
                </span>
              </div>

              {/* Hiệu ứng mượt mà cho dòng giảm coupon */}
              <div
                className={`transition-all duration-500 overflow-hidden ${
                  couponDiscount > 0 ? "max-h-[50px] opacity-100 mb-2" : "max-h-0 opacity-0 mb-0"
                }`}
                style={{ willChange: "max-height, opacity, margin-bottom" }}>
                <div className="flex justify-between items-center text-sm md:text-base transform transition-transform duration-300">
                  <span className="font-bold text-blue-600">Giảm coupon:</span>
                  <span className="text-blue-600 font-semibold">
                    -{couponDiscount.toLocaleString()}₫
                  </span>
                </div>
              </div>

              {/* Hiệu ứng mượt mà cho dòng giảm điểm thưởng */}
              <div
                className={`transition-all duration-500 overflow-hidden ${
                  usePoints && pointsDiscount > 0
                    ? "max-h-[50px] opacity-100 mb-2"
                    : "max-h-0 opacity-0 mb-0"
                }`}
                style={{ willChange: "max-height, opacity, margin-bottom" }}>
                <div className="flex justify-between items-center text-sm md:text-base transform transition-transform duration-300">
                  <span className="font-bold text-green-600">Giảm điểm thưởng:</span>
                  <span className="text-green-600 font-semibold">
                    -{pointsDiscount.toLocaleString()}₫
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-5">
                <span className="font-bold text-sm md:text-base">Tổng cộng:</span>
                <span
                  className={`text-green-700 font-bold text-sm md:text-base transition-all duration-300 ${
                    priceAnimated ? "transform scale-110" : "transform scale-100"
                  }`}>
                  {finalTotalPrice.toLocaleString()}₫
                </span>
              </div>

              <p className="text-[13px] text-orange-500 mb-3 font-semibold text-center">
                Miễn phí vận chuyển cho đơn từ 500.000đ trở lên!
              </p>

              <button
                className="w-full border border-green-600 text-green-700 bg-white hover:bg-green-50 py-3 rounded-lg text-sm md:text-base font-semibold mb-3 transition-all duration-200 flex items-center justify-center gap-2"
                type="button"
                onClick={() => navigate("/mon-an")}>
                <img src={shopping_cart} alt="Đặt thêm món" className="w-8 h-8 mr-2" />
                <span>Đặt thêm món</span>
              </button>

              <LoadingButton
                isLoading={isPlacingOrder}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg text-sm md:text-base font-semibold disabled:opacity-60 shadow-md transition-all duration-200"
                onClick={handlePlaceOrder}
                disabled={
                  isPlacingOrder ||
                  !isOrderInfoValid ||
                  !!errors.name ||
                  !!errors.phone ||
                  !!errors.email ||
                  !!pointsError
                }>
                Đặt hàng
              </LoadingButton>

              <PaymentMethodModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                selectedPayment={selectedPayment}
                setSelectedPayment={setSelectedPayment}
                onConfirm={submitOrder}
                isPlacingOrder={isPlacingOrder}
                user={user}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
