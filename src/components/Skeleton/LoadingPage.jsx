import React from "react";
import "../styles/LoadingPage.scss";

export default function LoadingPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#ffffff]">
      <div class="pl">
        <div class="pl__dot"></div>
        <div class="pl__dot"></div>
        <div class="pl__dot"></div>
        <div class="pl__dot"></div>
        <div class="pl__dot"></div>
        <div class="pl__dot"></div>
        <div class="pl__dot"></div>
        <div class="pl__dot"></div>
        <div class="pl__dot"></div>
        <div class="pl__dot"></div>
        <div class="pl__dot"></div>
        <div class="pl__dot"></div>
        <div class="pl__text">Loading…</div>
      </div>
    </div>
  );
}
