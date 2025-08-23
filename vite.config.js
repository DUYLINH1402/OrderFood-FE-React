import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    // Fix for SockJS/STOMP global variable issue
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["@stomp/stompjs", "sockjs-client"],
  },
});
