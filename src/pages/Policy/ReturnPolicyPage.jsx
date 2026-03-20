import React from "react";

const ReturnPolicyPage = () => {
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
          Chính Sách Đổi Trả
        </h2>

        <p className="mb-4 leading-relaxed text-sm sm:text-base">
          Đồng Xanh luôn đặt sự hài lòng của khách hàng lên hàng đầu. Trong trường hợp đơn hàng
          không đúng yêu cầu hoặc có vấn đề về chất lượng, chúng tôi sẵn sàng hỗ trợ đổi trả theo
          các điều kiện dưới đây.
        </p>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            1. Các trường hợp được đổi trả
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>Món ăn bị giao sai so với đơn đặt hàng (sai món, sai số lượng).</li>
            <li>Món ăn bị hư hỏng, biến chất hoặc không đảm bảo vệ sinh an toàn thực phẩm.</li>
            <li>Thiếu món trong đơn hàng so với hóa đơn/xác nhận đơn.</li>
            <li>
              Chất lượng món ăn không đạt tiêu chuẩn (nguội lạnh bất thường, mùi vị khác thường).
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            2. Các trường hợp không áp dụng đổi trả
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>Khách hàng thay đổi ý kiến sau khi đã nhận và sử dụng món ăn.</li>
            <li>Đơn hàng đã quá 2 giờ kể từ khi giao thành công mà không có phản hồi.</li>
            <li>Món ăn bị hư hỏng do lỗi bảo quản từ phía khách hàng.</li>
            <li>Yêu cầu đổi trả không có bằng chứng (hình ảnh, video) kèm theo.</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            3. Quy trình đổi trả
          </h3>
          <div className="space-y-3 text-sm sm:text-base leading-relaxed pl-4">
            <p>
              <strong>Bước 1:</strong> Liên hệ với Đồng Xanh qua hotline{" "}
              <a href="tel:0988626600" className="text-blue-600 hover:underline">
                0988 62 66 00
              </a>{" "}
              hoặc chat trực tiếp trên website trong vòng <strong>2 giờ</strong> sau khi nhận hàng.
            </p>
            <p>
              <strong>Bước 2:</strong> Cung cấp mã đơn hàng, mô tả vấn đề và gửi kèm hình ảnh/video
              minh chứng.
            </p>
            <p>
              <strong>Bước 3:</strong> Nhân viên Đồng Xanh sẽ xác minh và phản hồi trong vòng{" "}
              <strong>30 phút</strong>.
            </p>
            <p>
              <strong>Bước 4:</strong> Sau khi xác nhận, chúng tôi sẽ giao lại món đúng hoặc hoàn
              tiền theo yêu cầu.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            4. Hình thức hoàn tiền
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>
              <strong>Thanh toán qua ZaloPay:</strong> Hoàn tiền về tài khoản ZaloPay trong 3–5 ngày
              làm việc.
            </li>
            <li>
              <strong>Thanh toán khi nhận hàng (COD):</strong> Hoàn tiền bằng điểm thưởng vào tài
              khoản hoặc chuyển khoản ngân hàng theo yêu cầu.
            </li>
            <li>
              Trong một số trường hợp, Đồng Xanh có thể cấp mã giảm giá bù cho đơn hàng tiếp theo.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            📍 Liên hệ đổi trả
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

export default ReturnPolicyPage;
