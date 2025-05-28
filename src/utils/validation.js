// KIỂM TRA EMAIL HOẶC USERNAME
export const validateEmailOrUsername = (value) => {
  if (!value) return "Nhập email hoặc Username";

  const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const usernamePattern = /^[a-zA-Z0-9_]{3,}$/; // ít nhất 3 ký tự, cho phép chữ, số, dấu gạch dưới

  if (emailPattern.test(value)) {
    return ""; // Hợp lệ với email
  } else if (usernamePattern.test(value)) {
    return ""; // Hợp lệ với username
  } else {
    return "Email hoặc Username không hợp lệ";
  }
};

// KIỂM TRA MẬT KHẨU (VÍ DỤ: YÊU CẦU TỐI THIỂU 6 KÝ TỰ)
export const validatePassword = (password) => {
  if (!password) return "Vui lòng nhập mật khẩu";
  return password.length >= 6 ? "" : "Mật khẩu phải có ít nhất 6 ký tự";
};

// HÀM TỔNG HỢP ĐỂ VALIDATE TOÀN BỘ FORM ĐĂNG NHẬP
export const validateLoginForm = ({ emailOrUsername, password }) => {
  return {
    emailOrUsername: validateEmailOrUsername(emailOrUsername),
    password: validatePassword(password),
  };
};

// HÀM KIỂM TRA HỢP LỆ CỦA TRƯỜNG "Username"
export const validateName = (name) => {
  if (!name) return "Vui lòng nhập Username";
  if (name.length < 4) return "Username phải có ít nhất 4 ký tự";
  return "";
};

// HÀM KIỂM TRA HỢP LỆ CỦA TRƯỜNG "EMAIL"
export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!email) return "Vui lòng nhập Email";
  if (!emailRegex.test(email)) return "Email không hợp lệ";
  return "";
};

// HÀM KIỂM TRA HỢP LỆ CỦA TRƯỜNG "NHẬP LẠI MẬT KHẨU"
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return "Vui lòng nhập lại mật khẩu";

  // So sánh "Nhập lại mật khẩu" với "Mật khẩu"
  if (confirmPassword !== password) return "Mật khẩu không khớp";
  return "";
};

// HÀM KIỂM TRA TOÀN BỘ FORM ĐĂNG KÝ
export const validateRegisterForm = ({ username, email, password, confirmPassword }) => {
  return {
    username: validateName(username),
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword: validateConfirmPassword(password, confirmPassword),
  };
};

// HÀM DÙNG CHUNG: Kiểm tra 1 trường khi blur
export const handleFieldBlur = (fieldName, formData) => {
  switch (fieldName) {
    case "login":
      return validateEmailOrUsername(formData.login);
    case "username":
      return validateName(formData.username);
    case "email":
      return validateEmail(formData.email);
    case "password":
      return validatePassword(formData.password);
    case "confirmPassword":
      return validateConfirmPassword(formData.password, formData.confirmPassword);
    default:
      return "";
  }
};
