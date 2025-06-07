import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../store/slices/authSlice";
import { LoadingButton } from "../../components/Skeleton/LoadingButton";
import { toast } from "react-toastify";
import { validatePhoneNumber } from "../../utils/validation";
import { getProfile, updateProfile, uploadAvatar } from "../../services/service/userService";
import LoadingIcon from "../../components/Skeleton/LoadingIcon";
import user_avatar from "../../assets/icons/user_avatar.png";

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

  if (error) return <p className="text-red-500">Lỗi: {error}</p>;
  if (!user) return <p>Đang tải thông tin...</p>;

  return (
    <div className="bg-white text-gray-800 p-6 rounded-xl shadow space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* KHU ẢNH ĐẠI DIỆN */}
        <div className="space-y-4 flex flex-col items-center justify-center">
          <img
            src={avatarPreview}
            alt="Avatar"
            className="w-40 h-40 rounded-full object-cover border"
          />
          <form class="max-w-md mx-auto">
            <input
              class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              aria-describedby="user_avatar_help"
              accept="image/*"
              id="user_avatar"
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
          </form>

          {avatarFile && (
            <div className="flex space-x-2 w-full justify-center">
              <button
                onClick={handleUploadAvatar}
                disabled={isUploadingAvatar}
                className="min-w-[55px] bg-green-600 text-white px-4 py-2 rounded-md text-sm md:text-base flex items-center justify-center space-x-2">
                {isUploadingAvatar ? <LoadingIcon size="16px" /> : <span>Lưu</span>}
              </button>

              <button
                onClick={handleCancelAvatar}
                className="min-w-[55px] bg-gray-400 text-white px-4 py-2 rounded-md text-sm md:text-base">
                Huỷ
              </button>
            </div>
          )}
        </div>

        {/* FORM THÔNG TIN */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-end space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-md text-sm md:text-base">
                Chỉnh sửa
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="min-w-[55px] bg-green-600 text-white text-sm rounded-md px-5 py-2 text-sm md:text-base flex items-center justify-center space-x-2">
                  {isSaving ? <LoadingIcon size="16px" /> : <span>Lưu</span>}
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
                  className="min-w-[55px] bg-gray-400 text-white text-sm rounded-md px-5 py-2 text-sm md:text-base">
                  Huỷ
                </button>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Username</label>
              <input
                type="text"
                value={user.username}
                readOnly
                className="w-full px-3 py-3 border border-gray-300 bg-gray-100 rounded text-sm md:text-md"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Họ tên</label>
              <input
                type="text"
                value={formData.fullName}
                readOnly={!isEditing}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded text-sm md:text-md"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="text"
                value={user.email}
                readOnly
                className="w-full px-3 py-3 border border-gray-300 bg-gray-100 rounded text-sm md:text-md"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Điện thoại</label>
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
                className={`w-full px-3 py-3 border rounded text-sm md:text-md ${
                  phoneError ? "border-red-500" : "border-gray-300"
                }`}
              />
              {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Địa chỉ</label>
            <input
              type="text"
              value={formData.address}
              readOnly={!isEditing}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 rounded text-sm md:text-md"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1">Trạng thái</label>
              <span className={user.active ? "text-green-600" : "text-red-600"}>
                {user.active ? "Đang hoạt động" : "Bị khóa"}
              </span>
            </div>
            <div>
              <label className="block font-semibold mb-1">Email xác minh</label>
              <span className={user.verified ? "text-green-600" : "text-yellow-600"}>
                {user.verified ? "Đã xác minh" : "Chưa xác minh"}
              </span>
            </div>
            <div>
              <label className="block font-semibold mb-1">Điểm tích lũy</label>
              <span>{user.point}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Lần chỉnh sửa gần nhất</label>
            <span>{formatDate(user.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
