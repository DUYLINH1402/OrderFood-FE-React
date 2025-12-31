import React, { useState } from "react";
import { Modal, Form, Input, Select, Switch, Button, Row, Col, Tooltip, message, Tag } from "antd";
import {
  UserAddOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  IdcardOutlined,
  LinkOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { createAdminUserApi } from "../../../services/api/adminUserApi";
import { createAdminEmployeeApi } from "../../../services/api/adminEmployeeApi";

const { Option } = Select;

const CreateUserModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("ROLE_USER");

  const handleClose = () => {
    form.resetFields();
    setSelectedRole("ROLE_USER"); // Reset về mặc định
    onClose();
  };

  // Tạo mật khẩu ngẫu nhiên
  const generatePassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";

    // Đảm bảo mỗi loại có ít nhất 1 ký tự
    let password = "";
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Thêm các ký tự ngẫu nhiên còn lại cho đủ độ dài 12
    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = 0; i < 8; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Trộn ngẫu nhiên chuỗi mật khẩu
    password = password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

    form.setFieldsValue({
      password: password,
      confirmPassword: password,
    });

    message.success("Đã tạo mật khẩu ngẫu nhiên!");
    navigator.clipboard.writeText(password);
    message.info("Đã copy vào bộ nhớ tạm");
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 1. Chuẩn bị payload cơ bản
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

      let response;

      // 2. PHÂN LUỒNG VÀ TRUYỀN ROLE ĐÚNG ĐỊNH DẠNG BE CẦN
      if (values.roleCode === "ROLE_USER") {
        // Đối với User thông thường, gửi kèm roleCode
        response = await createAdminUserApi({
          ...payload,
          roleCode: values.roleCode,
        });
      } else {
        // ĐỐI VỚI STAFF/ADMIN: Kiểm tra lại BE cần field nào?
        // Thường BE sẽ cần 'role' (string) hoặc 'roles' (array)
        response = await createAdminEmployeeApi({
          ...payload,
          role: values.roleCode, // Thêm dòng này nếu BE cần trường 'role'
          roles: [values.roleCode], // Thêm dòng này nếu BE cần mảng 'roles'
        });
      }

      if (response.success) {
        toast.success(`Tạo tài khoản [${values.roleCode}] thành công!`);
        handleClose();
        onSuccess?.();
      } else {
        toast.error(response.message || "Không thể tạo tài khoản");
      }
    } catch (error) {
      // ... xử lý lỗi
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
          <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <UserAddOutlined className="text-indigo-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 m-0">Tạo Tài Khoản Mới</h3>
            <p className="text-sm text-gray-500 m-0">Quản lý người dùng và nhân viên hệ thống</p>
          </div>
        </div>
      }
      footer={[
        <Button key="cancel" onClick={handleClose} className="hover:bg-gray-100 border-gray-300">
          Đóng
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          className="bg-indigo-600 hover:bg-indigo-500 h-10 px-6 font-medium shadow-sm"
          icon={<CheckOutlined />}>
          Xác nhận tạo
        </Button>,
      ]}
      width={850}
      centered
      destroyOnClose
      maskClosable={false}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          roleCode: "ROLE_USER",
          isActive: true,
          isVerified: false,
        }}
        className="pt-4 px-2"
        onValuesChange={(changedValues) => {
          if (changedValues.roleCode) {
            setSelectedRole(changedValues.roleCode);
          }
        }}>
        <Row gutter={24}>
          {/* CỘT TRÁI: THÔNG TIN HỆ THỐNG */}
          <Col span={12}>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <SafetyCertificateOutlined className="text-indigo-600" />
                <span className="font-bold text-gray-700">Thông tin đăng nhập & Vai trò</span>
              </div>

              {/* CHỌN VAI TRÒ - ĐIỂM KHÁC BIỆT CHÍNH */}
              <div className="mb-4 bg-white p-3 rounded border border-gray-200 shadow-sm">
                <Form.Item name="roleCode" label="Loại tài khoản" className="mb-0">
                  <Select size="large" className="w-full">
                    <Option value="ROLE_USER">
                      <div className="flex items-center gap-2">
                        <UserOutlined className="text-green-500" />
                        <span>Khách hàng (User)</span>
                      </div>
                    </Option>
                    <Option value="ROLE_STAFF">
                      <div className="flex items-center gap-2">
                        <TeamOutlined className="text-blue-500" />
                        <span>Nhân viên (Staff)</span>
                      </div>
                    </Option>
                    <Option value="ROLE_ADMIN">
                      <div className="flex items-center gap-2">
                        <SafetyCertificateOutlined className="text-red-500" />
                        <span>Quản trị viên (Admin)</span>
                      </div>
                    </Option>
                  </Select>
                </Form.Item>

                {/* Hiển thị chú thích tùy theo role */}
                <div className="mt-2 text-sm">
                  {selectedRole === "ROLE_USER" && <Tag color="green">Khách hàng mua sắm</Tag>}
                  {selectedRole === "ROLE_STAFF" && <Tag color="blue">Nhân viên nhà hàng</Tag>}
                  {selectedRole === "ROLE_ADMIN" && <Tag color="red">Toàn quyền hệ thống</Tag>}
                </div>
              </div>

              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: "Bắt buộc nhập" },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: "Không chứa ký tự đặc biệt" },
                ]}>
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="VD: user123"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}>
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="VD: email@example.com"
                />
              </Form.Item>

              {/* PASSWORD GENERATOR */}
              <div className="mt-auto">
                <div className="p-3 bg-white rounded border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sx font-semibold text-gray-500 uppercase">Bảo mật</span>
                    <Tooltip title="Tạo mật khẩu ngẫu nhiên & Copy">
                      <Button
                        type="link"
                        size="small"
                        icon={<ReloadOutlined />}
                        onClick={generatePassword}>
                        Tạo tự động
                      </Button>
                    </Tooltip>
                  </div>

                  <Form.Item
                    name="password"
                    noStyle
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
                    <Input.Password
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="Mật khẩu"
                      className="mb-2"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </Col>

          {/* CỘT PHẢI: THÔNG TIN CÁ NHÂN */}
          <Col span={12}>
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4 pl-1">
                <IdcardOutlined className="text-indigo-600" />
                <span className="font-bold text-gray-700">Thông tin cá nhân</span>
              </div>

              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
                <Input
                  prefix={<IdcardOutlined className="text-gray-400" />}
                  placeholder="Nhập họ tên đầy đủ"
                />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[{ pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" }]}>
                <Input
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="09xxxx (Tùy chọn)"
                />
              </Form.Item>

              <Form.Item name="address" label="Địa chỉ">
                <Input.TextArea rows={2} placeholder="Địa chỉ liên hệ/Giao hàng" />
              </Form.Item>

              <Form.Item name="avatarUrl" label="Ảnh đại diện">
                <Input
                  prefix={<LinkOutlined className="text-gray-400" />}
                  placeholder="URL hình ảnh (Tùy chọn)"
                />
              </Form.Item>

              {/* TRẠNG THÁI */}
              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="flex gap-8">
                  <Form.Item name="isActive" valuePropName="checked" className="mb-0">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-gray-500">Trạng thái</span>
                      <Switch
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                      />
                    </div>
                  </Form.Item>

                  <Form.Item name="isVerified" valuePropName="checked" className="mb-0">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-gray-500">Xác thực Email</span>
                      <Switch
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                      />
                    </div>
                  </Form.Item>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateUserModal;
