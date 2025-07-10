import React from "react";
import { Link } from "react-router-dom";

const Error404Page = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://res.cloudinary.com/ddia5yfia/image/upload/v1744204724/Home_background_rnnzmu.webp')",
        }}></div>

      {/* Overlay mờ */}
      <div className="absolute inset-0 bg-black bg-opacity-65"></div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Animated 404 Text */}
          <div className="mb-8 animate-bounce">
            <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-2xl">
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Trang không tồn tại!
            </h2>

            <p className="text-lg text-gray-200 mb-8 leading-relaxed">
              Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển. Hãy quay về
              trang chủ để khám phá những món ăn ngon tại Đồng Xanh.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/"
                className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-full hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <span className="mr-2">🏠</span>
                Về trang chủ
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Link>

              <Link
                to="/mon-an"
                className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-full hover:from-orange-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <span className="mr-2">🍽️</span>
                Xem món ăn
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error404Page;
