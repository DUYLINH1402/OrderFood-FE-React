import React from "react";

const ShippingPolicyPage = () => {
  return (
    <div
      className="wrap-page pb-4 px-8 sm:px-8"
      style={{ position: "relative", overflow: "hidden" }}>
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />
      <div className="bg-blob bg-blob-4" />
      <div className="bg-blob bg-blob-5" />
      <div className="bg-blob bg-blob-6" />
      <div
        className="glass-box max-w-6xl mx-auto p-4 sm:p-10 mx-[10px] sm:mx-[30px] sm:px-6 md:px-16 text-justify"
        data-aos="fade-up"
        style={{ position: "relative", zIndex: 1, padding: "30px" }}>
        <h2
          className="text-3xl font-bold mb-6 text-[#fff] dongxanh-section-title"
          data-aos="fade-right"
          data-aos-delay="100">
          Chính Sách Vận Chuyển
        </h2>

        <p className="mb-4 leading-relaxed text-sm sm:text-base">
          Đồng Xanh cung cấp dịch vụ giao hàng tận nơi để quý khách có thể thưởng thức các món ăn
          ngon ngay tại nhà. Dưới đây là các thông tin chi tiết về chính sách vận chuyển của chúng
          tôi.
        </p>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            1. Phạm vi giao hàng
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>
              Đồng Xanh hiện phục vụ giao hàng trong khu vực <strong>TP. Cần Thơ</strong>, ưu tiên
              các quận: Ninh Kiều, Cái Răng, Bình Thủy.
            </li>
            <li>
              Đối với các quận/huyện xa hơn, phí vận chuyển sẽ được tính theo khoảng cách thực tế.
            </li>
            <li>
              Khách hàng cũng có thể chọn hình thức <strong>nhận tại quán</strong> để không mất phí
              giao hàng.
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            2. Thời gian giao hàng
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>
              <strong>Thời gian dự kiến:</strong> 30 – 60 phút tùy khoảng cách và tình hình giao
              thông.
            </li>
            <li>
              <strong>Giờ nhận đơn:</strong> Từ 9:00 sáng đến 21:00 tối hàng ngày (bao gồm cuối tuần
              và ngày lễ).
            </li>
            <li>Đơn hàng đặt ngoài giờ hoạt động sẽ được xử lý vào đầu ca làm việc tiếp theo.</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            3. Phí vận chuyển
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>
              Phí giao hàng được tính tự động dựa trên quận/huyện giao hàng khi bạn đặt đơn trên
              website.
            </li>
            <li>
              Đồng Xanh thường xuyên có chương trình <strong>miễn phí giao hàng</strong> cho đơn
              hàng đạt giá trị tối thiểu.
            </li>
            <li>Chi tiết phí vận chuyển sẽ hiển thị rõ ràng trước khi bạn xác nhận đơn hàng.</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            4. Đóng gói và bảo quản
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>
              Tất cả món ăn được đóng gói cẩn thận bằng hộp chuyên dụng, đảm bảo giữ nguyên chất
              lượng và hương vị.
            </li>
            <li>Món nóng và món nguội được đóng riêng để đảm bảo nhiệt độ phù hợp.</li>
            <li>Nước chấm, rau sống và gia vị được đóng gói riêng biệt, chống tràn đổ.</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            5. Lưu ý khi nhận hàng
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>
              Vui lòng kiểm tra đơn hàng ngay khi nhận để đảm bảo đầy đủ số lượng và đúng món.
            </li>
            <li>
              Nếu phát hiện sai sót hoặc hư hỏng, hãy liên hệ ngay với chúng tôi qua hotline để được
              hỗ trợ kịp thời.
            </li>
            <li>Vui lòng đảm bảo số điện thoại liên lạc chính xác để shipper dễ dàng liên hệ.</li>
          </ul>
        </div>

        <div>
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            📍 Liên hệ hỗ trợ giao hàng
          </h3>
          <ul className="space-y-2 text-sm sm:text-base leading-relaxed">
            <li>
              <strong>Hotline:</strong>{" "}
              <a href="tel:0988626600" className="text-blue-600 hover:underline">
                0988 62 66 00
              </a>
            </li>
            <li>
              <strong>Email:</strong> btpsdongxanh@gmail.com
            </li>
            <li>
              <strong>Địa chỉ:</strong> 211 Nguyễn Văn Linh, P. Hưng Lợi, Q. Ninh Kiều, TP. Cần Thơ
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;
