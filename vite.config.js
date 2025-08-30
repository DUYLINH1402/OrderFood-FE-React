import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@mui/material",
      "@mui/icons-material",
      "@emotion/react",
      "@emotion/styled",
      "antd",
      "@stomp/stompjs",
      "sockjs-client",
    ],
    exclude: ["framer-motion"],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          mui: ["@mui/material", "@mui/icons-material"],
          antd: ["antd"],
          stomp: ["@stomp/stompjs", "sockjs-client"],
        },
      },
    },
  },
  define: {
    global: "globalThis",
  },
  server: {
    fs: {
      strict: false,
    },
  },
});
