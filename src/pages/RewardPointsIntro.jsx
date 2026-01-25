import React from "react";
import LazyImage from "../components/LazyImage";

const RewardPointsIntro = () => {
  return (
    <div className="wrap-page px-8 sm:px-8" style={{ position: "relative", overflow: "hidden" }}>
      {/* Blob background elements, always at bottom, never break layout */}
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
          className="dongxanh-section-title text-3xl font-bold mb-6 text-[#fff]"
          data-aos="fade-right"
          data-aos-delay="100">
          TÍCH ĐIỂM NGAY – NHẬN QUÀ LIỀN TAY
        </h2>

        <p className="mb-4 leading-relaxed text-sm sm:text-base">
          Đồng Xanh triển khai chương trình tích điểm dành cho khách hàng thân thiết. Mỗi lần đến
          quán, bạn sẽ được cộng điểm vào tài khoản. Khi tích lũy đủ điểm, bạn có thể đổi lấy những
          phần quà hấp dẫn từ nhà hàng.
        </p>

        <p className="mb-4 leading-relaxed text-sm sm:text-base">
          Chương trình áp dụng cho tất cả khách hàng khi dùng bữa tại Đồng Xanh. Hãy tham gia ngay
          để nhận nhiều ưu đãi và quà tặng hấp dẫn!
        </p>

        <LazyImage
          src="https://bizweb.dktcdn.net/100/400/734/files/mo-i-jpeg-d77e3c16-ccc0-4a79-a0ab-2695ed39cff7.jpg?v=1735635780662"
          alt="Chương trình tích điểm Đồng Xanh"
          className="w-full object-cover rounded-2xl shadow-md mt-6 mb-6 transition-transform duration-500"
          data-aos="zoom-in"
          data-aos-delay="200"
        />

        <div className="mb-6">
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            🎁 Quà tặng hấp dẫn
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed pl-4">
            <li>Voucher giảm giá cho lần ăn kế tiếp.</li>
            <li>Quà tặng đặc biệt vào dịp sinh nhật.</li>
            <li>Ưu đãi dành riêng cho thành viên tích cực.</li>
          </ul>
        </div>

        <div>
          <h3 className="dongxanh-section-title" data-aos="fade-right" data-aos-delay="100">
            📍 Thông tin liên hệ
          </h3>
          <ul className="space-y-2 text-sm sm:text-base leading-relaxed">
            <li>
              <strong>Địa chỉ:</strong> 211 Nguyễn Văn Linh, P. Hưng Lợi, Q. Ninh Kiều, TP. Cần Thơ
            </li>
            <li>
              <strong>Hotline:</strong>{" "}
              <a href="tel:0988626600" className="text-blue-600 hover:underline">
                0988 62 66 00
              </a>
            </li>
            <li>
              <strong>Website:</strong>{" "}
              <a
                href="https://dongxanhfood.shop/"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noreferrer">
                dongxanhfood.shop
              </a>
            </li>
            <li>
              <strong>Facebook:</strong>{" "}
              <a
                href="https://www.facebook.com/dongxanh2"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noreferrer">
                facebook.com/dongxanh2
              </a>
            </li>
            <li>
              <strong>Zalo OA:</strong>{" "}
              <a
                href="https://zalo.me/1982210598080912218"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noreferrer">
                zalo.me/1982210598080912218
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RewardPointsIntro;
