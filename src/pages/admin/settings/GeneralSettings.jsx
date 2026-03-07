import React, { useState, useEffect, useCallback } from "react";
import {
  FiSave,
  FiGlobe,
  FiClock,
  FiMapPin,
  FiPhone,
  FiVideo,
  FiImage,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiLink,
  FiFileText,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  getAdminRestaurantInfo,
  updateRestaurantInfo,
  addGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} from "../../../services/service/adminRestaurantService";
import AdminConfirmModal from "../modal/AdminConfirmModal";

const GeneralSettings = () => {
  // State cho thông tin nhà hàng từ API
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // State cho form chỉnh sửa
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    address: "",
    phoneNumber: "",
    videoUrl: "",
    description: "",
    openingHours: "",
  });

  // State cho gallery
  const [galleries, setGalleries] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [showAddGalleryModal, setShowAddGalleryModal] = useState(false);
  const [editingGallery, setEditingGallery] = useState(null);
  const [galleryForm, setGalleryForm] = useState({ imageUrl: "", displayOrder: 1 });
  const [deletingGalleryId, setDeletingGalleryId] = useState(null);

  // State cho các cài đặt khác
  const [otherSettings, setOtherSettings] = useState({
    timezone: "Asia/Ho_Chi_Minh",
    language: "vi",
    currency: "VND",
    maintenanceMode: false,
  });

  // Fetch dữ liệu nhà hàng
  const fetchRestaurantInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminRestaurantInfo();
      setRestaurantInfo(data);

      // Cập nhật form data
      setFormData({
        name: data?.name || "",
        logoUrl: data?.logoUrl || "",
        address: data?.address || "",
        phoneNumber: data?.phoneNumber || "",
        videoUrl: data?.videoUrl || "",
        description: data?.description || "",
        openingHours: data?.openingHours || "",
      });

      // Cập nhật galleries
      const sortedGalleries = data?.galleries
        ? [...data.galleries].sort((a, b) => a.displayOrder - b.displayOrder)
        : [];
      setGalleries(sortedGalleries);
    } catch (err) {
      console.error("Loi khi tai thong tin nha hang:", err);
      setError("Không thể tải thông tin nhà hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurantInfo();
  }, [fetchRestaurantInfo]);

  // Xử lý thay đổi form
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Xử lý thay đổi cài đặt khác
  const handleOtherSettingsChange = (field, value) => {
    setOtherSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Lưu thông tin nhà hàng
  const handleSaveRestaurantInfo = async () => {
    try {
      setSaving(true);
      const updatedData = await updateRestaurantInfo(formData);
      setRestaurantInfo(updatedData);
      toast.success("Cập nhật thông tin nhà hàng thành công!");
    } catch (err) {
      console.error("Loi khi cap nhat thong tin nha hang:", err);
      toast.error("Không thể cập nhật thông tin nhà hàng. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // === GALLERY MANAGEMENT ===

  // Thêm hình ảnh gallery
  const handleAddGalleryImage = async () => {
    if (!galleryForm.imageUrl.trim()) {
      toast.error("Vui lòng nhập URL hình ảnh");
      return;
    }

    try {
      setGalleryLoading(true);
      const updatedData = await addGalleryImage({
        imageUrl: galleryForm.imageUrl,
        displayOrder: galleryForm.displayOrder || galleries.length + 1,
      });

      // Cập nhật galleries từ response
      const sortedGalleries = updatedData?.galleries
        ? [...updatedData.galleries].sort((a, b) => a.displayOrder - b.displayOrder)
        : [];
      setGalleries(sortedGalleries);

      setShowAddGalleryModal(false);
      setGalleryForm({ imageUrl: "", displayOrder: galleries.length + 2 });
      toast.success("Thêm hình ảnh thành công!");
    } catch (err) {
      console.error("Loi khi them hinh anh gallery:", err);
      toast.error("Không thể thêm hình ảnh. Vui lòng thử lại.");
    } finally {
      setGalleryLoading(false);
    }
  };

  // Cập nhật hình ảnh gallery
  const handleUpdateGalleryImage = async () => {
    if (!editingGallery || !galleryForm.imageUrl.trim()) {
      toast.error("Vui lòng nhập URL hình ảnh");
      return;
    }

    try {
      setGalleryLoading(true);
      await updateGalleryImage(editingGallery.id, {
        imageUrl: galleryForm.imageUrl,
        displayOrder: galleryForm.displayOrder,
      });

      // Cập nhật local state
      setGalleries((prev) =>
        prev
          .map((g) =>
            g.id === editingGallery.id
              ? { ...g, imageUrl: galleryForm.imageUrl, displayOrder: galleryForm.displayOrder }
              : g
          )
          .sort((a, b) => a.displayOrder - b.displayOrder)
      );

      setEditingGallery(null);
      setGalleryForm({ imageUrl: "", displayOrder: 1 });
      toast.success("Cập nhật hình ảnh thành công!");
    } catch (err) {
      console.error("Loi khi cap nhat hinh anh gallery:", err);
      toast.error("Không thể cập nhật hình ảnh. Vui lòng thử lại.");
    } finally {
      setGalleryLoading(false);
    }
  };

  // Xóa hình ảnh gallery
  const handleDeleteGalleryImage = async () => {
    if (!deletingGalleryId) return;

    try {
      setGalleryLoading(true);
      await deleteGalleryImage(deletingGalleryId);

      setGalleries((prev) => prev.filter((g) => g.id !== deletingGalleryId));
      setDeletingGalleryId(null);
      toast.success("Xóa hình ảnh thành công!");
    } catch (err) {
      console.error("Loi khi xoa hinh anh gallery:", err);
      toast.error("Không thể xóa hình ảnh. Vui lòng thử lại.");
    } finally {
      setGalleryLoading(false);
    }
  };

  // Mở modal chỉnh sửa gallery
  const openEditGalleryModal = (gallery) => {
    setEditingGallery(gallery);
    setGalleryForm({
      imageUrl: gallery.imageUrl,
      displayOrder: gallery.displayOrder,
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <FiLoader className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Đang tải thông tin nhà hàng...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-2">Đã xảy ra lỗi</p>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchRestaurantInfo}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            <FiRefreshCw className="w-4 h-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Thông tin nhà hàng */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiGlobe className="text-orange-500" />
          Thông tin nhà hàng
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Tên nhà hàng</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              placeholder="Nhập tên nhà hàng"
              className="text-sm w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1">
                <FiPhone className="w-4 h-4" /> Số điện thoại
              </span>
            </label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => handleFormChange("phoneNumber", e.target.value)}
              placeholder="VD: 0988 62 66 00"
              className="text-sm w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-base font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1">
                <FiMapPin className="w-4 h-4" /> Địa chỉ
              </span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleFormChange("address", e.target.value)}
              placeholder="Nhập địa chỉ đầy đủ"
              className="text-sm w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-base font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1">
                <FiFileText className="w-4 h-4" /> Mô tả
              </span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              placeholder="Mô tả về nhà hàng..."
              rows={3}
              className="text-sm w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* Logo & Media */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiImage className="text-orange-500" />
          Logo & Media
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1">
                <FiLink className="w-4 h-4" /> URL Logo
              </span>
            </label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => handleFormChange("logoUrl", e.target.value)}
              placeholder="https://example.com/logo.png"
              className="text-sm w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
            {formData.logoUrl && (
              <div className="mt-2">
                <img
                  src={formData.logoUrl}
                  alt="Logo preview"
                  className="w-20 h-20 object-contain border border-gray-200 rounded-lg bg-gray-50"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1">
                <FiVideo className="w-4 h-4" /> URL Video giới thiệu (YouTube)
              </span>
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => handleFormChange("videoUrl", e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="text-sm w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Thời gian hoạt động */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiClock className="text-orange-500" />
          Thời gian hoạt động
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Giờ mở cửa</label>
            <input
              type="text"
              value={formData.openingHours}
              onChange={(e) => handleFormChange("openingHours", e.target.value)}
              placeholder="VD: 07:00 - 22:00"
              className="text-sm w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Múi giờ</label>
            <select
              value={otherSettings.timezone}
              onChange={(e) => handleOtherSettingsChange("timezone", e.target.value)}
              className="text-sm w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors">
              <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
              <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
              <option value="Asia/Singapore">Singapore (GMT+8)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Nút lưu thông tin nhà hàng */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveRestaurantInfo}
          disabled={saving}
          className="text-sm flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? (
            <>
              <FiLoader className="w-5 h-5 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <FiSave className="w-5 h-5" />
              Lưu thông tin nhà hàng
            </>
          )}
        </button>
      </div>

      {/* Gallery Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiImage className="text-orange-500" />
            Quản lý hình ảnh Gallery
          </h3>
          <button
            onClick={() => {
              setGalleryForm({ imageUrl: "", displayOrder: galleries.length + 1 });
              setShowAddGalleryModal(true);
            }}
            className="text-sm flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
            <FiPlus className="w-4 h-4" />
            Thêm hình ảnh
          </button>
        </div>

        {galleries.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <FiImage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có hình ảnh nào trong gallery</p>
            <p className="text-sm mt-1">Nhấn "Thêm hình ảnh" để bắt đầu</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {galleries.map((gallery, index) => (
              <div
                key={gallery.id}
                className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-square">
                <img
                  src={gallery.imageUrl}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/200x200?text=Loi+hinh+anh";
                  }}
                />
                {/* Overlay với nút hành động */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEditGalleryModal(gallery)}
                    className="p-2 bg-white rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Chỉnh sửa">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingGalleryId(gallery.id)}
                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                    title="Xóa">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                {/* Badge thứ tự */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full">
                  #{gallery.displayOrder}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ngôn ngữ & Tiền tệ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ngôn ngữ & Tiền tệ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              Ngôn ngữ mặc định
            </label>
            <select
              value={otherSettings.language}
              onChange={(e) => handleOtherSettingsChange("language", e.target.value)}
              className="text-sm w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors">
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Đơn vị tiền tệ</label>
            <select
              value={otherSettings.currency}
              onChange={(e) => handleOtherSettingsChange("currency", e.target.value)}
              className="text-sm w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors">
              <option value="VND">VND - Việt Nam Đồng</option>
              <option value="USD">USD - US Dollar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chế độ bảo trì */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Chế độ bảo trì</h3>
            <p className="text-base text-gray-500 mt-1">
              Khi bật, khách hàng sẽ không thể truy cập website
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={otherSettings.maintenanceMode}
              onChange={(e) => handleOtherSettingsChange("maintenanceMode", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>
      </div>

      {/* Modal thêm/sửa gallery */}
      {(showAddGalleryModal || editingGallery) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingGallery ? "Chỉnh sửa hình ảnh" : "Thêm hình ảnh mới"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh</label>
                <input
                  type="url"
                  value={galleryForm.imageUrl}
                  onChange={(e) =>
                    setGalleryForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                  }
                  placeholder="https://example.com/image.jpg"
                  className="text-sm w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  min="1"
                  value={galleryForm.displayOrder}
                  onChange={(e) =>
                    setGalleryForm((prev) => ({
                      ...prev,
                      displayOrder: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="text-sm w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Preview */}
              {galleryForm.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xem trước</label>
                  <img
                    src={galleryForm.imageUrl}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x200?text=URL+khong+hop+le";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddGalleryModal(false);
                  setEditingGallery(null);
                  setGalleryForm({ imageUrl: "", displayOrder: 1 });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Hủy
              </button>
              <button
                onClick={editingGallery ? handleUpdateGalleryImage : handleAddGalleryImage}
                disabled={galleryLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2">
                {galleryLoading ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : editingGallery ? (
                  "Cập nhật"
                ) : (
                  "Thêm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal xóa gallery */}
      <AdminConfirmModal
        isOpen={!!deletingGalleryId}
        onClose={() => setDeletingGalleryId(null)}
        onConfirm={handleDeleteGalleryImage}
        title="Xác nhận xóa hình ảnh"
        message="Bạn có chắc chắn muốn xóa hình ảnh này khỏi gallery? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        loading={galleryLoading}
      />
    </div>
  );
};

export default GeneralSettings;
