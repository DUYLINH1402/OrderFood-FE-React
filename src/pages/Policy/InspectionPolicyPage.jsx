import React from "react";

const InspectionPolicyPage = () => {
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
          Chính Sách Kiểm Hàng
        </h2>

        <p className="mb-4 leading-relaxed text-sm sm:text-base">
          Để đảm bảo quyền lợi cho quý khách, Đồng Xanh khuyến khích bạn kiểm tra đơn hàng ngay khi
          nhận. Chính sách kiểm hàng giúp bạn yên tâm rằng mọi đơn hàng đều đạt tiêu chuẩn chất
          lượng trước khi sử dụng.
        </p>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            1. Quyền kiểm tra khi nhận hàng
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>
              Khách hàng có quyền kiểm tra đơn hàng{" "}
              <strong>ngay trước mặt nhân viên giao hàng</strong> trước khi xác nhận nhận hàng.
            </li>
            <li>
              Kiểm tra số lượng món ăn, loại món, các phần phụ (nước chấm, rau sống, gia vị) so với
              đơn đặt hàng.
            </li>
            <li>Kiểm tra tình trạng đóng gói: hộp không bị méo, nắp đậy kín, không bị tràn đổ.</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            2. Tiêu chuẩn chất lượng đóng gói
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>Mỗi món ăn được đóng trong hộp riêng biệt, có nhãn ghi rõ tên món.</li>
            <li>Món nóng được giữ ấm bằng túi giữ nhiệt chuyên dụng.</li>
            <li>Nước chấm, gia vị được đóng trong hộp nhỏ kín, chống rò rỉ.</li>
            <li>Đơn hàng được niêm phong bằng tem Đồng Xanh để đảm bảo nguyên vẹn.</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            3. Quy trình xử lý khi phát hiện lỗi
          </h3>
          <div className="space-y-3 text-sm sm:text-base leading-relaxed pl-4">
            <p>
              <strong>Trường hợp 1 — Phát hiện lỗi khi giao hàng:</strong> Thông báo trực tiếp cho
              nhân viên giao hàng. Nhân viên sẽ ghi nhận và liên hệ quán xử lý ngay lập tức (giao bổ
              sung hoặc đổi món).
            </p>
            <p>
              <strong>Trường hợp 2 — Phát hiện lỗi sau khi nhận:</strong> Liên hệ hotline hoặc chat
              trên website trong vòng <strong>2 giờ</strong>, cung cấp mã đơn hàng và hình ảnh/video
              minh chứng để được hỗ trợ.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            4. Cam kết của Đồng Xanh
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>
              100% nguyên liệu tươi sạch, có nguồn gốc rõ ràng, rau sạch tự trồng từ vườn và núi
              Cấm.
            </li>
            <li>Chế biến theo quy trình đảm bảo vệ sinh an toàn thực phẩm.</li>
            <li>
              Mọi khiếu nại về chất lượng đều được xử lý nghiêm túc và phản hồi trong thời gian sớm
              nhất.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            📍 Liên hệ kiểm hàng
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

export default InspectionPolicyPage;
