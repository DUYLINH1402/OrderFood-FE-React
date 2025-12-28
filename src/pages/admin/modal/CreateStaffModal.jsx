import React, { useState } from "react";
import { Modal, Form, Input, Switch, Spin } from "antd";
import { toast } from "react-toastify";
import { createAdminEmployeeApi } from "../../../services/api/adminEmployeeApi";

const CreateStaffModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName || null,
        phoneNumber: values.phoneNumber || null,
        address: values.address || null,
        avatarUrl: values.avatarUrl || null,
        isActive: values.isActive ?? true,
        isVerified: values.isVerified ?? false,
      };

      const response = await createAdminEmployeeApi(payload);

      if (response.success) {
        toast.success("Tạo nhân viên mới thành công!");
        handleClose();
        onSuccess?.();
      } else {
        toast.error(response.message || "Không thể tạo nhân viên");
      }
    } catch (error) {
      if (error.errorFields) {
        console.log("Validation failed:", error.errorFields);
      } else {
        console.error("Lỗi khi tạo nhân viên:", error);
        toast.error("Đã xảy ra lỗi khi tạo nhân viên");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <span className="text-xl font-semibold">Thêm nhân viên mới</span>
        </div>
      }
      footer={null}
      width={600}
      centered
      destroyOnClose>
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isActive: true,
            isVerified: false,
          }}
          className="mt-4">
          {/* Thông tin tài khoản */}
          <div className="mb-6">
            <h4 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Thông tin tài khoản
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đăng nhập" },
                  { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự" },
                  { max: 50, message: "Tên đăng nhập tối đa 50 ký tự" },
                  {
                    pattern: /^[a-zA-Z0-9_]+$/,
                    message: "Chỉ chấp nhận chữ cái, số và dấu gạch dưới",
                  },
                ]}>
                <Input placeholder="Nhập tên đăng nhập" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}>
                <Input placeholder="Nhập email" />
              </Form.Item>
            </div>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              ]}>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                  },
                }),
              ]}>
              <Input.Password placeholder="Nhập lại mật khẩu" />
            </Form.Item>
          </div>

          {/* Thông tin cá nhân */}
          <div className="mb-6">
            <h4 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Thông tin cá nhân
            </h4>

            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[{ max: 100, message: "Họ tên tối đa 100 ký tự" }]}>
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                ]}>
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>

              <Form.Item
                name="avatarUrl"
                label="URL Avatar"
                rules={[{ type: "url", message: "URL không hợp lệ" }]}>
                <Input placeholder="Nhập URL ảnh đại diện" />
              </Form.Item>
            </div>

            <Form.Item name="address" label="Địa chỉ">
              <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
            </Form.Item>
          </div>

          {/* Cài đặt tài khoản */}
          <div className="mb-6">
            <h4 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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

            {/* Thông báo vai trò tự động */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-blue-700 text-sm">
                  Nhân viên sẽ được tự động gán vai trò <strong>ROLE_STAFF</strong>
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
              Tạo nhân viên
            </button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default CreateStaffModal;
