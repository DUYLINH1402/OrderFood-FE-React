import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../store/slices/authSlice";
import { toast } from "react-toastify";
import { validatePhoneNumber } from "../../utils/validation";
import { getProfile, updateProfile, uploadAvatar } from "../../services/service/userService";
import LoadingIcon from "../../components/Skeleton/LoadingIcon";
import user_avatar from "../../assets/icons/user_avatar.png";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Edit3,
  Save,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Shield,
  AlertCircle,
} from "lucide-react";

export const ProfileTab = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    avatarUrl: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(user_avatar);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await getProfile();
        dispatch(setUser(userData));
        setFormData({
          fullName: userData.fullName || "",
          phoneNumber: userData.phoneNumber || "",
          address: userData.address || "",
          avatarUrl: userData.avatarUrl || "",
        });
        setAvatarPreview(userData.avatarUrl || user_avatar);
      } catch (err) {
        setError(err.message);
      }
    };

    if (!user) {
      fetchProfile();
    } else {
      setFormData({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        avatarUrl: user.avatarUrl || "",
      });
      setAvatarPreview(user.avatarUrl || user_avatar);
    }
  }, [user, dispatch]);

  const formatDate = (isoDate) => {
    if (!isoDate) return "Chưa chỉnh sửa lần nào";
    const date = new Date(isoDate);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSave = async () => {
    const phoneErr = validatePhoneNumber(formData.phoneNumber);
    if (phoneErr) {
      setPhoneError(phoneErr);
      return;
    }

    try {
      setIsSaving(true);
      const updatedUser = await updateProfile(formData);
      dispatch(setUser(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch (err) {
      toast.error(`Cập nhật thất bại: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };
  const handleCancelAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(user.avatarUrl || user_avatar);
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    try {
      setIsUploadingAvatar(true);

      // Gọi BE upload ảnh
      const imageUrl = await uploadAvatar(avatarFile);

      // Cập nhật form và Redux với URL thật từ S3
      const updated = { ...formData, avatarUrl: imageUrl };
      setFormData(updated);
      dispatch(setUser({ ...user, avatarUrl: imageUrl }));
      localStorage.setItem("user", JSON.stringify({ ...user, avatarUrl: imageUrl }));

      toast.success("Cập nhật ảnh đại diện thành công!");
      setAvatarFile(null);
      fileInputRef.current.value = ""; // reset input file
    } catch (err) {
      console.error("Upload avatar error:", err);
      toast.error("Lỗi khi cập nhật ảnh đại diện");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <p className="text-red-600">Lỗi: {error}</p>
      </div>
    );

  if (!user)
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <LoadingIcon size="24px" />
          <span>Đang tải thông tin...</span>
        </div>
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Thông tin cá nhân</h2>
            <p className="text-green-100 text-sm">Quản lý thông tin hồ sơ của bạn</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* KHU ẢNH ĐẠI DIỆN */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center">
              <div className="relative group">
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <label
                  htmlFor="user_avatar"
                  className="absolute bottom-2 right-2 p-2.5 bg-green-600 rounded-full cursor-pointer hover:bg-green-700 transition-all duration-200 shadow-lg hover:scale-105">
                  <Camera className="w-6 h-6 text-white" />
                </label>
                <input
                  id="user_avatar"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <div className="mt-4 text-center">
                <h3 className="font-semibold text-gray-800 text-lg">
                  {user.fullName || user.username}
                </h3>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>

              {avatarFile && (
                <div className="flex gap-2 mt-4 w-full">
                  <button
                    onClick={handleUploadAvatar}
                    disabled={isUploadingAvatar}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-70">
                    {isUploadingAvatar ? (
                      <LoadingIcon size="16px" />
                    ) : (
                      <>
                        <Save className="w-6 h-6" />
                        Lưu ảnh
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelAvatar}
                    className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-200">
                    <X className="w-6 h-6" />
                    Huỷ
                  </button>
                </div>
              )}

              {/* Thông tin trạng thái */}
              <div className="mt-6 w-full space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="w-6 h-6" />
                    <span className="text-sm">Trạng thái</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${
                      user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                    {user.active ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    {user.active ? "Hoạt động" : "Bị khóa"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-6 h-6" />
                    <span className="text-sm">Email</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${
                      user.verified
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                    {user.verified ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    {user.verified ? "Đã xác minh" : "Chưa xác minh"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="w-6 h-6" />
                    <span className="text-sm">Điểm tích lũy</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                    {user.point || 0} điểm
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FORM THÔNG TIN */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Chi tiết thông tin</h3>
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200">
                    <Edit3 className="w-6 h-6" />
                    Chỉnh sửa
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-70">
                      {isSaving ? (
                        <LoadingIcon size="16px" />
                      ) : (
                        <>
                          <Save className="w-6 h-6" />
                          Lưu
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          fullName: user.fullName || "",
                          phoneNumber: user.phoneNumber || "",
                          address: user.address || "",
                          avatarUrl: user.avatarUrl || "",
                        });
                        setPhoneError("");
                      }}
                      className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200">
                      <X className="w-6 h-6" />
                      Huỷ
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Username */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-6 h-6 text-gray-400" />
                    Username
                  </label>
                  <input
                    type="text"
                    value={user.username}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Họ tên */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-6 h-6 text-gray-400" />
                    Họ tên
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    readOnly={!isEditing}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200 ${
                      isEditing
                        ? "border-green-300 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                    placeholder="Nhập họ tên của bạn"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-6 h-6 text-gray-400" />
                    Email
                  </label>
                  <input
                    type="text"
                    value={user.email}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Điện thoại */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-6 h-6 text-gray-400" />
                    Điện thoại
                  </label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    readOnly={!isEditing}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, phoneNumber: val });
                      if (phoneError) setPhoneError("");
                    }}
                    onBlur={() => {
                      const error = validatePhoneNumber(formData.phoneNumber);
                      setPhoneError(error);
                    }}
                    className={`w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200 ${
                      phoneError
                        ? "border-red-400 focus:ring-2 focus:ring-red-500"
                        : isEditing
                        ? "border-green-300 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                    placeholder="Nhập số điện thoại"
                  />
                  {phoneError && (
                    <p className="flex items-center gap-1 text-red-500 text-sm mt-1.5">
                      <AlertCircle className="w-5 h-5" />
                      {phoneError}
                    </p>
                  )}
                </div>
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-6 h-6 text-gray-400" />
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={formData.address}
                  readOnly={!isEditing}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200 ${
                    isEditing
                      ? "border-green-300 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      : "border-gray-200 bg-gray-50 text-gray-600"
                  }`}
                  placeholder="Nhập địa chỉ của bạn"
                />
              </div>

              {/* Thông tin cập nhật */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-6 h-6" />
                  <span>Lần chỉnh sửa gần nhất: </span>
                  <span className="text-gray-700 font-medium">{formatDate(user.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
