import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getDistricts, getWardsByDistrict } from "../../services/service/zoneService";
import { createOrder } from "../../services/service/orderService";
import LazyImage from "../../components/LazyImage";
import shopping_cart from "../../assets/icons/shopping_cart.png";
import PaymentMethodModal from "./PaymentMethodModal";
import { LoadingButton } from "../../components/Skeleton/LoadingButton";
import { validateName, validatePhoneNumber } from "../../utils/validation";
import "../../assets/styles/main.scss";
import GlassPageWrapper from "../../components/GlassPageWrapper";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);

  const checkoutItems = location.state?.checkoutItems || cartItems;
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [useSavedInfo, setUseSavedInfo] = useState(true);

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedWardId, setSelectedWardId] = useState("");

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("COD");
  const [deliveryType, setDeliveryType] = useState("DELIVERY");

  const [errors, setErrors] = useState({ name: "", phone: "" });

  const totalFoodPrice = checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  // Đơn hàng từ 500.000đ trở lên sẽ tự động miễn phí giao hàng
  const effectiveDeliveryFee = totalFoodPrice >= 500000 ? 0 : deliveryFee;
  const totalPrice = totalFoodPrice + effectiveDeliveryFee;

  useEffect(() => {
    getDistricts().then(setDistricts);
  }, []);

  useEffect(() => {
    if (selectedDistrictId) {
      const district = districts.find((d) => String(d.id) === String(selectedDistrictId));
      setDeliveryFee(district ? district.deliveryFee : 0);
      getWardsByDistrict(selectedDistrictId).then(setWards);
    } else {
      setWards([]);
      setSelectedWardId("");
      setDeliveryFee(0);
    }
  }, [selectedDistrictId, districts]);

  useEffect(() => {
    if (useSavedInfo && user) {
      setReceiverName(user.fullName || "");
      setReceiverPhone(user.phoneNumber || "");
      setDeliveryAddress(user.address || "");
    } else {
      setReceiverName("");
      setReceiverPhone("");
      setDeliveryAddress("");
    }
  }, [useSavedInfo, user]);

  // Validate on blur
  const handleNameBlur = () => {
    const err = validateName(receiverName);
    setErrors((prev) => ({ ...prev, name: err }));
  };
  const handlePhoneBlur = () => {
    const err = validatePhoneNumber(receiverPhone);
    setErrors((prev) => ({ ...prev, phone: err }));
  };

  // Validate before placing order
  const handlePlaceOrder = async () => {
    const nameErr = validateName(receiverName);
    const phoneErr = validatePhoneNumber(receiverPhone);
    setErrors({ name: nameErr, phone: phoneErr });
    if (
      nameErr ||
      phoneErr ||
      !receiverName ||
      !receiverPhone ||
      (deliveryType === "DELIVERY" && (!deliveryAddress || !selectedDistrictId || !selectedWardId))
    ) {
      toast.warn("Vui lòng điền đầy đủ và đúng thông tin người nhận và khu vực giao hàng.");
      return;
    }
    // Nếu user đã từng đặt hàng thì cho chọn phương thức (COD/MoMo/ZaloPay)
    if (user && user.hasOrdered) {
      setShowPaymentModal(true);
      return;
    }
    // Nếu chưa từng đặt thì chỉ cho chọn MoMo hoặc ZaloPay
    setShowPaymentModal(true);
    setSelectedPayment("MOMO"); // mặc định chọn MoMo
  };

  const submitOrder = async (paymentMethod) => {
    try {
      setIsPlacingOrder(true);
      const payload = {
        userId: user?.id, // chỉ truyền nếu đã đăng nhập
        receiverName,
        receiverPhone,
        deliveryAddress,
        districtId: selectedDistrictId,
        wardId: selectedWardId,
        deliveryType, // lấy từ state
        paymentMethod,
        totalPrice, // tổng tiền đã tính ở FE
        items: checkoutItems.map((item) => ({
          foodId: item.foodId,
          variantId: item.variantId, // truyền thêm variantId
          price: item.price,
          quantity: item.quantity,
        })),
      };
      console.log("Order payload:", payload);
      await createOrder(payload);
      toast.success("Đặt hàng thành công!");
      navigate("/");
    } catch (err) {
      toast.error("Đặt hàng thất bại!");
    } finally {
      setIsPlacingOrder(false);
      setShowPaymentModal(false);
    }
  };

  const isOrderInfoValid =
    receiverName &&
    receiverPhone &&
    (deliveryType === "TAKE_AWAY" || (deliveryAddress && selectedDistrictId && selectedWardId));

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
      <div className="cart-wrap max-w-7xl mx-auto mt-10 md:mt-20 p-2 sm:p-6">
        <div className="flex flex-col md:flex-row gap-10 md:gap-12">
          {/* Sản phẩm */}
          <div className="glass-box md:w-1/2 bg-white p-6 mb-6 md:mb-0">
            <h2 className="font-semibold mb-5 text-green-700 tracking-wide text-sm md:text-base text-center">
              Sản phẩm
            </h2>
            <ul className="divide-y divide-gray-200 mb-0">
              {checkoutItems.map((item) => (
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
          {/* Thông tin thanh toán */}
          <div className="glass-box md:w-1/2 bg-white p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-semibold mb-5 text-green-700 tracking-wide text-sm md:text-base text-center">
                Thông tin nhận hàng
              </h2>
              <p className="text-[12px] text-red-500 mb-4 font-semibold text-center">
                Lưu ý: Nhân viên sẽ liên hệ để xác nhận đơn hàng
              </p>
              {/* Ẩn checkbox nếu chưa đăng nhập */}
              {user && (
                <label className="flex items-center gap-2 mb-3 text-sm md:text-base select-none">
                  <input
                    type="checkbox"
                    checked={useSavedInfo}
                    onChange={(e) => setUseSavedInfo(e.target.checked)}
                    className="accent-green-600 w-6 h-6 rounded border-gray-300 focus:ring-2 focus:ring-green-400 transition-all duration-150"
                  />
                  <span>Dùng thông tin cá nhân đã lưu</span>
                </label>
              )}
              <div className="grid grid-cols-1 gap-4 mb-6">
                {/* Chọn hình thức nhận hàng */}
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
                {/* Tên và SĐT luôn hiển thị */}
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
                {/* Animation chỉ cho phần địa chỉ/quận/huyện/phường/xã */}
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
            {/* Tổng tiền */}
            <div className="border-t pt-5 mt-3">
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
              <div className="flex justify-between items-center mb-5">
                <span className="font-bold text-sm md:text-base">Tổng cộng:</span>
                <span className="text-green-700 font-bold text-sm md:text-base">
                  {totalPrice.toLocaleString()}₫
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
                disabled={isPlacingOrder || !isOrderInfoValid || !!errors.name || !!errors.phone}>
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
