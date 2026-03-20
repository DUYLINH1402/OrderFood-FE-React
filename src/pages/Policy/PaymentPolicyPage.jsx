import React from "react";

const PaymentPolicyPage = () => {
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
          Chính Sách Thanh Toán
        </h2>

        <p className="mb-4 leading-relaxed text-sm sm:text-base">
          Đồng Xanh hỗ trợ nhiều phương thức thanh toán linh hoạt, an toàn và tiện lợi để quý khách
          có thể lựa chọn phù hợp nhất khi đặt món trực tuyến.
        </p>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            1. Các phương thức thanh toán
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>
              <strong>Thanh toán khi nhận hàng (COD):</strong> Quý khách thanh toán bằng tiền mặt
              cho nhân viên giao hàng khi nhận đơn. Đây là phương thức phổ biến và tiện lợi nhất.
            </li>
            <li>
              <strong>Thanh toán qua ZaloPay:</strong> Thanh toán trực tuyến an toàn qua cổng thanh
              toán ZaloPay. Sau khi xác nhận đơn, bạn sẽ được chuyển đến trang thanh toán ZaloPay và
              quay lại website sau khi hoàn tất.
            </li>
            <li>
              <strong>Sử dụng điểm thưởng:</strong> Khách hàng thành viên có thể dùng điểm tích lũy
              để thanh toán một phần đơn hàng (tối đa 70% giá trị món ăn, 1 điểm = 1 VNĐ).
            </li>
            <li>
              <strong>Mã giảm giá (Coupon):</strong> Áp dụng mã giảm giá tại bước thanh toán để được
              giảm giá trực tiếp trên đơn hàng.
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            2. Quy trình thanh toán trực tuyến
          </h3>
          <div className="space-y-3 text-sm sm:text-base leading-relaxed pl-4">
            <p>
              <strong>Bước 1:</strong> Chọn món ăn và thêm vào giỏ hàng.
            </p>
            <p>
              <strong>Bước 2:</strong> Kiểm tra giỏ hàng, nhập địa chỉ giao hàng và chọn hình thức
              nhận hàng (giao tận nơi hoặc nhận tại quán).
            </p>
            <p>
              <strong>Bước 3:</strong> Áp dụng mã giảm giá hoặc điểm thưởng (nếu có).
            </p>
            <p>
              <strong>Bước 4:</strong> Chọn phương thức thanh toán (COD hoặc ZaloPay).
            </p>
            <p>
              <strong>Bước 5:</strong> Xác nhận đơn hàng. Hệ thống sẽ gửi thông báo xác nhận qua
              website và nhân viên sẽ liên hệ xác nhận qua điện thoại.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            3. Bảo mật thanh toán
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>
              Giao dịch qua ZaloPay được bảo mật theo tiêu chuẩn quốc tế, Đồng Xanh{" "}
              <strong>không lưu trữ</strong> bất kỳ thông tin thẻ thanh toán nào.
            </li>
            <li>Mọi thông tin giao dịch được mã hóa đầu cuối (end-to-end encryption).</li>
            <li>
              Hệ thống tự động xác minh trạng thái thanh toán và cập nhật đơn hàng theo thời gian
              thực.
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            4. Hoàn tiền và hủy đơn
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>
              <strong>Hủy đơn trước khi xác nhận:</strong> Đơn hàng có thể hủy miễn phí nếu chưa
              được nhân viên xác nhận.
            </li>
            <li>
              <strong>Hủy đơn đã thanh toán ZaloPay:</strong> Tiền sẽ được hoàn về tài khoản ZaloPay
              trong 3–5 ngày làm việc.
            </li>
            <li>
              <strong>Hủy đơn COD:</strong> Không phát sinh chi phí nào nếu hủy trước khi giao hàng.
            </li>
            <li>Điểm thưởng đã sử dụng sẽ được hoàn lại khi đơn hàng bị hủy thành công.</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            5. Hóa đơn
          </h3>
          <p className="leading-relaxed text-sm sm:text-base">
            Thông tin chi tiết đơn hàng và hóa đơn được hiển thị trong mục{" "}
            <strong>"Đơn hàng của tôi"</strong> trên tài khoản cá nhân. Nếu cần hóa đơn giấy, vui
            lòng yêu cầu khi đặt đơn hoặc liên hệ với nhân viên.
          </p>
        </div>

        <div>
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            📍 Liên hệ hỗ trợ thanh toán
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

export default PaymentPolicyPage;
