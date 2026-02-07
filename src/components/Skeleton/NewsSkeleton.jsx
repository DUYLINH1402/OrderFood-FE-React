import React from "react";

/**
 * NewsSkeleton - Skeleton loading cho phần tin tức
 */
const NewsSkeleton = () => {
  return (
    <div className="glass-box p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Featured skeleton */}
          <div className="lg:col-span-7">
            <div className="bg-gray-200 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-[280px] sm:h-[320px] lg:h-[380px] bg-gray-300"></div>
            </div>
          </div>

          {/* List skeleton */}
          <div className="lg:col-span-5">
            <div className="flex flex-col gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex gap-4 bg-white rounded-xl p-3 sm:p-4 animate-pulse">
                  <div className="flex-shrink-0 w-28 h-28 sm:w-36 sm:h-36 bg-gray-200 rounded-lg"></div>
                  <div className="flex flex-col justify-between flex-1 py-1">
                    <div className="w-20 h-5 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-12 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Button skeleton */}
        <div className="text-center mt-6 sm:mt-8">
          <div className="inline-block w-44 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * NewsPageSkeleton - Skeleton loading cho trang danh sách tin tức
 */
export const NewsPageSkeleton = () => {
  return (
    <div className="max-w-[1200px] mx-auto px-4">
      {/* Categories skeleton */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="flex-shrink-0 w-24 h-9 bg-gray-200 rounded-full animate-pulse"></div>
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="bg-white rounded-xl overflow-hidden animate-pulse">
            <div className="h-44 sm:h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * NewsDetailSkeleton - Skeleton loading cho trang chi tiết bài viết
 */
export const NewsDetailSkeleton = () => {
  return (
    <div className="max-w-[900px] mx-auto px-4">
      {/* Breadcrumb skeleton */}
      <div className="flex gap-2 mb-6">
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Title skeleton */}
      <div className="h-8 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>

      {/* Meta skeleton */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Thumbnail skeleton */}
      <div className="h-[300px] sm:h-[400px] bg-gray-200 rounded-xl mb-6 animate-pulse"></div>

      {/* Content skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div
            key={item}
            className="h-4 bg-gray-200 rounded animate-pulse"
            style={{ width: `${Math.random() * 30 + 70}%` }}></div>
        ))}
      </div>
    </div>
  );
};

export default NewsSkeleton;
