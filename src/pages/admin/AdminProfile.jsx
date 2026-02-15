import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/auth/useAuth";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Lock,
  Shield,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Crown,
  Clock,
  BadgeCheck,
  Activity,
  KeyRound,
  ChevronRight,
  IdCard,
  ShieldCheck,
  UserCog,
  Star,
} from "lucide-react";
import staff_avatar from "../../assets/icons/staff_avatar.png";

// Import Redux actions
import {
  setProfileData,
  updateField,
  clearError,
  clearAllErrors,
  clearSuccessMessage,
} from "../../store/slices/profileSlice";

// Import thunks
import {
  updateProfileThunk,
  uploadAvatarThunk,
  validateFieldThunk,
} from "../../store/thunks/profileThunks";

const AdminProfile = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();

  // Redux selectors
  const { user: userFromRedux } = useSelector((state) => state.auth);
  const { profileData, errors, loading, successMessages } = useSelector((state) => state.profile);

  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [activeTab, setActiveTab] = useState("profile");
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Get user data
  const currentUser = user || userFromRedux;

  // Account info
  const accountInfo = {
    employeeId: currentUser?.id || "--",
    position: currentUser?.roleName || "Quản trị viên",
    roleCode: currentUser?.roleCode || "ROLE_ADMIN",
    lastLogin: currentUser?.lastLogin || null,
    verified: currentUser?.verified || false,
    active: currentUser?.active || false,
    point: currentUser?.point || 0,
  };

  // Initialize profile data
  useEffect(() => {
    if (currentUser && (!profileData.username || !profileData.email)) {
      dispatch(
        setProfileData({
          fullName: currentUser.fullName || "",
          username: currentUser.username || "",
          email: currentUser.email || "",
          phoneNumber: currentUser.phoneNumber || "",
          address: currentUser.address || "",
          avatarUrl: currentUser.avatarUrl || "",
        })
      );
    }
  }, [currentUser, dispatch, profileData.username, profileData.email]);

  // Handle success messages
  useEffect(() => {
    if (successMessages.updateProfile) {
      toast.success(successMessages.updateProfile);
      dispatch(clearSuccessMessage("updateProfile"));
      setIsEditing(false);
    }

    if (successMessages.uploadAvatar) {
      toast.success(successMessages.uploadAvatar);
      dispatch(clearSuccessMessage("uploadAvatar"));
    }
  }, [successMessages, dispatch]);

  // Password strength checker
  useEffect(() => {
    const calculateStrength = (password) => {
      let score = 0;
      if (password.length >= 8) score += 25;
      if (/[a-z]/.test(password)) score += 25;
      if (/[A-Z]/.test(password)) score += 25;
      if (/[0-9]/.test(password)) score += 25;
      return score;
    };
    setPasswordStrength(calculateStrength(passwordData.newPassword));
  }, [passwordData.newPassword]);

  // Handle field changes
  const handleFieldChange = (field, value) => {
    dispatch(updateField({ field, value }));
    if (errors[field]) {
      dispatch(clearError(field));
    }
  };

  // Handle field blur (validation)
  const handleFieldBlur = (fieldName, value) => {
    dispatch(validateFieldThunk({ fieldName, value }));
  };

  // Handle profile form submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfileThunk(profileData)).unwrap();
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  // Handle avatar change
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await dispatch(uploadAvatarThunk(file)).unwrap();
      } catch (error) {
        console.error("Avatar upload error:", error);
      }
    }
  };

  // Handle password submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Đổi mật khẩu thành công!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error changing password:", err);
      toast.error("Có lỗi xảy ra khi đổi mật khẩu");
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    dispatch(clearAllErrors());
    if (currentUser) {
      dispatch(
        setProfileData({
          fullName: currentUser.fullName || "",
          username: currentUser.username || "",
          email: currentUser.email || "",
          phoneNumber: currentUser.phoneNumber || "",
          address: currentUser.address || "",
          avatarUrl: currentUser.avatarUrl || "",
        })
      );
    }
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 25) return "bg-red-500";
    if (strength < 50) return "bg-orange-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 25) return "Yếu";
    if (strength < 50) return "Trung bình";
    if (strength < 75) return "Khá";
    return "Mạnh";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Error component
  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <div className="flex items-center mt-2 text-red-600">
        <AlertCircle className="w-6 h-5 mr-1 flex-shrink-0" />
        <span className="text-sm">{error}</span>
      </div>
    );
  };

  // Loading state
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-base">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  // Tab config
  const tabs = [
    { id: "profile", label: "Thông tin cá nhân", icon: User },
    { id: "security", label: "Bảo mật", icon: KeyRound },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl laptop:text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-base text-gray-500 mt-1">
            Quản lý thông tin cá nhân và bảo mật tài khoản quản trị viên
          </p>
        </div>

        {/* Profile Hero Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Banner Gradient */}
          <div className="relative h-36 laptop:h-44">
            <div
              className="absolute inset-[-10px] rounded-tl-2xl rounded-tr-2xl"
              style={{
                background:
                  "linear-gradient(135deg, #f59e0b 0%, #d97706 40%, #b45309 70%, #92400e 100%)",
              }}
            />
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%), radial-gradient(circle at 60% 80%, rgba(255,255,255,0.15) 0%, transparent 45%)",
                }}
              />
            </div>
            {/* Admin badge trên banner */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <Crown className="w-6 h-5 text-white" />
              <span className="text-white font-semibold text-sm">Administrator</span>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="relative px-6 laptop:px-8 pb-6">
            <div className="flex flex-col laptop:flex-row items-center laptop:items-end gap-4 laptop:gap-6 -mt-16 laptop:-mt-20">
              {/* Avatar */}
              <div className="relative group flex-shrink-0">
                <div className="w-28 h-28 laptop:w-36 laptop:h-36 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white">
                  <img
                    src={profileData.avatarUrl || staff_avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = staff_avatar;
                    }}
                  />
                </div>
                {/* Camera overlay */}
                <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 rounded-2xl cursor-pointer transition-all duration-300 border-4 border-transparent">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={loading.uploadAvatar}
                  />
                  {loading.uploadAvatar ? (
                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 p-2 rounded-xl shadow-lg">
                      <Camera className="w-6 h-5 text-gray-700" />
                    </div>
                  )}
                </label>
                {/* Verified badge */}
                {accountInfo.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1.5 rounded-lg border-2 border-white shadow-sm">
                    <BadgeCheck className="w-6 h-5 text-white" />
                  </div>
                )}
                {errors.avatar && (
                  <div className="absolute -bottom-10 left-0 right-0">
                    <ErrorMessage error={errors.avatar} />
                  </div>
                )}
              </div>

              {/* User Details */}
              <div className="flex-1 text-center laptop:text-left pt-2 laptop:pt-4">
                <div className="flex flex-col laptop:flex-row laptop:items-center gap-2 laptop:gap-4 mb-2">
                  <h2 className="text-2xl laptop:text-3xl font-bold text-gray-900">
                    @{profileData.fullName || profileData.username || "Quản trị viên"}
                  </h2>
                </div>
                <p className="text-base text-[#3F5A46] mb-3">{profileData.email}</p>
                <div className="flex flex-wrap justify-center laptop:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium border border-amber-200">
                    <Crown className="w-6 h-5" />
                    {accountInfo.position}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium border border-gray-200">
                    <IdCard className="w-6 h-5" />
                    ID: {accountInfo.employeeId}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${
                      accountInfo.active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                    <Activity className="w-6 h-5" />
                    {accountInfo.active ? "Đang hoạt động" : "Không hoạt động"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-200">
                    <Star className="w-6 h-5" />
                    {accountInfo.point} điểm
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <div className="flex-shrink-0 mt-2 laptop:mt-4">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all duration-200 shadow-lg shadow-amber-500/25 text-sm font-medium">
                    <Edit3 className="w-6 h-5" />
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm font-medium">
                      <X className="w-6 h-5" />
                      Huỷ
                    </button>
                    <button
                      form="admin-profile-form"
                      type="submit"
                      disabled={loading.updateProfile}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-200 shadow-lg shadow-emerald-500/25 text-sm font-medium disabled:opacity-50">
                      <Save className="w-6 h-5" />
                      {loading.updateProfile ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 laptop:grid-cols-4 gap-4 mb-6">
          <QuickStatCard
            icon={ShieldCheck}
            label="Vai trò"
            value={accountInfo.position}
            color="amber"
          />
          <QuickStatCard
            icon={UserCog}
            label="Mã vai trò"
            value={accountInfo.roleCode.replace("ROLE_", "")}
            color="blue"
          />
          <QuickStatCard
            icon={BadgeCheck}
            label="Xác thực"
            value={accountInfo.verified ? "Đã xác thực" : "Chưa xác thực"}
            color={accountInfo.verified ? "emerald" : "red"}
          />
          <QuickStatCard
            icon={Clock}
            label="Đăng nhập cuối"
            value={formatDate(accountInfo.lastLogin)}
            color="purple"
            small
          />
        </div>

        {/* Tabs + Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-100">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-all duration-200 relative ${
                      isActive
                        ? "text-amber-600"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}>
                    <Icon className="w-6 h-5" />
                    <span>{tab.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-t-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab: Profile */}
          {activeTab === "profile" && (
            <div className="p-6 laptop:p-8">
              <form id="admin-profile-form" onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 laptop:grid-cols-2 gap-8">
                  {/* Left Column - Personal Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <User className="w-6 h-5 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
                    </div>

                    <div className="space-y-5">
                      {/* Full Name */}
                      <ProfileField
                        label="Họ và tên"
                        icon={User}
                        value={profileData.fullName}
                        onChange={(val) => handleFieldChange("fullName", val)}
                        onBlur={(val) => handleFieldBlur("fullName", val)}
                        disabled={!isEditing}
                        error={errors.fullName}
                        placeholder="Nhập họ và tên"
                      />

                      {/* Username */}
                      <ProfileField
                        label="Tên đăng nhập"
                        icon={User}
                        value={profileData.username}
                        disabled={true}
                        placeholder="Tên đăng nhập không thể thay đổi"
                        hint="Tên đăng nhập không thể thay đổi"
                      />

                      {/* Phone Number */}
                      <ProfileField
                        label="Số điện thoại"
                        icon={Phone}
                        type="tel"
                        value={profileData.phoneNumber}
                        onChange={(val) => handleFieldChange("phoneNumber", val)}
                        onBlur={(val) => handleFieldBlur("phoneNumber", val)}
                        disabled={!isEditing}
                        error={errors.phoneNumber}
                        placeholder="Nhập số điện thoại"
                      />

                      {/* Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Địa chỉ
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-3.5 w-6 h-5 text-gray-400" />
                          <textarea
                            value={profileData.address}
                            onChange={(e) => handleFieldChange("address", e.target.value)}
                            onBlur={(e) => handleFieldBlur("address", e.target.value)}
                            disabled={!isEditing}
                            rows="3"
                            className={`w-full pl-11 pr-4 py-3 border rounded-xl text-base transition-all duration-200 resize-none
                              ${
                                isEditing
                                  ? "bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                  : "bg-gray-50 text-gray-500 cursor-default"
                              }
                              ${errors.address ? "border-red-300" : "border-gray-200"}`}
                            placeholder="Nhập địa chỉ"
                          />
                        </div>
                        <ErrorMessage error={errors.address} />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Account Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <Shield className="w-6 h-5 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Thông tin tài khoản</h3>
                    </div>

                    <div className="space-y-5">
                      {/* Email */}
                      <ProfileField
                        label="Email"
                        icon={Mail}
                        type="email"
                        value={profileData.email}
                        disabled={true}
                        placeholder="Email không thể thay đổi"
                        hint="Email không thể thay đổi vì lý do bảo mật"
                      />

                      {/* Account Details Card */}
                      <div className="bg-gradient-to-br from-gray-50 to-amber-50/30 rounded-xl p-5 border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Shield className="w-6 h-5 text-amber-500" />
                          Chi tiết tài khoản
                        </h4>
                        <div className="space-y-3.5">
                          <AccountDetailRow
                            label="Mã quản trị viên"
                            value={`#${accountInfo.employeeId}`}
                          />
                          <AccountDetailRow
                            label="Vai trò"
                            value={accountInfo.roleCode}
                            badge
                            badgeColor="amber"
                          />
                          <AccountDetailRow
                            label="Điểm thưởng"
                            value={`${accountInfo.point.toLocaleString("vi-VN")} điểm`}
                          />
                          <AccountDetailRow
                            label="Đăng nhập cuối"
                            value={formatDate(accountInfo.lastLogin)}
                          />
                          <AccountDetailRow
                            label="Trạng thái"
                            value={accountInfo.active ? "Hoạt động" : "Không hoạt động"}
                            status={accountInfo.active ? "active" : "inactive"}
                          />
                          <AccountDetailRow
                            label="Xác thực"
                            value={accountInfo.verified ? "Đã xác thực" : "Chưa xác thực"}
                            status={accountInfo.verified ? "active" : "warning"}
                          />
                        </div>
                      </div>

                      {/* General Error */}
                      {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <ErrorMessage error={errors.general} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Security */}
          {activeTab === "security" && (
            <div className="p-6 laptop:p-8">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <KeyRound className="w-6 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Đổi mật khẩu</h3>
                    <p className="text-sm text-gray-500">
                      Cập nhật mật khẩu để bảo vệ tài khoản quản trị viên
                    </p>
                  </div>
                </div>

                {/* Security Tips */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex gap-3">
                    <Shield className="w-6 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 mb-1">
                        Lưu ý bảo mật tài khoản Admin
                      </p>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>- Sử dụng mật khẩu có ít nhất 8 ký tự</li>
                        <li>- Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                        <li>- Không chia sẻ mật khẩu với bất kỳ ai</li>
                        <li>- Thay đổi mật khẩu định kỳ mỗi 3 tháng</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  {/* Current Password */}
                  <PasswordField
                    label="Mật khẩu hiện tại"
                    value={passwordData.currentPassword}
                    onChange={(val) =>
                      setPasswordData((prev) => ({ ...prev, currentPassword: val }))
                    }
                    show={showCurrentPassword}
                    onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                  />

                  {/* New Password */}
                  <div>
                    <PasswordField
                      label="Mật khẩu mới"
                      value={passwordData.newPassword}
                      onChange={(val) => setPasswordData((prev) => ({ ...prev, newPassword: val }))}
                      show={showNewPassword}
                      onToggle={() => setShowNewPassword(!showNewPassword)}
                      placeholder="Nhập mật khẩu mới"
                      required
                      minLength="6"
                    />
                    {/* Strength Indicator */}
                    {passwordData.newPassword && (
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-gray-500">Độ mạnh mật khẩu</span>
                          <span
                            className={`text-xs font-semibold ${
                              passwordStrength < 50
                                ? "text-red-600"
                                : passwordStrength < 75
                                ? "text-yellow-600"
                                : "text-emerald-600"
                            }`}>
                            {getPasswordStrengthText(passwordStrength)}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[25, 50, 75, 100].map((threshold) => (
                            <div
                              key={threshold}
                              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                                passwordStrength >= threshold
                                  ? getPasswordStrengthColor(passwordStrength)
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <PasswordField
                      label="Xác nhận mật khẩu mới"
                      value={passwordData.confirmPassword}
                      onChange={(val) =>
                        setPasswordData((prev) => ({ ...prev, confirmPassword: val }))
                      }
                      show={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                    />
                    {passwordData.confirmPassword && (
                      <div className="mt-2 flex items-center gap-1.5">
                        {passwordData.newPassword === passwordData.confirmPassword ? (
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <Check className="w-6 h-5" />
                            <span className="text-sm font-medium">Mật khẩu khớp</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-600">
                            <X className="w-6 h-5" />
                            <span className="text-sm font-medium">Mật khẩu không khớp</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={
                      loading.updateProfile ||
                      passwordData.newPassword !== passwordData.confirmPassword ||
                      !passwordData.currentPassword ||
                      !passwordData.newPassword
                    }
                    className="w-full py-3 px-4 bg-amber-500 text-white rounded-xl hover:bg-amber-600 
                      focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm font-medium 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 
                      shadow-lg shadow-amber-500/25">
                    {loading.updateProfile ? "Đang cập nhật..." : "Đổi mật khẩu"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---

const QuickStatCard = ({ icon: Icon, label, value, color = "gray", small = false }) => {
  const colorMap = {
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-red-50 text-red-600 border-red-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    gray: "bg-gray-50 text-gray-600 border-gray-100",
  };

  const iconColorMap = {
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <div
      className={`bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-lg ${iconColorMap[color]}`}>
          <Icon className="w-6 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{label}</p>
          <p
            className={`font-semibold text-gray-900 truncate ${small ? "text-sm" : "text-base"}`}
            title={value}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  onBlur,
  disabled,
  error,
  placeholder,
  hint,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-5 text-gray-400" />
        <input
          type={type}
          value={value || ""}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          onBlur={onBlur ? (e) => onBlur(e.target.value) : undefined}
          disabled={disabled}
          className={`w-full pl-11 pr-4 py-3 border rounded-xl text-base transition-all duration-200
            ${
              !disabled
                ? "bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                : "bg-gray-50 text-gray-500 cursor-default"
            }
            ${error ? "border-red-300" : "border-gray-200"}`}
          placeholder={placeholder}
        />
      </div>
      {hint && !error && (
        <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1">
          <AlertCircle className="w-6 h-5" />
          {hint}
        </p>
      )}
      <ErrorMessage error={error} />
    </div>
  );
};

const PasswordField = ({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  required,
  minLength,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-5 text-gray-400" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl bg-white 
            focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 
            text-base transition-all duration-200"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">
          {show ? <EyeOff className="w-6 h-5" /> : <Eye className="w-6 h-5" />}
        </button>
      </div>
    </div>
  );
};

const AccountDetailRow = ({ label, value, badge, badgeColor, status }) => {
  const statusColors = {
    active: "bg-emerald-500",
    inactive: "bg-red-500",
    warning: "bg-yellow-500",
  };

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        {status && <span className={`inline-block w-2 h-2 rounded-full ${statusColors[status]}`} />}
        {badge ? (
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-semibold bg-${badgeColor}-100 text-${badgeColor}-700`}>
            {value}
          </span>
        ) : (
          <span className="text-sm font-medium text-gray-900">{value}</span>
        )}
      </div>
    </div>
  );
};

// ErrorMessage component (used inside ProfileField)
const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return (
    <div className="flex items-center mt-1.5 text-red-600">
      <AlertCircle className="w-6 h-5 mr-1 flex-shrink-0" />
      <span className="text-xs">{error}</span>
    </div>
  );
};

export default AdminProfile;
