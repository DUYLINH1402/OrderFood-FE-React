import React from "react";

/**
 * RestaurantInfoSkeleton - Skeleton loading cho phần thông tin nhà hàng
 */
const RestaurantInfoSkeleton = () => {
  return (
    <div className="glass-box p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          {/* Left: Image Gallery Skeleton */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gray-200 rounded-2xl animate-pulse"></div>
            {/* Gallery thumbnails */}
            <div className="flex gap-2 mt-3 justify-center">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Right: Info Skeleton */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Logo & Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 p-3 bg-gray-100 rounded-xl animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="h-12 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-12 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantInfoSkeleton;
