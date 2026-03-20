import React from "react";

const PrivacyPolicyPage = () => {
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
          Chính Sách Bảo Mật
        </h2>

        <p className="mb-4 leading-relaxed text-sm sm:text-base">
          Nhà hàng Đồng Xanh cam kết bảo vệ quyền riêng tư và thông tin cá nhân của quý khách hàng.
          Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của
          bạn khi sử dụng website và dịch vụ đặt món trực tuyến của Đồng Xanh.
        </p>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            1. Thông tin chúng tôi thu thập
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>
              <strong>Thông tin cá nhân:</strong> Họ tên, số điện thoại, địa chỉ email, địa chỉ giao
              hàng khi bạn đăng ký tài khoản hoặc đặt món.
            </li>
            <li>
              <strong>Thông tin đơn hàng:</strong> Lịch sử đặt món, phương thức thanh toán, ghi chú
              đơn hàng.
            </li>
            <li>
              <strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, thiết bị truy cập
              nhằm cải thiện trải nghiệm người dùng.
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            2. Mục đích sử dụng thông tin
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>Xử lý và giao đơn hàng đúng thời gian, đúng địa chỉ.</li>
            <li>Liên hệ xác nhận đơn hàng hoặc thông báo thay đổi.</li>
            <li>Gửi thông tin khuyến mãi, ưu đãi (nếu bạn đồng ý nhận).</li>
            <li>Quản lý chương trình tích điểm thưởng và mã giảm giá.</li>
            <li>Cải thiện chất lượng dịch vụ và trải nghiệm website.</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            3. Bảo vệ thông tin
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>
              Thông tin cá nhân được mã hóa và lưu trữ trên hệ thống bảo mật cao, chỉ những nhân
              viên được ủy quyền mới có quyền truy cập.
            </li>
            <li>
              Chúng tôi không bán, trao đổi hoặc cho thuê thông tin cá nhân của bạn cho bất kỳ bên
              thứ ba nào.
            </li>
            <li>
              Thông tin thanh toán được xử lý thông qua cổng thanh toán uy tín (ZaloPay), Đồng Xanh
              không lưu trữ thông tin thẻ của bạn.
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            4. Cookie và công nghệ theo dõi
          </h3>
          <p className="mb-2 leading-relaxed text-sm sm:text-base">
            Website sử dụng cookie để ghi nhớ thông tin đăng nhập, giỏ hàng và tùy chọn cá nhân nhằm
            mang đến trải nghiệm tốt hơn. Bạn có thể tắt cookie trong cài đặt trình duyệt, tuy nhiên
            một số tính năng có thể bị hạn chế.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            5. Quyền của khách hàng
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>Yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân bất kỳ lúc nào.</li>
            <li>Từ chối nhận email/tin nhắn quảng cáo.</li>
            <li>Yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan.</li>
          </ul>
        </div>

        <div>
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            📍 Liên hệ về bảo mật
          </h3>
          <p className="leading-relaxed text-sm sm:text-base">
            Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng liên hệ:
          </p>
          <ul className="space-y-2 text-sm sm:text-base leading-relaxed mt-2">
            <li>
              <strong>Email:</strong> btpsdongxanh@gmail.com
            </li>
            <li>
              <strong>Hotline:</strong>{" "}
              <a href="tel:0988626600" className="text-blue-600 hover:underline">
                0988 62 66 00
              </a>
            </li>
            <li>
              <strong>Địa chỉ:</strong> 211 Nguyễn Văn Linh, P. Hưng Lợi, Q. Ninh Kiều, TP. Cần Thơ
            </li>
          </ul>
        </div>

        <p className="mt-6 text-sx sm:text-sm opacity-70 italic">
          Chính sách bảo mật có hiệu lực từ ngày 01/01/2025 và có thể được cập nhật theo thời gian.
          Mọi thay đổi sẽ được thông báo trên website.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
