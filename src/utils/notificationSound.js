// Utility functions cho âm thanh thông báo

let globalAudioContext = null;
let userInteractionDetected = false;

// Đánh dấu khi có user interaction
const markUserInteraction = () => {
  userInteractionDetected = true;
};

// Listen for user interactions để enable audio
if (typeof window !== "undefined") {
  ["click", "keydown", "touchstart"].forEach((event) => {
    document.addEventListener(event, markUserInteraction, { once: true, passive: true });
  });
}

// Khởi tạo AudioContext global - chỉ khi có user interaction
const getAudioContext = () => {
  // Kiểm tra xem có user interaction chưa
  if (!userInteractionDetected) {
    return null;
  }

  if (!globalAudioContext) {
    try {
      globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.error("Cannot create AudioContext:", error);
      return null;
    }
  }

  // Resume context nếu bị suspended
  if (globalAudioContext.state === "suspended") {
    globalAudioContext.resume().catch((err) => {
      console.error("Cannot resume AudioContext:", err);
    });
  }

  return globalAudioContext;
};

// Tạo âm thanh chuông bằng Web Audio API
export const createNotificationSound = async () => {
  try {
    // Đảm bảo có user interaction
    if (!userInteractionDetected) {
      console.warn("Cannot play sound: User interaction required first");
      return false;
    }

    const audioContext = getAudioContext();
    if (!audioContext) {
      console.warn("AudioContext not available");
      return false;
    }

    // Đảm bảo AudioContext đã resume
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    console.log("Playing notification sound...");

    // Tạo âm thanh chuông có melody đẹp
    const playTone = (frequency, startTime, duration, volume = 0.15) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = "sine"; // Âm thanh mềm hơn
      oscillator.frequency.setValueAtTime(frequency, startTime);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // Melody của chuông (C-E-G-C) - cao hơn một chút
    const now = audioContext.currentTime;
    playTone(523.25, now, 0.2, 0.1); // C5
    playTone(659.25, now + 0.2, 0.2, 0.1); // E5
    playTone(783.99, now + 0.4, 0.2, 0.1); // G5
    playTone(1046.5, now + 0.6, 0.4, 0.12); // C6 - kéo dài hơn

    return true;
  } catch (error) {
    console.error("Cannot play notification sound:", error);
    // Fallback: sử dụng âm thanh hệ thống
    return await fallbackNotificationSound();
  }
};

// Âm thanh thay thế đơn giản
export const fallbackNotificationSound = async () => {
  try {
    if (!userInteractionDetected) {
      console.warn("Cannot play fallback sound: User interaction required first");
      return false;
    }

    const audioContext = getAudioContext();
    if (!audioContext) {
      console.warn("AudioContext not available for fallback");
      return false;
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    return true;
  } catch (error) {
    console.error("Cannot play fallback sound:", error);
    return false;
  }
};

// Âm thanh cho các loại thông báo khác nhau
export const playNotificationSoundByType = async (type) => {
  try {
    if (!userInteractionDetected) {
      console.warn("Cannot play sound by type: User interaction required first");
      return false;
    }

    const audioContext = getAudioContext();
    if (!audioContext) {
      console.warn("AudioContext not available");
      return false;
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    switch (type) {
      case "NEW_ORDER":
        // Âm thanh vui tươi cho đơn hàng mới
        return await createNotificationSound();

      case "ORDER_STATUS_UPDATE":
        // Âm thanh nhẹ nhàng cho cập nhật
        return await playSimpleBeep(audioContext, 600, 0.15);

      case "STATS_UPDATE":
        // Âm thanh rất nhẹ cho thống kê
        return await playSimpleBeep(audioContext, 400, 0.1);

      default:
        return await createNotificationSound();
    }
  } catch (error) {
    console.error("Cannot play sound by type:", error);
    return false;
  }
};

// Helper function để tạo beep đơn giản
const playSimpleBeep = async (audioContext, frequency, duration) => {
  try {
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
    return true;
  } catch (error) {
    console.error("Cannot play simple beep:", error);
    return false;
  }
};

// Check xem trình duyệt có hỗ trợ âm thanh không
export const isAudioSupported = () => {
  return !!(window.AudioContext || window.webkitAudioContext);
};

// Xin quyền phát âm thanh (cần thiết cho một số trình duyệt)
export const requestAudioPermission = async () => {
  try {
    // Đánh dấu user interaction khi gọi function này
    markUserInteraction();

    const audioContext = getAudioContext();
    if (!audioContext) {
      return false;
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    // Test phát một âm thanh nhỏ để kiểm tra quyền
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.01, audioContext.currentTime); // Âm thanh rất nhỏ
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);

    console.log("Audio permission test completed successfully");
    return true;
  } catch (error) {
    console.error("Cannot get audio permission:", error);
    return false;
  }
};

// Hàm để check audio có đang hoạt động không
export const isAudioEnabled = () => {
  const audioContext = getAudioContext();
  return audioContext && audioContext.state === "running" && userInteractionDetected;
};

// Hàm để cleanup AudioContext khi cần
export const cleanupAudio = () => {
  if (globalAudioContext) {
    globalAudioContext.close();
    globalAudioContext = null;
  }
  userInteractionDetected = false;
};

// Export thêm function để manually trigger user interaction
export const enableAudioAfterUserInteraction = () => {
  markUserInteraction();
  return requestAudioPermission();
};
