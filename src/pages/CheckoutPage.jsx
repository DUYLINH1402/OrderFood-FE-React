import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);

  const checkoutItems = location.state?.checkoutItems || cartItems;
  const [shippingZones, setShippingZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [useSavedInfo, setUseSavedInfo] = useState(true);

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const totalFoodPrice = checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalPrice = totalFoodPrice + deliveryFee;

  useEffect(() => {
    axios.get("/api/shipping-zones").then((res) => {
      setShippingZones(res.data);
    });
  }, []);

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

  useEffect(() => {
    const zone = shippingZones.find((z) => z.id === Number(selectedZoneId));
    setDeliveryFee(zone ? zone.delivery_fee : 0);
  }, [selectedZoneId, shippingZones]);

  const handlePlaceOrder = async () => {
    if (!receiverName || !receiverPhone || !deliveryAddress || !selectedZoneId) {
      toast.warn("Vui lòng điền đầy đủ thông tin người nhận và khu vực giao hàng.");
      return;
    }

    try {
      setIsPlacingOrder(true);
      await axios.post("/api/orders", {
        items: checkoutItems,
        receiverName,
        receiverPhone,
        deliveryAddress,
        shippingZoneId: selectedZoneId,
        paymentMethod: "COD", // hoặc "ONLINE" nếu có tích hợp MoMo
        deliveryType: "DELIVERY",
      });
      toast.success("Đặt hàng thành công!");
      navigate("/");
    } catch (err) {
      toast.error("Đặt hàng thất bại!");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!checkoutItems || checkoutItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-6 bg-white rounded shadow text-center">
        <h2 className="text-xl font-bold mb-4">Không có món nào để thanh toán!</h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          onClick={() => navigate("/thuc-don")}>
          Quay lại thực đơn
        </button>
      </div>
    );
  }

  return (
    <div className="cart-wrap max-w-7xl mx-auto mt-10 md:mt-20 p-2 sm:p-6">
      <div className="flex flex-col md:flex-row gap-10 md:gap-12">
        {/* Sản phẩm */}
        <div className="md:w-1/2 bg-white rounded-2xl shadow-lg p-6 mb-6 md:mb-0">
          <h2 className="font-semibold mb-5 text-green-700 tracking-wide text-md md:text-base text-center">
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
                  <div className="font-semibold truncate text-md md:text-base mb-1">
                    {item.foodName}
                  </div>
                  {item.variant && (
                    <div className="text-gray-500 text-md md:text-base mb-1 leading-tight">
                      {item.variant}
                    </div>
                  )}
                  <div className="text-gray-600 text-md md:text-base leading-tight">
                    Số lượng: {item.quantity}
                  </div>
                </div>
                <div className="text-green-700 font-bold min-w-[70px] sm:min-w-[90px] text-right text-md md:text-base pl-2 mt-1">
                  {item.price.toLocaleString()}₫
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* Thông tin thanh toán */}
        <div className="md:w-1/2 bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-semibold mb-5 text-green-700 tracking-wide text-md md:text-base text-center">
              Thông tin nhận hàng
            </h2>
            <p className="text-[12px] text-red-500 mb-4 font-semibold">
              Lưu ý: Nhân viên sẽ liên hệ để xác nhận đơn hàng
            </p>
            <label className="flex items-center gap-2 mb-3 text-md md:text-base select-none">
              <input
                type="checkbox"
                checked={useSavedInfo}
                onChange={(e) => setUseSavedInfo(e.target.checked)}
                className="accent-green-600 w-6 h-6 rounded border-gray-300 focus:ring-2 focus:ring-green-400 transition-all duration-150"
              />
              <span>Dùng thông tin cá nhân đã lưu</span>
            </label>
            <div className="grid grid-cols-1 gap-4 mb-6">
              <input
                type="text"
                placeholder="Tên người nhận"
                className="border border-gray-300 rounded-lg px-4 py-4 text-md md:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder:text-gray-400 placeholder:font-normal shadow-sm"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Số điện thoại"
                className="border border-gray-300 rounded-lg px-4 py-4 text-md md:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder:text-gray-400 placeholder:font-normal shadow-sm"
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
              />
              <select
                className="border border-gray-300 rounded-lg px-4 py-4 text-md md:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder:text-gray-400 placeholder:font-normal text-gray-700 shadow-sm appearance-none"
                value={selectedZoneId || ""}
                onChange={(e) => setSelectedZoneId(e.target.value)}>
                <option value="" className="text-gray-400">
                  -- Chọn khu vực giao hàng --
                </option>
                {shippingZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} (
                    {zone.delivery_fee === 0
                      ? "Miễn phí"
                      : `${zone.delivery_fee.toLocaleString()}₫`}
                    )
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Địa chỉ cụ thể (Số nhà, tên đường...)"
                className="border border-gray-300 rounded-lg px-4 py-4 text-md md:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder:text-gray-400 placeholder:font-normal shadow-sm"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>
          </div>
          {/* Tổng tiền */}
          <div className="border-t pt-5 mt-3">
            <div className="flex justify-between items-center mb-2 text-md md:text-base">
              <span className="font-bold">Tạm tính:</span>
              <span className="text-gray-700 font-semibold">
                {totalFoodPrice.toLocaleString()}₫
              </span>
            </div>
            <div className="flex justify-between items-center mb-2 text-md md:text-base">
              <span className="font-bold">Phí giao hàng:</span>
              <span className="text-gray-700 font-semibold">
                {deliveryFee === 0 ? "Miễn phí" : `${deliveryFee.toLocaleString()}₫`}
              </span>
            </div>
            <div className="flex justify-between items-center mb-5">
              <span className="font-bold text-md md:text-base">Tổng cộng:</span>
              <span className="text-green-700 font-bold text-md md:text-base">
                {totalPrice.toLocaleString()}₫
              </span>
            </div>
            <button
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg text-md md:text-base font-semibold disabled:opacity-60 shadow-md transition-all duration-200"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}>
              {isPlacingOrder ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
