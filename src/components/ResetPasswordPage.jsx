import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { validateConfirmPassword, validatePassword } from "../utils/validation";
import LoadingIcon from "./Skeleton/LoadingIcon";
import { resetPasswordApi } from "../services/auth/authApi";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  // const token = params.get("token");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState({ new: false, confirm: false });

  const [token, setToken] = useState(null);

  useEffect(() => {
    const currentParams = new URLSearchParams(window.location.search);
    const foundToken = currentParams.get("token");

    if (foundToken) {
      setToken(foundToken); // lưu vào state
      window.history.replaceState({}, document.title, "/reset-password");
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    const newPwdError = validatePassword(formData.newPassword);
    if (newPwdError) newErrors.newPassword = newPwdError;

    const confirmPwdError = validateConfirmPassword(formData.newPassword, formData.confirmPassword);
    if (confirmPwdError) newErrors.confirmPassword = confirmPwdError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (fieldName) => {
    let error = "";
    if (fieldName === "newPassword") {
      error = validatePassword(formData.newPassword);
    } else if (fieldName === "confirmPassword") {
      error = validateConfirmPassword(formData.newPassword, formData.confirmPassword);
    }
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!token) {
      toast.error("Token không hợp lệ hoặc đã hết hạn");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordApi({ token, newPassword: formData.newPassword });
      toast.success("Cập nhật mật khẩu thành công!");
      navigate("/dang-nhap");
    } catch (err) {
      toast.error("Cập nhật mật khẩu thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-fit flex justify-center px-4 py-10 mt-12">
      <div className="w-full max-w-[500px] bg-white shadow-md rounded-xl p-16 sm:p-16">
        <h1 className="md:text-lg text-base font-semibold text-center mb-6">
          Cập nhật mật khẩu mới
        </h1>

        <form onSubmit={handleSubmit} noValidate className="space-y-12">
          {/* Mật khẩu mới */}
          <div className="relative input-box">
            <input
              type={showPwd.new ? "text" : "password"}
              placeholder="Mật khẩu mới"
              required
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              onBlur={() => handleBlur("newPassword")}
              className="w-full px-4 !text-sm md:!text-base py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={() => setShowPwd((prev) => ({ ...prev, new: !prev.new }))}>
              <FontAwesomeIcon icon={showPwd.new ? faEyeSlash : faEye} size="lg" />
            </span>
            {errors.newPassword && (
              <p className="absolute text-red-500 text-sm mt-2">{errors.newPassword}</p>
            )}
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="relative input-box">
            <input
              type={showPwd.confirm ? "text" : "password"}
              placeholder="Xác nhận mật khẩu mới"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              onBlur={() => handleBlur("confirmPassword")}
              className="w-full px-4 !text-sm md:!text-base py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={() => setShowPwd((prev) => ({ ...prev, confirm: !prev.confirm }))}>
              <FontAwesomeIcon icon={showPwd.confirm ? faEyeSlash : faEye} size="lg" />
            </span>
            {errors.confirmPassword && (
              <p className="absolute text-red-500 text-sm mt-2">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[39px] bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm md:text-base">
            {isSubmitting ? (
              <LoadingIcon className="w-5 h-5 animate-spin" />
            ) : (
              "Xác nhận cập nhật mật khẩu"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
