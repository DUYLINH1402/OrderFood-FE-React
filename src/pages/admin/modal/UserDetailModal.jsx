import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import { getAdminUserByIdApi } from "../../../services/api/adminUserApi";
import { getSuperAdminUserByIdApi } from "../../../services/api/superAdminApi";
import { useAuth } from "../../../hooks/auth/useAuth";
import { ROLES } from "../../../utils/roleConfig";
import { formatRelativeTime } from "../../../utils/formatRelativeTime";
import { getRoleBadgeColor } from "../util/getRoleBadgeColor";

const UserDetailModal = ({ open, userId, onClose }) => {
  const { userRole } = useAuth();
  const getUserByIdApiCall =
    userRole === ROLES.SUPER_ADMIN ? getSuperAdminUserByIdApi : getAdminUserByIdApi;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user detail khi modal mở
  useEffect(() => {
    const fetchUserDetail = async () => {
      if (!open || !userId) return;

      setLoading(true);
      try {
        const response = await getUserByIdApiCall(userId);
        if (response.success && response.data) {
          setUser(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, [open, userId]);

  // Reset state khi đóng modal
  useEffect(() => {
    if (!open) {
      setUser(null);
    }
  }, [open]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render avatar
  const renderAvatar = () => {
    if (user?.avatarUrl) {
      return (
        <img
          src={user.avatarUrl}
          alt={user.fullName || user.username}
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
        />
      );
    }
    return (
      <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white shadow-lg">
        <svg
          className="w-12 h-12 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
    );
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex">
            <div className="h-4 bg-gray-200 rounded w-24 mr-4"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render info row
  const InfoRow = ({ icon, label, value, valueClass = "" }) => (
    <div className="flex items-start py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center w-64 flex-shrink-0">
        <span className="text-gray-400 mr-2">{icon}</span>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className={`text-sm text-gray-900 flex-1 ${valueClass}`}>{value || "Chưa có"}</div>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      title={
        <div className="flex items-center">
          <svg
            className="w-6 h-6 mr-2 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Thông tin người dùng
        </div>
      }
      centered>
      {loading ? (
        renderSkeleton()
      ) : user ? (
        <div>
          {/* Header với avatar */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 -mx-6 -mt-1 px-6 py-6 mb-6 rounded-xl">
            <div className="flex items-center">
              {renderAvatar()}
              <div className="ml-6 text-white">
                <h3 className="text-xl font-bold">{user.fullName || user.username}</h3>
                <p className="text-indigo-100">@{user.username}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sx font-medium ${getRoleBadgeColor(
                      user.roleCode
                    )}`}>
                    {user.roleName || user.roleCode}
                  </span>
                  {user.verified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sx font-medium bg-blue-100 text-blue-800">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Đã xác thực
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sx font-medium ${
                      user.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                    {user.active ? "Hoạt động" : "Đã khóa"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="space-y-2">
            <InfoRow
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
              label="Email"
              value={user.email}
            />

            <InfoRow
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              }
              label="Điện thoại"
              value={user.phoneNumber}
            />

            <InfoRow
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
              label="Địa chỉ"
              value={user.address}
            />

            <InfoRow
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              label="Điểm thưởng"
              value={
                <span className="font-semibold text-indigo-600">
                  {(user.point || 0).toLocaleString("vi-VN")} điểm
                </span>
              }
            />

            <InfoRow
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              }
              label="Đăng nhập"
              value={
                user.lastLogin ? (
                  <span>
                    {formatDate(user.lastLogin)}
                    <span className="text-gray-400 ml-2">
                      ({formatRelativeTime(user.lastLogin)})
                    </span>
                  </span>
                ) : (
                  "Chưa đăng nhập"
                )
              }
            />

            <InfoRow
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
              label="Ngày tạo"
              value={formatDate(user.createdAt)}
            />

            <InfoRow
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              }
              label="Cập nhật"
              value={formatDate(user.updatedAt)}
            />
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
              Đóng
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-2 text-gray-500">Không tìm thấy thông tin người dùng</p>
        </div>
      )}
    </Modal>
  );
};

export default UserDetailModal;
