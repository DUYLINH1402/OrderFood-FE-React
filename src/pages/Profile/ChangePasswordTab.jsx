import React, { useState } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { changePassword } from "../../services/service/userService";
import { validatePassword, validateConfirmPassword, handleFieldBlur } from "../../utils/validation";
import LoadingIcon from "../../components/Skeleton/LoadingIcon";

export default function ChangePasswordTab() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const [showPwd, setShowPwd] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const accessToken = useSelector((state) => state.auth.accessToken);

  const validate = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    const newPwdError = validatePassword(formData.newPassword);
    if (newPwdError) newErrors.newPassword = newPwdError;

    const confirmPwdError = validateConfirmPassword(formData.newPassword, formData.confirmPassword);
    if (confirmPwdError) newErrors.confirmPassword = confirmPwdError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (fieldName) => {
    let error = "";
    if (fieldName === "currentPassword") {
      error = !formData.currentPassword ? "Vui lòng nhập mật khẩu hiện tại" : "";
    } else if (fieldName === "newPassword") {
      error = validatePassword(formData.newPassword);
    } else if (fieldName === "confirmPassword") {
      error = validateConfirmPassword(formData.newPassword, formData.confirmPassword);
    }
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await changePassword(formData, accessToken);
      toast.success("Đổi mật khẩu thành công!");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch (error) {
      toast.error("Đổi mật khẩu thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-fit flex justify-center px-4 py-10 bg-gray-50">
      <div className="w-full max-w-[500px] bg-white shadow-md rounded-xl p-16 sm:p-16">
        <h1 className="md:text-lg text-base font-semibold text-center mb-6">Đổi mật khẩu</h1>

        <form onSubmit={handleSubmit} noValidate className="space-y-12">
          {/* Mật khẩu hiện tại */}
          <div className="relative input-box">
            <input
              type={showPwd.current ? "text" : "password"}
              placeholder="Mật khẩu hiện tại"
              required
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              onBlur={() => handleBlur("currentPassword")}
              className="w-full px-4 !text-sm md:!text-base py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={() => setShowPwd((prev) => ({ ...prev, current: !prev.current }))}>
              <FontAwesomeIcon icon={showPwd.current ? faEyeSlash : faEye} />
            </span>
            {errors.currentPassword && (
              <p className="absolute text-red-500 text-sm mt-2">{errors.currentPassword}</p>
            )}
          </div>

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
              <FontAwesomeIcon icon={showPwd.new ? faEyeSlash : faEye} />
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
              <FontAwesomeIcon icon={showPwd.confirm ? faEyeSlash : faEye} />
            </span>
            {errors.confirmPassword && (
              <p className=" absolute text-red-500 text-sm mt-2">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[39px] bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
            {isSubmitting ? (
              <LoadingIcon className="w-5 h-5 animate-spin" />
            ) : (
              "Xác nhận đổi mật khẩu"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
