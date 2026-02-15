import React, { useState } from "react";
import { Modal } from "antd";
import { toast } from "react-toastify";
import { replyContactApi } from "../../../services/api/contactApi";

const ContactReplyModal = ({ open, contact, onClose, onSuccess }) => {
  const [replyContent, setReplyContent] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Reset state khi modal mở
  React.useEffect(() => {
    if (open) {
      setReplyContent("");
      setSendEmail(true);
    }
  }, [open]);

  // Xử lý gửi phản hồi
  const handleSubmit = async () => {
    if (!replyContent.trim()) {
      toast.warning("Vui lòng nhập nội dung phản hồi");
      return;
    }

    if (replyContent.trim().length < 10) {
      toast.warning("Nội dung phản hồi phải có ít nhất 10 ký tự");
      return;
    }

    setSubmitting(true);
    try {
      const response = await replyContactApi(contact.id, {
        replyContent: replyContent.trim(),
        sendEmail,
      });

      if (response.success) {
        toast.success(
          sendEmail ? "Đã gửi phản hồi và email cho khách hàng" : "Đã lưu phản hồi thành công"
        );
        onSuccess();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Lỗi khi gửi phản hồi:", error);
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Mẫu phản hồi nhanh
  const quickReplies = [
    {
      label: "Cảm ơn",
      content:
        "Cảm ơn bạn đã liên hệ với Đồng Xanh! Chúng tôi đã nhận được thông tin của bạn và sẽ xử lý trong thời gian sớm nhất.",
    },
    {
      label: "Đơn hàng",
      content:
        "Cảm ơn bạn đã quan tâm đến đơn hàng. Chúng tôi đã kiểm tra và xác nhận thông tin. Nếu có thắc mắc thêm, vui lòng liên hệ hotline 0988 62 66 00.",
    },
    {
      label: "Hỗ trợ",
      content:
        "Đội ngũ Đồng Xanh sẵn sàng hỗ trợ bạn. Vui lòng cho chúng tôi biết thêm chi tiết hoặc liên hệ trực tiếp qua hotline 0988 62 66 00 để được hỗ trợ nhanh nhất.",
    },
  ];

  if (!contact) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      title={
        <div className="flex items-center">
          <svg
            className="w-6 h-6 mr-2 text-green-600"
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
          Phản hồi tin nhắn
        </div>
      }
      centered>
      <div>
        {/* Thông tin tin nhắn gốc */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {contact.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">{contact.name}</p>
              <p className="text-sm text-gray-500">{contact.email}</p>
            </div>
          </div>
          {contact.subject && (
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Chủ đề:</span> {contact.subject}
            </p>
          )}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
              {contact.message}
            </p>
          </div>
        </div>

        {/* Mẫu phản hồi nhanh */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Mẫu phản hồi nhanh:</p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => setReplyContent(reply.content)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors">
                {reply.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form phản hồi */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung phản hồi <span className="text-red-500">*</span>
          </label>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Nhập nội dung phản hồi cho khách hàng..."
            rows={6}
            className="text-sm w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all"
          />
          <p className="mt-1 text-sm text-gray-500">
            {replyContent.length} ký tự (tối thiểu 10 ký tự)
          </p>
        </div>

        {/* Option gửi email */}
        <div className="mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="h-6 w-6 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Gửi email phản hồi cho khách hàng</span>
          </label>
          <p className="ml-6 text-sm text-gray-500 mt-1">Email sẽ được gửi đến: {contact.email}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !replyContent.trim()}
            className={`px-6 py-2 rounded-lg text-sm font-medium text-white transition-all flex items-center ${
              submitting || !replyContent.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            }`}>
            {submitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
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
                Đang gửi...
              </>
            ) : (
              <>
                <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Gửi phản hồi
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ContactReplyModal;
