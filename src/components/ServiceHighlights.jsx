import React from "react";
import "../assets/styles/components/ServiceHighlights.scss";
import home_icon_1 from "../assets/icons/home_icon_1.webp";
import home_icon_2 from "../assets/icons/home_icon_2.webp";
import home_icon_3 from "../assets/icons/home_icon_3.webp";
import home_icon_4 from "../assets/icons/home_icon_4.webp";

const services = [
  {
    icon: home_icon_1,
    label: "Không gian đa dạng",
  },
  {
    icon: home_icon_2,
    label: "Thực đơn phong phú",
  },
  {
    icon: home_icon_3,
    label: "Ưu đãi hấp dẫn",
  },
  {
    icon: home_icon_4,
    label: "Phục vụ tận tình",
  },
];

const ServiceHighlights = () => {
  return (
    <div className="service-highlights">
      {services.map((item, idx) => (
        <div key={idx} className="service-highlights__item">
          <img src={item.icon} alt={item.label} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default ServiceHighlights;
