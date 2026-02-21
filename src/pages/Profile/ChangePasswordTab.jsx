import React, { useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { changePassword } from "../../services/service/userService";
import { validatePassword, validateConfirmPassword, handleFieldBlur } from "../../utils/validation";
import LoadingIcon from "../../components/Skeleton/LoadingIcon";
import { mapAuthError } from "../../utils/authErrorMapper";
import { Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle } from "lucide-react";

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
      const errorCode = error.response?.data?.message;
      const mapped = mapAuthError("change", errorCode);
      setErrors((prev) => ({ ...prev, ...mapped }));
      toast.error(mapped.general || "Đổi mật khẩu thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Đổi mật khẩu</h2>
            <p className="text-green-100 text-sm">Cập nhật mật khẩu để bảo vệ tài khoản</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-md mx-auto">
          {errors.general && (
            <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Mật khẩu hiện tại */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-6 h-6 text-gray-400" />
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  type={showPwd.current ? "text" : "password"}
                  placeholder="Nhập mật khẩu hiện tại"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  onBlur={() => handleBlur("currentPassword")}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.currentPassword ? "border-red-400" : "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPwd((prev) => ({ ...prev, current: !prev.current }))}>
                  {showPwd.current ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="flex items-center gap-1 text-red-500 text-sx mt-1.5">
                  <AlertCircle className="w-5 h-5" />
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* Mật khẩu mới */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-6 h-6 text-gray-400" />
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPwd.new ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  onBlur={() => handleBlur("newPassword")}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.newPassword ? "border-red-400" : "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPwd((prev) => ({ ...prev, new: !prev.new }))}>
                  {showPwd.new ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="flex items-center gap-1 text-red-500 text-sx mt-1.5">
                  <AlertCircle className="w-5 h-5" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <CheckCircle className="w-6 h-6 text-gray-400" />
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPwd.confirm ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  onBlur={() => handleBlur("confirmPassword")}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.confirmPassword ? "border-red-400" : "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPwd((prev) => ({ ...prev, confirm: !prev.confirm }))}>
                  {showPwd.confirm ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="flex items-center gap-1 text-red-500 text-sx mt-1.5">
                  <AlertCircle className="w-5 h-5" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 mt-6">
              {isSubmitting ? (
                <LoadingIcon size="20px" />
              ) : (
                <>
                  <Shield className="w-6 h-6" />
                  Xác nhận đổi mật khẩu
                </>
              )}
            </button>
          </form>

          {/* Tips */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Lưu ý về mật khẩu:</h4>
            <ul className="text-sx text-gray-500 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                Mật khẩu phải có ít nhất 8 ký tự
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                Bao gồm chữ hoa, chữ thường và số
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                Không sử dụng mật khẩu dễ đoán
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
