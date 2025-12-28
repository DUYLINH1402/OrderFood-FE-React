import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Switch, Spin } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  PictureOutlined,
  HomeOutlined,
  LoginOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  updateAdminEmployeeApi,
  resetAdminEmployeePasswordApi,
} from "../../../services/api/adminEmployeeApi";

const EditStaffModal = ({ open, staff, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Set form values khi staff thay đổi
  useEffect(() => {
    if (staff && open) {
      form.setFieldsValue({
        username: staff.username,
        email: staff.email,
        fullName: staff.fullName || "",
        phoneNumber: staff.phoneNumber || "",
        address: staff.address || "",
        avatarUrl: staff.avatarUrl || "",
        isActive: staff.active,
        isVerified: staff.verified,
      });
    }
  }, [staff, open, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        fullName: values.fullName || null,
        phoneNumber: values.phoneNumber || null,
        address: values.address || null,
        avatarUrl: values.avatarUrl || null,
        isActive: values.isActive,
        isVerified: values.isVerified,
      };

      const response = await updateAdminEmployeeApi(staff.id, payload);

      if (response.success) {
        toast.success("Cập nhật nhân viên thành công!");
        handleClose();
        onSuccess?.();
      } else {
        toast.error(response.message || "Không thể cập nhật nhân viên");
      }
    } catch (error) {
      if (error.errorFields) {
        console.log("Validation failed:", error.errorFields);
      } else {
        console.error("Lỗi khi cập nhật nhân viên:", error);
        toast.error("Đã xảy ra lỗi khi cập nhật nhân viên");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      bodyStyle={{
        height: "85vh",
        overflowY: "auto",
      }}
      title={
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#fff4e6] flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[#e45d23]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold">Chỉnh sửa nhân viên</span>
        </div>
      }
      footer={null}
      width={600}
      centered
      destroyOnClose>
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" className="mt-4">
          {/* Thông tin tài khoản (read-only) */}
          <div className="mb-6">
            <h4 className="text-base font-medium text-[#e45d23] mb-3 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-[#e45d23]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              Thông tin tài khoản
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <Form.Item name="username" label="Tên đăng nhập">
                <Input
                  disabled
                  className="bg-gray-100"
                  size="medium"
                  prefix={<LoginOutlined className="text-gray-400" />}
                />
              </Form.Item>

              <Form.Item name="email" label="Email">
                <Input
                  disabled
                  className="bg-gray-100"
                  size="medium"
                  prefix={<MailOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </div>

            {/* Nút Reset mật khẩu */}
            <div className="mt-3">
              <button
                type="button"
                onClick={async () => {
                  if (!staff?.id) return;
                  setResettingPassword(true);
                  try {
                    const response = await resetAdminEmployeePasswordApi(staff.id);
                    if (response.success) {
                      toast.success("Đã gửi email reset mật khẩu đến nhân viên");
                    } else {
                      toast.error(response.message || "Không thể gửi email reset mật khẩu");
                    }
                  } catch (error) {
                    console.error("Lỗi khi reset mật khẩu:", error);
                    toast.error("Đã xảy ra lỗi khi gửi email reset mật khẩu");
                  } finally {
                    setResettingPassword(false);
                  }
                }}
                disabled={resettingPassword}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {resettingPassword ? (
                  <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                )}
                Reset mật khẩu
              </button>
            </div>
          </div>

          {/* Thông tin cá nhân */}
          <div className="mb-6">
            <h4 className="text-base font-medium text-[#e45d23] mb-3 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-[#e45d23]"
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
              Thông tin cá nhân
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ max: 100, message: "Họ tên tối đa 100 ký tự" }]}>
                <Input
                  placeholder="Nhập họ và tên"
                  prefix={<UserOutlined className="text-gray-400" />}
                  size="medium"
                  allowClear
                />
              </Form.Item>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                ]}>
                <Input
                  placeholder="Nhập số điện thoại"
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  size="medium"
                  allowClear
                />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Form.Item
                name="avatarUrl"
                label="URL Avatar"
                rules={[{ type: "url", message: "URL không hợp lệ" }]}>
                <Input
                  placeholder="Nhập URL ảnh đại diện"
                  prefix={<PictureOutlined className="text-gray-400" />}
                  size="medium"
                  allowClear
                />
              </Form.Item>
            </div>

            <Form.Item name="address" label="Địa chỉ">
              <Input.TextArea
                rows={3}
                placeholder="Nhập địa chỉ"
                showCount
                maxLength={200}
                size="medium"
              />
            </Form.Item>
          </div>

          {/* Cài đặt tài khoản */}
          <div className="mb-6">
            <h4 className="text-base font-medium text-[#e45d23] mb-3 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-[#e45d23]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Cài đặt tài khoản
            </h4>

            <div className="flex gap-8">
              <Form.Item name="isActive" label="Kích hoạt tài khoản" valuePropName="checked">
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>

              <Form.Item name="isVerified" label="Xác thực email" valuePropName="checked">
                <Switch checkedChildren="Đã xác thực" unCheckedChildren="Chưa" />
              </Form.Item>
            </div>

            {/* Thông báo vai trò */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span className="text-gray-600 text-sm">
                  Vai trò nhân viên <strong>(ROLE_STAFF)</strong> không thể thay đổi
                </span>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Lưu thay đổi
            </button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default EditStaffModal;
