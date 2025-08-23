import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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
  Settings,
  Badge,
  Clock,
} from "lucide-react";
import staff_avatar from "../../assets/icons/staff_avatar.png";

const StaffProfile = () => {
  const { user } = useAuth();
  const { user: userFromRedux } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    address: "",
    avatarUrl: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [activeTab, setActiveTab] = useState("profile");
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Work info based on user data
  const [workInfo] = useState({
    employeeId: userFromRedux?.id || "53",
    department: "Bếp", // Default department
    position: userFromRedux?.roleName || "Nhân viên",
    roleCode: userFromRedux?.roleCode || "ROLE_STAFF",
    lastLogin: userFromRedux?.lastLogin || null,
    verified: userFromRedux?.verified || false,
    active: userFromRedux?.active || false,
    point: userFromRedux?.point || 0,
  });

  useEffect(() => {
    if (userFromRedux) {
      setProfileData({
        fullName: userFromRedux.fullName || "",
        username: userFromRedux.username || "",
        email: userFromRedux.email || "",
        phoneNumber: userFromRedux.phoneNumber || "",
        address: userFromRedux.address || "",
        avatarUrl: userFromRedux.avatarUrl || "",
      });
    }
  }, [userFromRedux]);

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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

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

    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File quá lớn. Vui lòng chọn file nhỏ hơn 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData((prev) => ({
          ...prev,
          avatarUrl: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 25) return "bg-red-500";
    if (strength < 50) return "bg-orange-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-green-500";
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

  const InfoCard = ({ icon: Icon, title, value, color = "gray" }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100 mr-4`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-base font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hồ sơ cá nhân</h1>
          <p className="text-base text-gray-600">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16">
              {/* Avatar */}
              <div className="relative mb-4 md:mb-0 md:mr-6">
                <img
                  src={profileData.avatarUrl || staff_avatar}
                  alt="Avatar"
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl"
                  onError={(e) => {
                    e.target.src = staff_avatar;
                  }}
                />
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-2xl cursor-pointer group hover:bg-opacity-60 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <Camera className="w-6 h-6 text-white group-hover:w-8 group-hover:h-8 transition-all" />
                  </label>
                )}
              </div>

              {/* User Info */}
              <div className="text-center mt-4 md:text-left flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {profileData.fullName || profileData.username || "Nhân viên"}
                </h2>
                <p className="text-base text-gray-600 mb-2">{profileData.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {workInfo.position}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    ID: {workInfo.employeeId}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      workInfo.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                    {workInfo.active ? "Hoạt động" : "Không hoạt động"}
                  </span>
                  {workInfo.verified && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      Đã xác thực
                    </span>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <div className="mt-4 md:mt-0">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-6 py-3 bg-blue-600 text-md text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
                    <Edit3 className="w-6 h-6 mr-2" />
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center px-4 py-2 bg-gray-300 text-md text-gray-800 rounded-xl hover:bg-gray-400 transition-colors">
                      <X className="w-6 h-6 mr-2" />
                      Hủy
                    </button>
                    <button
                      form="profile-form"
                      type="submit"
                      disabled={loading}
                      className="flex items-center px-4 py-2 bg-green-600 text-md text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50">
                      <Save className="w-6 h-6 mr-2" />
                      {loading ? "Đang lưu..." : "Lưu"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Work Info Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <InfoCard icon={Badge} title="Chức vụ" value={workInfo.position} color="blue" />
          <InfoCard icon={Settings} title="Mã vai trò" value={workInfo.roleCode} color="green" />
          <InfoCard
            icon={Check}
            title="Trạng thái"
            value={workInfo.verified ? "Đã xác thực" : "Chưa xác thực"}
            color={workInfo.verified ? "green" : "red"}
          />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 py-4 px-6 text-center font-medium text-base transition-colors ${
                  activeTab === "profile"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}>
                <User className="w-5 h-5 mx-auto mb-1" />
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`flex-1 py-4 px-6 text-center font-medium text-base transition-colors ${
                  activeTab === "password"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}>
                <Lock className="w-5 h-5 mx-auto mb-1" />
                Đổi mật khẩu
              </button>
            </nav>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="p-8">
              <form id="profile-form" onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
                      <User className="w-5 h-5 mr-2" />
                      Thông tin cá nhân
                    </h3>

                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-3">
                        Họ và tên
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, fullName: e.target.value }))
                          }
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="Nhập họ và tên"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-3">
                        Tên đăng nhập
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={profileData.username}
                          disabled={true}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 text-base"
                          placeholder="Tên đăng nhập không thể thay đổi"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Tên đăng nhập không thể thay đổi
                      </p>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-3">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={profileData.phoneNumber}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                          }
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-3">
                        Địa chỉ
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <textarea
                          value={profileData.address}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, address: e.target.value }))
                          }
                          disabled={!isEditing}
                          rows="4"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                          placeholder="Nhập địa chỉ"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
                      <Shield className="w-5 h-5 mr-2" />
                      Thông tin tài khoản
                    </h3>

                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-3">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={profileData.email}
                          disabled={true}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 text-base"
                          placeholder="Email không thể thay đổi"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Email không thể thay đổi vì lý do bảo mật
                      </p>
                    </div>

                    {/* Work Information Display */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-base font-medium text-gray-900 mb-4">
                        Thông tin tài khoản
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Mã nhân viên:</span>
                          <span className="text-sm font-medium">{workInfo.employeeId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Vai trò:</span>
                          <span className="text-sm font-medium">{workInfo.roleCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Lần đăng nhập cuối:</span>
                          <span className="text-sm font-medium">
                            {formatDate(workInfo.lastLogin)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Trạng thái:</span>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${
                                workInfo.active ? "bg-green-500" : "bg-red-500"
                              }`}></span>
                            <span className="text-sm font-medium">
                              {workInfo.active ? "Hoạt động" : "Không hoạt động"}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Xác thực:</span>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${
                                workInfo.verified ? "bg-green-500" : "bg-yellow-500"
                              }`}></span>
                            <span className="text-sm font-medium">
                              {workInfo.verified ? "Đã xác thực" : "Chưa xác thực"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="p-8">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-8">
                  Đổi mật khẩu
                </h3>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-3">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                        }
                        required
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showCurrentPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-3">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                        }
                        required
                        minLength="6"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        placeholder="Nhập mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {passwordData.newPassword && (
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Độ mạnh mật khẩu:</span>
                          <span
                            className={`text-sm font-medium ${
                              passwordStrength < 50
                                ? "text-red-600"
                                : passwordStrength < 75
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}>
                            {getPasswordStrengthText(passwordStrength)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(
                              passwordStrength
                            )}`}
                            style={{ width: `${passwordStrength}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-3">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                        }
                        required
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        placeholder="Nhập lại mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Match Indicator */}
                    {passwordData.confirmPassword && (
                      <div className="mt-2 flex items-center">
                        {passwordData.newPassword === passwordData.confirmPassword ? (
                          <div className="flex items-center text-green-600">
                            <Check className="w-4 h-4 mr-1" />
                            <span className="text-sm">Mật khẩu khớp</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <X className="w-6 h-6 mr-1" />
                            <span className="text-sm">Mật khẩu không khớp</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || passwordData.newPassword !== passwordData.confirmPassword}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
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

export default StaffProfile;
