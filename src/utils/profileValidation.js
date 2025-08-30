export const validateFullName = (fullName) => {
  if (!fullName || fullName.trim() === "") {
    return "Vui lòng nhập họ và tên";
  }
  if (fullName.trim().length < 2) {
    return "Họ và tên phải có ít nhất 2 ký tự";
  }
  if (fullName.trim().length > 50) {
    return "Họ và tên không được vượt quá 50 ký tự";
  }
  // Kiểm tra ký tự đặc biệt (chỉ cho phép chữ cái, khoảng trắng và một số ký tự Việt Nam)
  const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
  if (!nameRegex.test(fullName.trim())) {
    return "Họ và tên chỉ được chứa chữ cái và khoảng trắng";
  }
  return "";
};

export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber || phoneNumber.trim() === "") {
    return "Vui lòng nhập số điện thoại";
  }

  // Loại bỏ khoảng trắng và ký tự đặc biệt
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");

  // Kiểm tra định dạng số điện thoại Việt Nam
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  if (!phoneRegex.test(cleanPhone)) {
    return "Số điện thoại không đúng định dạng (VD: 0901234567)";
  }

  return "";
};

export const validateAddress = (address) => {
  if (!address || address.trim() === "") {
    return "Vui lòng nhập địa chỉ";
  }
  if (address.trim().length < 10) {
    return "Địa chỉ phải có ít nhất 10 ký tự";
  }
  if (address.trim().length > 200) {
    return "Địa chỉ không được vượt quá 200 ký tự";
  }
  return "";
};

export const validateAvatarFile = (file) => {
  if (!file) {
    return "";
  }

  // Kiểm tra kích thước file (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return "Kích thước file không được vượt quá 5MB";
  }

  // Kiểm tra định dạng file
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return "Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)";
  }

  return "";
};

// Validate toàn bộ profile form
export const validateProfileForm = (profileData) => {
  return {
    fullName: validateFullName(profileData.fullName),
    phoneNumber: validatePhoneNumber(profileData.phoneNumber),
    address: validateAddress(profileData.address),
  };
};

// Kiểm tra có lỗi nào không
export const hasValidationErrors = (errors) => {
  return Object.values(errors).some((error) => error !== "");
};
