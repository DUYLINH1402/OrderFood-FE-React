import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Switch, message } from "antd";
import { createAdminUserApi } from "../../../services/api/adminUserApi";
import { toast } from "react-toastify";

const { Option } = Select;

// Role options
const ROLE_OPTIONS = [
  { value: "ROLE_USER", label: "Khách hàng" },
  { value: "ROLE_STAFF", label: "Nhân viên" },
  { value: "ROLE_ADMIN", label: "Quản trị viên" },
];

const CreateUserModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Reset form khi mở modal
  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        roleCode: "ROLE_USER",
        isActive: true,
        isVerified: false,
      });
    }
  }, [open, form]);

  // Xử lý submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const response = await createAdminUserApi(values);

      if (response.success) {
        toast.success("Tạo người dùng thành công");
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || "Không thể tạo người dùng");
      }
    } catch (error) {
      if (error.errorFields) {
        // Lỗi validation form
        return;
      }
      console.error("Lỗi khi tạo người dùng:", error);
      toast.error("Đã xảy ra lỗi khi tạo người dùng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-green-600"
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
          Thêm người dùng mới
        </div>
      }
      width={600}
      centered
      okText="Tạo người dùng"
      cancelText="Hủy"
      onOk={handleSubmit}
      confirmLoading={loading}
      okButtonProps={{
        className: "bg-indigo-600 hover:bg-indigo-700",
      }}>
      <Form form={form} layout="vertical" className="mt-4">
        {/* Thông tin đăng nhập */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-gray-400"
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
            Thông tin đăng nhập
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập" },
                { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự" },
                { max: 50, message: "Tên đăng nhập không được quá 50 ký tự" },
                {
                  pattern: /^[a-zA-Z0-9_]+$/,
                  message: "Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới",
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
              <Input placeholder="Nhập địa chỉ email" />
            </Form.Item>
          </div>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              { max: 100, message: "Mật khẩu không được quá 100 ký tự" },
            ]}>
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
        </div>

        {/* Thông tin cá nhân */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-gray-400"
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
              rules={[{ max: 100, message: "Họ tên không được quá 100 ký tự" }]}>
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label="Số điện thoại"
              rules={[
                { max: 20, message: "Số điện thoại không được quá 20 ký tự" },
                {
                  pattern: /^[0-9+\-\s]*$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}>
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ max: 255, message: "Địa chỉ không được quá 255 ký tự" }]}>
            <Input.TextArea placeholder="Nhập địa chỉ" rows={2} />
          </Form.Item>

          <Form.Item name="avatarUrl" label="URL Avatar">
            <Input placeholder="Nhập URL hình ảnh avatar" />
          </Form.Item>
        </div>

        {/* Cài đặt tài khoản */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-gray-400"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item name="roleCode" label="Vai trò" rules={[{ required: true }]}>
              <Select placeholder="Chọn vai trò">
                {ROLE_OPTIONS.map((role) => (
                  <Option key={role.value} value={role.value}>
                    {role.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
              <Switch
                checkedChildren="Hoạt động"
                unCheckedChildren="Khóa"
                className="bg-gray-300"
              />
            </Form.Item>

            <Form.Item name="isVerified" label="Xác thực" valuePropName="checked">
              <Switch
                checkedChildren="Đã xác thực"
                unCheckedChildren="Chưa xác thực"
                className="bg-gray-300"
              />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateUserModal;
