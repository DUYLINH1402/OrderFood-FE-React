import React, { useEffect } from "react";
import { enableAudioAfterUserInteraction } from "../utils/notificationSound";

// Component tự động enable audio sau user interaction
const AudioEnabler = ({ children }) => {
  useEffect(() => {
    const handleUserInteraction = async () => {
      try {
        await enableAudioAfterUserInteraction();
        // console.log("Âm thanh đã được kích hoạt sau tương tác người dùng");
        // Remove listeners sau khi đã enable thành công
        ["click", "keydown", "touchstart"].forEach((event) => {
          document.removeEventListener(event, handleUserInteraction);
        });
      } catch (error) {
        console.warn("Không thể kích hoạt âm thanh:", error);
      }
    };

    // Listen for user interactions
    ["click", "keydown", "touchstart"].forEach((event) => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
    });

    // Cleanup function
    return () => {
      ["click", "keydown", "touchstart"].forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  return children;
};

export default AudioEnabler;
