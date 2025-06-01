import React from "react";
import "../styles/SkeletonFood.scss";
export const SkeletonFood = () => {
  return (
    <div>
      <div class="loader">
        <div class="wrapper">
          <div class="circle"></div>
          <div class="line-1"></div>
          <div class="line-2"></div>
          <div class="line-3"></div>
          <div class="line-4"></div>
          <div class="line-5"></div>
          <div class="line-6"></div>
          <div class="line-7"></div>
          <div class="line-8"></div>
          <div class="line-9"></div>
          <div class="line-10"></div>
        </div>
      </div>
    </div>
  );
};
