import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import { getContactDetailApi } from "../../../services/api/contactApi";
import { formatRelativeTime } from "../../../utils/formatRelativeTime";

// Cấu hình trạng thái tin nhắn
const STATUS_CONFIG = {
  PENDING: {
    label: "Chưa đọc",
    color: "bg-yellow-100 text-yellow-800",
  },
  READ: {
    label: "Đã đọc",
    color: "bg-blue-100 text-blue-800",
  },
  REPLIED: {
    label: "Đã phản hồi",
    color: "bg-green-100 text-green-800",
  },
  ARCHIVED: {
    label: "Đã lưu trữ",
    color: "bg-gray-100 text-gray-800",
  },
};

const ContactDetailModal = ({ open, contactId, onClose, onReply }) => {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch contact detail khi modal mở
  useEffect(() => {
    const fetchContactDetail = async () => {
      if (!open || !contactId) return;

      setLoading(true);
      try {
        const response = await getContactDetailApi(contactId);
        if (response.success && response.data) {
          setContact(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết tin nhắn:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactDetail();
  }, [open, contactId]);

  // Reset state khi đóng modal
  useEffect(() => {
    if (!open) {
      setContact(null);
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

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        <div className="ml-4">
          <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render info row
  const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center w-32 flex-shrink-0">
        <span className="text-gray-400 mr-2">{icon}</span>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="text-sm text-gray-900 flex-1">{value || "Chưa có"}</div>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Chi tiết tin nhắn
        </div>
      }
      centered>
      {loading ? (
        renderSkeleton()
      ) : contact ? (
        <div>
          {/* Header với thông tin người gửi */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 -mx-6 -mt-1 px-6 py-6 mb-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {contact.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <div className="ml-4 text-white">
                  <h3 className="text-xl font-bold">{contact.name}</h3>
                  <p className="text-indigo-100">{contact.email}</p>
                  {contact.phone && <p className="text-indigo-100 text-sm">{contact.phone}</p>}
                </div>
              </div>
              <div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    STATUS_CONFIG[contact.status]?.color || "bg-gray-100 text-gray-800"
                  }`}>
                  {STATUS_CONFIG[contact.status]?.label || contact.status}
                </span>
              </div>
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="space-y-4">
            {/* Chủ đề */}
            {contact.subject && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <svg
                    className="h-6 w-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  Chủ đề
                </div>
                <p className="text-gray-900 font-medium">{contact.subject}</p>
              </div>
            )}

            {/* Nội dung tin nhắn */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                Nội dung tin nhắn
              </div>
              <p className="text-gray-900 whitespace-pre-wrap">{contact.message}</p>
            </div>

            {/* Thông tin thời gian */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <svg
                    className="h-6 w-6 mr-2"
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
                  Thời gian gửi
                </div>
                <p className="text-gray-900 text-sm">{formatDate(contact.createdAt)}</p>
                <p className="text-gray-500 text-sx">{formatRelativeTime(contact.createdAt)}</p>
              </div>

              {contact.repliedAt && (
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center text-sm text-green-600 mb-1">
                    <svg
                      className="h-6 w-6 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Đã phản hồi lúc
                  </div>
                  <p className="text-gray-900 text-sm">{formatDate(contact.repliedAt)}</p>
                </div>
              )}
            </div>

            {/* Nội dung phản hồi (nếu có) */}
            {contact.replyContent && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center text-sm text-green-600 mb-2">
                  <svg
                    className="h-6 w-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                  Nội dung phản hồi
                </div>
                <p className="text-gray-900 whitespace-pre-wrap">{contact.replyContent}</p>
              </div>
            )}

            {/* Ghi chú admin (nếu có) */}
            {contact.adminNote && (
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center text-sm text-yellow-700 mb-2">
                  <svg
                    className="h-6 w-6 mr-2"
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
                  Ghi chú nội bộ
                </div>
                <p className="text-gray-900 whitespace-pre-wrap">{contact.adminNote}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Đóng
            </button>
            {contact.status !== "ARCHIVED" && (
              <button
                onClick={() => onReply(contact)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-colors flex items-center">
                <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                Phản hồi
              </button>
            )}
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
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-2 text-gray-500">Không tìm thấy tin nhắn</p>
        </div>
      )}
    </Modal>
  );
};

export default ContactDetailModal;
