import React from "react";
import "../styles/Footer.scss";
import logo_da_thong_bao_bct from "../../assets/images/logo_da_thong_bao_bct.webp";
import LazyImage from "../LazyImage";
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__grid">
        {/* Cột 1: Giới thiệu */}
        <div className="footer__column">
          <h3>GIỚI THIỆU ĐỒNG XANH</h3>
          <div className="footer__underline" />
          <p>
            Quán ăn gia đình phục vụ đặc sản bánh tráng phơi sương cuốn thịt luộc, cá lóc nướng lá
            sen và các món ăn gia đình. Mang đến giá trị cho khách hàng là sứ mệnh của Đồng Xanh.
          </p>

          <h4>CHÍNH SÁCH</h4>
          <div className="footer__underline" />
          <p>
            Chính sách bảo mật | Chính sách vận chuyển | Chính sách đổi trả | Chính sách kiểm hàng |
            Chính sách thanh toán
          </p>
        </div>

        {/* Cột 2: Liên hệ */}
        <div className="footer__column">
          <h3>LIÊN HỆ</h3>
          <div className="footer__underline" />
          <p>
            <strong>BÁNH TRÁNG PHƠI SƯƠNG ĐỒNG XANH 2</strong>
          </p>
          <p>
            <strong>Đồng Xanh 2:</strong> 211 Nguyễn Văn Linh, P. Hưng Lợi, Q. Ninh Kiều, TP. Cần
            Thơ
          </p>
          <p>
            <strong>Hotline:</strong> 0988 62 66 00
          </p>
          <p>
            <strong>Bánh Xèo Đồng Xanh:</strong> 84B Nguyễn Văn Cừ ND, P. An Bình, Q. Ninh Kiều, TP.
            Cần Thơ
          </p>
          <p>
            <strong>Hotline:</strong> 0345 39 39 84
          </p>
          <p>
            <strong>Email:</strong> btpsdongxanh@gmail.com
          </p>
          <p>
            GPDKKD Số: 57A8021320 DO ỦY BAN NHÂN DÂN QUẬN NINH KIỀU, PHÒNG TÀI CHÍNH - KẾ HOẠCH CẤP
            NGÀY 20/07/2015.
          </p>
        </div>

        {/* Cột 3: Bản đồ */}
        <div className="footer__column">
          <h3>VỀ CHÚNG TÔI</h3>
          <div className="footer__underline" />
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1193.696337608576!2d105.76559374143736!3d10.020792654670593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a08983583fc09f%3A0x460340dec950dd35!2zxJDhu5JORyBYQU5IIDI!5e1!3m2!1sen!2sus!4v1744203973970!5m2!1sen!2sus"
            width="100%"
            height="180"
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          />
          <LazyImage
            src={logo_da_thong_bao_bct}
            alt="Bộ Công Thương"
            className="footer__certification"
            width={150}
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
