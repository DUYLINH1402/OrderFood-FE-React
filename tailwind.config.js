module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      fontSize: {
        xs: "11px",
        sm: "13px", //cho Mobile
        md: "14px", //cho Tablet
        base: "16px", //cho desktop
        lg: "20px",
        xl: "24px",
      },
      spacing: {
        50: "50px",
        100: "100px",
        120: "120px",
      },
      screens: {
        tablet: "640px",
        laptop: "1024px",
        desktop: "1280px",
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "pause-marquee": "marquee 30s linear infinite paused", // không hoạt động đúng nên dùng variant
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [require("flowbite/plugin")],
  corePlugins: {
    // preflight: false, // Tắt preflight nếu không dùng hoặc cấu hình riêng
  },
};
