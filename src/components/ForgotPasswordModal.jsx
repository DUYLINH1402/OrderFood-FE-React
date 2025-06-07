import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { validateEmail } from "../utils/validation";
import LoadingIcon from "./Skeleton/LoadingIcon";
import { sendForgotPasswordEmailApi } from "../services/auth/authApi";
import { mapAuthError } from "../utils/authErrorMapper";

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);

  const handleBlur = () => {
    const err = validateEmail(email);
    setError(err);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    setError(err);
    if (err) return;

    setIsSubmitting(true);
    try {
      await sendForgotPasswordEmailApi(email);
      toast.success("Vui lòng kiểm tra email để đặt lại mật khẩu!");
      setEmail("");
      setError("");
      onClose();
    } catch (error) {
      const errorCode = error?.response?.data?.message;
      const mappedError = mapAuthError("forgot", errorCode);

      if (mappedError.email) {
        setError(mappedError.email);
      } else {
        toast.error(mappedError.general || "Không thể gửi yêu cầu.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Đóng modal khi bấm nền đen
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Ẩn body scroll khi mở modal
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-300 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onMouseDown={handleBackdropClick}>
      <div
        ref={modalRef}
        className={`w-full md:max-w-[450px] max-w-[330px] bg-white shadow-lg rounded-xl p-10 sm:p-10 md:p-16 relative transform transition-transform duration-300 ${
          isOpen ? "scale-100" : "scale-95"
        }`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-gray-500 hover:text-gray-700 text-xl font-bold">
          ×
        </button>

        <h1 className="text-base md:text-lg font-semibold text-center mb-2">Quên mật khẩu</h1>
        <p className="text-sm md:text-base text-gray-600 text-center mb-6">
          Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu qua email bạn đăng ký.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-12">
          <div className="relative input-box">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleBlur}
              className="w-full px-4 !text-sm md:!text-base py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="absolute text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[39px] bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm md:text-base">
            {isSubmitting ? <LoadingIcon className="w-5 h-5 animate-spin" /> : "Gửi yêu cầu"}
          </button>
        </form>
      </div>
    </div>
  );
}
