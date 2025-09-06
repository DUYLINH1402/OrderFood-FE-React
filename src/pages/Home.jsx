import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import useScrollReveal from "../hooks/useScrollReveal";
import NewDishesSection from "./home/NewDishesSection";
import FeaturedDishesSection from "./home/FeaturedDishesSection";
import FavoriteDishesSection from "./home/FavoriteDishesSection";
import NewsSection from "../components/NewsSection";
import { MyComponent } from "../components/MyComponent";
import LazyImage from "../components/LazyImage";
import "../assets/styles/pages/Home.scss";
import ServiceHighlights from "../components/ServiceHighlights";
import FeedbacksGallery from "./home/FeedbacksGallery";

const Home = () => {
  const navigate = useNavigate();
  const highlightRefs = useRef([]);
  useScrollReveal(highlightRefs);
  const sectionRefs = useRef([]);
  useScrollReveal(sectionRefs);
  const setHighlightRef = (el, idx) => {
    highlightRefs.current[idx] = el;
  };
  const setSectionRef = (el, idx) => {
    sectionRefs.current[idx] = el;
  };

  // Helper tạo delay động cho hiệu ứng
  const getDelayStyle = (idx, base = 0.12) => ({ transitionDelay: `${base * idx}s` });

  return (
    <div className=" home pt-36" style={{ position: "relative", overflow: "hidden" }}>
      {/* Blob background elements */}
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />
      <div className="bg-blob bg-blob-4" />
      <div className="bg-blob bg-blob-5" />
      <div className="bg-blob bg-blob-6" />
      <section
        className="scroll-reveal home__banner--wrap"
        ref={(el) => setSectionRef(el, 0)}
        style={getDelayStyle(0, 0.08)}>
        <LazyImage
          src="https://res.cloudinary.com/ddia5yfia/image/upload/v1744204724/Home_background_rnnzmu.webp"
          alt="Baner"
          className="home__banner"
        />
      </section>
      <section
        className="scroll-reveal home__section"
        ref={(el) => setSectionRef(el, 1)}
        style={{ ...getDelayStyle(1, 0.08), maxWidth: "100%", width: "100%", margin: "0 auto" }}>
        <div style={{ maxWidth: "87%", margin: "0 auto" }} className="hidden sm:block">
          <ServiceHighlights />
        </div>
        <div className="block sm:hidden">
          <ServiceHighlights />
        </div>
      </section>

      <MyComponent />
      <section
        className="scroll-reveal home__section"
        ref={(el) => setSectionRef(el, 2)}
        style={{ ...getDelayStyle(2, 0.08), maxWidth: "100%", width: "100%", margin: "0 auto" }}>
        <div style={{ maxWidth: "87%", margin: "0 auto" }} className="hidden sm:block">
          <h2
            className="scroll-reveal home__highlight"
            ref={(el) => setHighlightRef(el, 0)}
            style={getDelayStyle(0, 0.12)}>
            Món mới
          </h2>
          <NewDishesSection />
        </div>
        <div className="block sm:hidden">
          <h2
            className="scroll-reveal home__highlight"
            ref={(el) => setHighlightRef(el, 1)}
            style={getDelayStyle(1, 0.12)}>
            Món mới
          </h2>
          <NewDishesSection />
        </div>
      </section>
      <section
        className="scroll-reveal home__section"
        ref={(el) => setSectionRef(el, 3)}
        style={{ ...getDelayStyle(3, 0.08), maxWidth: "100%", width: "100%", margin: "0 auto" }}>
        <div style={{ maxWidth: "87%", margin: "0 auto" }} className="hidden sm:block">
          <h2
            className="scroll-reveal home__highlight"
            ref={(el) => setHighlightRef(el, 2)}
            style={getDelayStyle(2, 0.12)}>
            Món ngon
          </h2>
          <FeaturedDishesSection />
        </div>
        <div className="block sm:hidden">
          <h2
            className="scroll-reveal home__highlight"
            ref={(el) => setHighlightRef(el, 3)}
            style={getDelayStyle(3, 0.12)}>
            Món ngon
          </h2>
          <FeaturedDishesSection />
        </div>
      </section>
      <section
        className="scroll-reveal home__section"
        ref={(el) => setSectionRef(el, 4)}
        style={{ ...getDelayStyle(4, 0.08), maxWidth: "100%", width: "100%", margin: "0 auto" }}>
        <div style={{ maxWidth: "87%", margin: "0 auto" }} className="hidden sm:block">
          <h2
            className="scroll-reveal home__highlight"
            ref={(el) => setHighlightRef(el, 4)}
            style={getDelayStyle(4, 0.12)}>
            Món được ưa thích nhất
          </h2>
          <FavoriteDishesSection />
        </div>
        <div className="block sm:hidden">
          <h2
            className="scroll-reveal home__highlight"
            ref={(el) => setHighlightRef(el, 5)}
            style={getDelayStyle(5, 0.12)}>
            Món được ưa thích nhất
          </h2>
          <FavoriteDishesSection />
        </div>
      </section>
      <section
        className="scroll-reveal home__section"
        ref={(el) => setSectionRef(el, 5)}
        style={{ ...getDelayStyle(5, 0.08), maxWidth: "100%", width: "100%", margin: "0 auto" }}>
        <div style={{ maxWidth: "87%", margin: "0 auto" }} className="hidden sm:block">
          <h2
            className="scroll-reveal home__highlight"
            ref={(el) => setHighlightRef(el, 6)}
            style={getDelayStyle(6, 0.12)}>
            Tin tức nội bộ và Khách hàng Đồng Xanh
          </h2>
          <NewsSection />
        </div>
        <div className="block sm:hidden">
          <h2
            className="scroll-reveal home__highlight"
            ref={(el) => setHighlightRef(el, 7)}
            style={getDelayStyle(7, 0.12)}>
            Tin tức nội bộ và Khách hàng Đồng Xanh
          </h2>
          <NewsSection />
        </div>
      </section>
      <section
        className="scroll-reveal home__section"
        ref={(el) => setSectionRef(el, 6)}
        style={{ ...getDelayStyle(6, 0.08), maxWidth: "100%", width: "100%", margin: "0 auto" }}>
        <div style={{ maxWidth: "87%", margin: "0 auto" }} className="hidden sm:block">
          <h2
            className="scroll-reveal home__highlight"
            ref={(el) => setHighlightRef(el, 8)}
            style={getDelayStyle(8, 0.12)}>
            Đánh giá khách hàng
          </h2>
          <FeedbacksGallery
            onViewMore={() => navigate("/danh-gia-khach-hang")}
            showViewMoreButton={true}
          />
        </div>
        <div className="block sm:hidden">
          <h2
            className="scroll-reveal home__highlight"
            ref={(el) => setHighlightRef(el, 9)}
            style={getDelayStyle(9, 0.12)}>
            Đánh giá khách hàng
          </h2>
          <FeedbacksGallery
            onViewMore={() => navigate("/danh-gia-khach-hang")}
            showViewMoreButton={true}
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
