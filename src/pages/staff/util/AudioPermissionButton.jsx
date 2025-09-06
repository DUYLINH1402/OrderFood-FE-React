import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Speaker } from "lucide-react";
import {
  createNotificationSound,
  playNotificationSoundByType,
  isAudioSupported,
  requestAudioPermission,
} from "../../../utils/notificationSound";
import LoadingIcon from "../../../components/Skeleton/LoadingIcon";

const AudioPermissionButton = ({ onPermissionGranted }) => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioContext, setAudioContext] = useState(null);

  useEffect(() => {
    // Kiểm tra xem trình duyệt có hỗ trợ âm thanh không
    if (!isAudioSupported()) {
      console.warn("Trình duyệt không hỗ trợ âm thanh");
      return;
    }

    // Kiểm tra localStorage để xem đã cấp quyền chưa
    const audioPermissionGranted = localStorage.getItem("audioPermissionGranted") === "true";
    if (audioPermissionGranted) {
      setAudioEnabled(true);
      initAudioContext();
    } else {
      setShowPermissionPrompt(true);
    }
  }, []);

  const initAudioContext = async () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      // Resume context nếu bị suspended
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      setAudioContext(ctx);
      console.log("AudioContext initialized successfully");
    } catch (error) {
      console.error("Failed to initialize AudioContext:", error);
    }
  };

  const handleRequestPermission = async () => {
    setIsLoading(true);

    try {
      // Tạo AudioContext và test phát âm thanh
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      // Test phát âm thanh để xác nhận quyền
      await testAudioPlayback(ctx);

      setAudioContext(ctx);
      setAudioEnabled(true);
      setShowPermissionPrompt(false);

      // Lưu vào localStorage
      localStorage.setItem("audioPermissionGranted", "true");

      if (onPermissionGranted) {
        onPermissionGranted();
      }

      console.log("Audio permission granted successfully");
    } catch (error) {
      console.error("Failed to get audio permission:", error);
      alert("Không thể cấp quyền âm thanh. Vui lòng kiểm tra cài đặt trình duyệt.");
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm test phát âm thanh
  const testAudioPlayback = (ctx) => {
    return new Promise((resolve, reject) => {
      try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        oscillator.onended = () => resolve();

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);

        setTimeout(() => resolve(), 300); // Fallback timeout
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleToggleAudio = async () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    localStorage.setItem("audioPermissionGranted", newState.toString());

    if (newState && !audioContext) {
      await initAudioContext();
    }

    // Test âm thanh khi bật
    if (newState && audioContext) {
      try {
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }
        createNotificationSound();
      } catch (error) {
        console.error("Failed to play test sound:", error);
      }
    }
  };

  const handleTestSound = async () => {
    if (!audioEnabled || !audioContext) {
      alert("Vui lòng bật âm thanh trước!");
      return;
    }

    try {
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
      playNotificationSoundByType("NEW_ORDER");
    } catch (error) {
      console.error("Failed to play test sound:", error);
      alert("Không thể phát âm thanh test. Vui lòng thử lại.");
    }
  };

  if (!isAudioSupported()) {
    return null;
  }

  return (
    <>
      {/* Audio Toggle Button */}
      <div className="relative group">
        <button
          onClick={handleToggleAudio}
          className={`
            relative overflow-hidden
            p-3 rounded-xl
            transition-all duration-300 ease-in-out
            transform hover:scale-105 active:scale-95
            shadow-lg hover:shadow-xl
            border-2 backdrop-blur-sm
            ${
              audioEnabled
                ? "bg-gradient-to-r from-emerald-400 to-emerald-600 border-emerald-300 text-white shadow-emerald-200"
                : "bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300 text-gray-500 hover:from-gray-200 hover:to-gray-300"
            }
          `}
          title={audioEnabled ? "Âm thanh thông báo: BẬT" : "Âm thanh thông báo: TẮT"}>
          {/* Animated background effect */}
          <div
            className={`
            absolute inset-0 
            transition-opacity duration-300
            ${audioEnabled ? "opacity-20" : "opacity-0"}
          `}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 animate-pulse" />
          </div>

          {/* Icon container */}
          <div className="relative z-10 flex items-center justify-center">
            {audioEnabled ? (
              <Volume2 className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
            ) : (
              <VolumeX className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
            )}
          </div>
        </button>

        {/* Status indicator */}
        <div
          className={`
          absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white
          transition-all duration-300
          ${audioEnabled ? "bg-emerald-500 shadow-lg shadow-emerald-300" : "bg-gray-400"}
        `}>
          {audioEnabled && (
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
          )}
        </div>
      </div>

      {/* Permission Prompt Modal */}
      {showPermissionPrompt && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay with blur effect */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setShowPermissionPrompt(false)}
            />

            {/* Modal panel */}
            <div className="inline-block align-center bg-white rounded-2xl px-8 pt-8 pb-8 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* Header with icon */}
              <div className="flex flex-col items-center text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4 shadow-lg">
                  <Speaker className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">Bật âm thanh?</h3>

                <p className="text-md text-gray-600 text-center max-w-sm leading-relaxed">
                  Bật âm thanh thông báo khi có đơn hàng mới để bạn không bỏ lỡ!
                </p>
              </div>

              {/* Action buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={isLoading}
                  className={`
                    flex-1 inline-flex items-center justify-center
                    rounded-xl border border-transparent shadow-lg
                    px-6 py-3 text-base font-semibold text-white
                    bg-gradient-to-r from-blue-500 to-purple-600
                    hover:from-blue-600 hover:to-purple-700
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    transform transition-all duration-200 hover:scale-105 active:scale-95
                    disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                  `}
                  onClick={handleRequestPermission}>
                  {isLoading ? (
                    <LoadingIcon />
                  ) : (
                    <>
                      <Volume2 className="w-6 h-5 mr-2" />
                      <span className="text-md">Cho phép</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="text-md 
                    flex-1 inline-flex items-center justify-center
                    rounded-xl border-2 border-gray-200 shadow-md
                    px-6 py-3 text-base font-semibold text-gray-700
                    bg-white hover:bg-gray-50
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300
                    transform transition-all duration-200 hover:scale-105 active:scale-95
                  "
                  onClick={() => setShowPermissionPrompt(false)}>
                  <VolumeX className="w-6 h-6 mr-2" />
                  <span className="text-md">Bỏ qua</span>
                </button>
              </div>

              {/* Footer note */}
              <p className="text-md text-gray-400 text-center mt-4">
                Bạn có thể thay đổi cài đặt này bất kỳ lúc nào
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AudioPermissionButton;
