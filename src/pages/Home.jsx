import React from "react";
import NewDishesSection from "../components/NewDishesSection";
import FeaturedDishesSection from "../components/FeaturedDishesSection";
import FavoriteDishesSection from "../components/FavoriteDishesSection";
import NewsSection from "../components/NewsSection";
import CustomerReviews from "../components/CustomerReviews";
import LazyImage from "../components/LazyImage";
import "../assets/styles/pages/Home.scss";
import ServiceHighlights from "../components/ServiceHighlights";
import SkeletonSection from "../components/Skeleton/SkeletonSection";

const Home = () => {
  return (
    <div className="home">
      <section className="home__banner--wrap">
        <LazyImage
          src="https://res.cloudinary.com/ddia5yfia/image/upload/v1744204724/Home_background_rnnzmu.webp"
          alt="Baner"
          className="home__banner"
        />
      </section>
      <section className="home__section ">
        <ServiceHighlights />
      </section>
      <section className="home__section">
        <h2 className="home__highlight">Món mới</h2>
        <NewDishesSection />
        {/* <SkeletonSection /> */}
      </section>

      <section className="home__section home__section--alt">
        <h2 className="home__highlight">Món ngon</h2>
        <FeaturedDishesSection />
      </section>

      <section className="home__section">
        <h2 className="home__highlight">Món được ưa thích nhất</h2>
        <FavoriteDishesSection />
      </section>

      <section className="home__section home__section--alt">
        <h2 className="home__highlight">Tin tức nội bộ và Khách hàng Đồng Xanh</h2>
        <NewsSection />
      </section>

      <section className="home__section">
        <h2 className="home__highlight">Đánh giá khách hàng</h2>
        <CustomerReviews />
      </section>
    </div>
  );
};

export default Home;
