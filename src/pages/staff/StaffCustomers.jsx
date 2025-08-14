import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useAuth, usePermissions } from "../../hooks/auth/useAuth";
import { PERMISSIONS } from "../../utils/roleConfig";
import { getAllUsers, updateUserStatus } from "../../services/service/userService";

const StaffCustomers = () => {
  const { hasPermission } = usePermissions();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    if (hasPermission(PERMISSIONS.VIEW_USERS)) {
      fetchCustomers();
    } else {
      setError("Bạn không có quyền xem danh sách khách hàng");
      setLoading(false);
    }
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      if (response.success) {
        // Chỉ lấy khách hàng (không phải staff/admin)
        const customerList = response.data.filter(
          (user) => user.role === "CUSTOMER" || user.role === "USER"
        );
        setCustomers(customerList);
      } else {
        setError(response.message || "Không thể tải danh sách khách hàng");
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Có lỗi xảy ra khi tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      const response = await updateUserStatus(userId, newStatus);
      if (response.success) {
        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === userId ? { ...customer, status: newStatus } : customer
          )
        );
        toast.success(`Đã ${newStatus === "ACTIVE" ? "kích hoạt" : "vô hiệu hóa"} tài khoản`);
      } else {
        toast.error(response.message || "Không thể cập nhật trạng thái");
      }
    } catch (err) {
      console.error("Error updating user status:", err);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);
    const matchesStatus = selectedStatus === "ALL" || customer.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (!hasPermission(PERMISSIONS.VIEW_USERS)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-base text-gray-600">Bạn không có quyền xem danh sách khách hàng.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Quản lý khách hàng</h1>
          <p className="text-base text-gray-600">Xem danh sách và quản lý thông tin khách hàng</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base">
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Đã vô hiệu hóa</option>
            </select>
          </div>
        </div>

        {/* Customer List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Danh sách khách hàng ({filteredCustomers.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 text-base">Đang tải...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 m-6">
                <p className="text-red-800 text-base">{error}</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-base">Không có khách hàng nào</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thông tin liên hệ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đăng ký
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {customer.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">ID: {customer.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{customer.email || "N/A"}</div>
                          <div className="text-sm text-gray-500">{customer.phone || "N/A"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            customer.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                          {customer.status === "ACTIVE" ? "Hoạt động" : "Vô hiệu hóa"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {customer.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleUpdateStatus(customer.id, "INACTIVE")}
                            className="text-red-600 hover:text-red-900">
                            Vô hiệu hóa
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(customer.id, "ACTIVE")}
                            className="text-green-600 hover:text-green-900">
                            Kích hoạt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffCustomers;
