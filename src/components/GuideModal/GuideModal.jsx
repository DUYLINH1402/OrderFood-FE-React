import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Fab, Zoom, Button } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import styles from "./GuideModal.module.scss";

import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
const GuideModal = ({ autoOpen = false }) => {
  // State quản lý trạng thái mở/đóng của Modal
  const [isClosing, setIsClosing] = useState(false); // Trạng thái thu nhỏ (animation khi đóng)
  const [isOpening, setIsOpening] = useState(false); // Trạng thái phóng to (animation khi mở lại)
  const [open, setOpen] = useState(false); // Mặc định đóng, chỉ mở khi autoOpen=true

  useEffect(() => {
    // Chỉ tự động mở khi autoOpen=true (tức là ở trang checkout)
    if (autoOpen) {
      setOpen(true);
    }
  }, [autoOpen]);

  // Hàm xử lý đóng Modal
  const handleClose = () => {
    setIsClosing(true); // Kích hoạt hiệu ứng thu nhỏ
    setTimeout(() => {
      setOpen(false); // Đóng Modal sau khi hoàn tất hiệu ứng
      setIsClosing(false); // Reset trạng thái animation
    }, 500); // Thời gian animation (500ms)
  };

  // Hàm xử lý mở lại Modal
  const handleReopen = () => {
    setIsOpening(true); // Kích hoạt hiệu ứng phóng to
    setOpen(true); // Hiển thị Modal
    setTimeout(() => {
      setIsOpening(false); // Reset trạng thái animation
    }, 500); // Thời gian animation (500ms)
  };
  // Hàm sao chép nội dung vào clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép!"); // Thông báo người dùng
  };
  return (
    <>
      {/* Hiển thị Modal (Dialog) nếu đang mở hoặc trong trạng thái animation */}
      {(open || isClosing || isOpening) && (
        <Dialog
          open={open} // Trạng thái mở/đóng của Modal
          onClose={handleClose} // Đóng Modal khi nhấn overlay
          disableScrollLock={true} // Không khóa cuộn trang khi Modal hiển thị
          scroll="body" // Nội dung Modal không khóa cuộn
          maxWidth="sm" // Giới hạn chiều rộng tối đa
          fullWidth // Cho phép Modal chiếm toàn bộ chiều rộng trên mobile
          PaperProps={{
            // Gán class animation cho phần tử Modal
            className: `${isClosing ? styles.modalShrink : ""} ${
              isOpening ? styles.modalExpand : ""
            }`,
            style: {
              minWidth: "300px", // Đảm bảo modal không quá nhỏ
            },
          }}
          aria-labelledby="guide-modal-title" // Thẻ `aria` để tăng khả năng truy cập
        >
          {/* Tiêu đề của Modal */}
          <DialogTitle
            id="guide-modal-title"
            className="text-center  font-bold text-[#199b7e] relative py-4 border-b border-gray-200">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">Hướng dẫn đặt món ăn</span>
            </div>
            {/* Nút đóng Modal */}
            <IconButton
              aria-label="close"
              onClick={handleClose}
              className="!absolute !top-3 !right-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          {/* Nội dung Modal */}
          <DialogContent>
            <p className="text-justify mb-4 leading-7 font-semibold text-md md:text-base">
              Chào mừng bạn đến với hệ thống đặt món ăn online! Dưới đây là hướng dẫn chi tiết để
              bạn có thể đặt món thành công.
            </p>

            <div className="relative mb-6 leading-7 text-gray-700 text-md">
              <strong className="text-justify mb-3 leading-7 font-semibold text-md md:text-base block">
                1. Cách đặt món ăn:
              </strong>
              <ul className="ml-5 leading-7 text-md space-y-2">
                <li>Chọn món ăn yêu thích từ thực đơn</li>
                <li>Thêm vào giỏ hàng và điều chỉnh số lượng</li>
                <li>Tiến hành thanh toán và điền thông tin giao hàng</li>
                <li>Chọn phương thức thanh toán phù hợp</li>
              </ul>
            </div>

            <div className="relative mb-6 leading-7 text-gray-700 text-md">
              <p className="text-justify mb-3 leading-7 font-semibold text-md md:text-base">
                2. Thông tin thẻ thanh toán thử nghiệm (Visa/Master/JCB):
              </p>
              <div className="text-md space-y-3">
                <div>
                  <strong className="italic text-[#199b7e] text-md md:text-base">Số thẻ:</strong>{" "}
                  4111111111111111{" "}
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    className="!p-0 !text-md !ml-2 !mb-1 !normal-case !text-[#199b7e] hover:!bg-green-50"
                    onClick={() => handleCopy("4111111111111111")}>
                    Copy
                  </Button>
                </div>
                <div>
                  <strong className="italic text-[#199b7e] text-md md:text-base">
                    Tên chủ thẻ:
                  </strong>{" "}
                  NGUYEN VAN A{" "}
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    className="!p-0 !text-md !ml-2 !mb-1 !normal-case !text-[#199b7e] hover:!bg-green-50"
                    onClick={() => handleCopy("NGUYEN VAN A")}>
                    Copy
                  </Button>
                </div>
                <div>
                  <strong className="italic text-[#199b7e] text-md md:text-base">
                    Ngày hết hạn:
                  </strong>{" "}
                  01/26
                </div>
                <div>
                  <strong className="italic text-[#199b7e] text-md md:text-base">CVV:</strong> 123
                </div>
                <div>
                  <span className="text-red-600 text-sm md:text-md">
                    Lưu ý: Đây là thông tin thẻ demo để test thanh toán
                  </span>
                </div>
              </div>
              <FontAwesomeIcon
                icon={faCheck}
                className="absolute top-1/2 right-0 text-xl text-[#07bc0c] border border-[#07bc0c] rounded p-1 hidden md:block"
              />
            </div>

            <div className="relative mb-6 leading-7 text-gray-700 text-md">
              <strong className="text-justify mb-3 leading-7 font-semibold text-md md:text-base block">
                3. Thông tin thanh toán ZaloPay:
              </strong>
              <div className="mt-3">
                <a
                  href="https://beta-docs.zalopay.vn/docs/developer-tools/test-instructions/test-wallets/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#199b7e] no-underline text-md hover:underline transition-all duration-200">
                  Tải App ZaloPay thử nghiệm tại đây
                </a>
              </div>
            </div>

            <div className="relative mb-6 leading-7 text-gray-700 text-md">
              <strong className="text-justify mb-3 leading-7 font-semibold text-md md:text-base block">
                4. Hỗ trợ khách hàng:
              </strong>
              <div className="mt-3 text-justify leading-7">
                Nếu bạn gặp vấn đề trong quá trình đặt món, vui lòng liên hệ với chúng tôi qua
                email:{" "}
                <Link
                  to="mailto:support@foodorder.com"
                  className="text-[#199b7e] text-md hover:underline font-medium transition-all duration-200">
                  support@foodorder.com
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Floating Action Button (FAB) để mở lại Modal */}
      {!open && !isOpening && (
        <Zoom in>
          <Fab
            onClick={handleReopen}
            className="!fixed !bottom-6 !left-3 !z-[1000] !w-12 !h-12 md:!w-14 md:!h-14 !bg-[#199b7e] hover:!bg-[#07bc0c] !text-white"
            sx={{
              backgroundColor: "#199b7e",
              color: "white",
              "&:hover": {
                backgroundColor: "#07bc0c",
              },
            }}>
            <HelpOutlineIcon className="help-icon !text-2xl md:!text-3xl" />
          </Fab>
        </Zoom>
      )}
    </>
  );
};

export default GuideModal;
