module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontSize: {
        sm: "12px",
        md: "14px",
        base: "16px",
        lg: "20px",
        xl: "24px",
      },
      spacing: {
        50: "50px",
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
  plugins: [],
  corePlugins: {
    // preflight: false, // Tắt preflight nếu không dùng hoặc cấu hình riêng
  },
};
