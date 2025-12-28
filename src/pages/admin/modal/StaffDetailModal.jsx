import React, { useState, useEffect } from "react";
import { Modal, Spin } from "antd";
import { getAdminEmployeeByIdApi } from "../../../services/api/adminEmployeeApi";

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return "Chưa có dữ liệu";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StaffDetailModal = ({ open, staffId, onClose }) => {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStaffDetail = async () => {
      if (!staffId) return;

      setLoading(true);
      try {
        const response = await getAdminEmployeeByIdApi(staffId);
        if (response.success && response.data) {
          setStaff(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin nhân viên:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open && staffId) {
      fetchStaffDetail();
    }
  }, [open, staffId]);

  const handleClose = () => {
    setStaff(null);
    onClose();
  };

  // Render thông tin row
  const InfoRow = ({ label, value, isStatus, isVerified }) => (
    <div className="flex justify-between py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-600 font-medium">{label}</span>
      {isStatus ? (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
          {value ? "Hoạt động" : "Đã khóa"}
        </span>
      ) : isVerified ? (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
            value ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
          }`}>
          {value ? "Đã xác thực" : "Chưa xác thực"}
        </span>
      ) : (
        <span className="text-gray-900">{value || "Chưa có dữ liệu"}</span>
      )}
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      centered
      title={
        <div className="text-lg flex items-center">
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
          Thông tin nhân viên
        </div>
      }
      className="staff-detail-modal"
      styles={{
        body: { padding: 0 },
      }}>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spin size="large" />
        </div>
      ) : staff ? (
        <div>
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white rounded-xl">
            <div className="flex items-center gap-4">
              {staff.avatarUrl ? (
                <img
                  src={staff.avatarUrl}
                  alt={staff.fullName || staff.username}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">{staff.fullName || staff.username}</h3>
                <p className="text-white/80 text-sm">@{staff.username}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium bg-blue-400/30 text-white">
                    Nhân viên
                  </span>
                  {staff.verified && (
                    <span className="inline-flex items-center" title="Đã xác thực">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Thông tin cơ bản */}
            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-blue-500"
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
                Thông tin cơ bản
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <InfoRow label="ID" value={staff.id} />
                <InfoRow label="Email" value={staff.email} />
                <InfoRow label="Số điện thoại" value={staff.phoneNumber} />
                <InfoRow label="Địa chỉ" value={staff.address} />
              </div>
            </div>

            {/* Trạng thái tài khoản */}
            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Trạng thái tài khoản
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <InfoRow label="Trạng thái" value={staff.active} isStatus />
                <InfoRow label="Xác thực email" value={staff.verified} isVerified />
              </div>
            </div>

            {/* Thời gian */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Thông tin thời gian
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <InfoRow label="Ngày tạo" value={formatDate(staff.createdAt)} />
                <InfoRow label="Cập nhật lần cuối" value={formatDate(staff.updatedAt)} />
                <InfoRow label="Đăng nhập lần cuối" value={formatDate(staff.lastLogin)} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end rounded-b-lg">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Đóng
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-16">
          <p className="text-gray-500">Không tìm thấy thông tin nhân viên</p>
        </div>
      )}
    </Modal>
  );
};

export default StaffDetailModal;
