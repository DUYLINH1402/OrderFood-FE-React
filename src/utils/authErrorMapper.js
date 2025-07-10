// Hàm ánh xạ lỗi đăng nhập
export const mapLoginError = (errorCode) => {
  switch (errorCode) {
    case "INVALID_CREDENTIALS":
      return {
        password: "Sai mật khẩu",
      };

    case "USER_NOT_FOUND":
      return { login: "Tài khoản không tồn tại" };

    case "EMAIL_NOT_VERIFIED":
      return { login: "Tài khoản chưa được kích hoạt" };
    case "TOO_MANY_REQUESTS_RESEND_VERIFICATION":
      return { login: "Yêu cầu quá 3 lần. Vui lòng thử lại sau" };

    case "USER_LOCKED":
      return { login: "Tài khoản đã bị khóa" };

    case "JWT_TOKEN_EXPIRED":
      return { general: "Phiên đăng nhập đã hết hạn" };

    case "JWT_TOKEN_INVALID":
      return { general: "Token không hợp lệ" };

    default:
      return { general: errorCode }; // fallback: hiển thị lỗi raw nếu không match
  }
};

// Hàm ánh xạ lỗi đăng ký
export const mapRegisterError = (errorCode) => {
  switch (errorCode) {
    case "EMAIL_ALREADY_EXISTS":
      return { email: "Email đã được sử dụng" };
    case "USERNAME_ALREADY_EXISTS":
      return { username: "Username đã tồn tại" };

    case "PASSWORD_INVALID_LENGTH":
      return { password: "Mật khẩu phải có ít nhất 6 ký tự" };
    case "PASSWORD_INVALID_UPPERCASE":
      return { password: "Mật khẩu phải có ít nhất một chữ in hoa" };
    case "PASSWORD_INVALID_NUMBER":
      return { password: "Mật khẩu phải có ít nhất một chữ số" };
    case "PASSWORD_INVALID_EMPTY":
      return { password: "Vui lòng nhập mật khẩu" };

    default:
      return { general: errorCode };
  }
};

// --------------------------------------------
// Gộp tất cả lỗi về 1 hàm duy nhất
export const mapAuthError = (type, errorCode) => {
  const errorMap = {
    login: {
      INVALID_CREDENTIALS: { password: "Sai mật khẩu" },
      USER_NOT_FOUND: { login: "Tài khoản không tồn tại" },
      EMAIL_NOT_VERIFIED: { login: "Tài khoản chưa được kích hoạt" },
      USER_LOCKED: { login: "Tài khoản đã bị khóa" },
      JWT_TOKEN_EXPIRED: { general: "Phiên đăng nhập đã hết hạn" },
      JWT_TOKEN_INVALID: { general: "Token không hợp lệ" },
      TOO_MANY_REQUESTS_RESEND_VERIFICATION: {
        login: "Yêu cầu quá 3 lần. Vui lòng thử lại sau",
      },
    },
    register: {
      EMAIL_ALREADY_EXISTS: { email: "Email đã được sử dụng" },
      USERNAME_ALREADY_EXISTS: { username: "Username đã tồn tại" },
      PASSWORD_INVALID_LENGTH: { password: "Mật khẩu phải có ít nhất 6 ký tự" },
      PASSWORD_INVALID_UPPERCASE: { password: "Mật khẩu phải có ít nhất một chữ in hoa" },
      PASSWORD_INVALID_NUMBER: { password: "Mật khẩu phải có ít nhất một chữ số" },
      PASSWORD_INVALID_EMPTY: { password: "Vui lòng nhập mật khẩu" },
    },
    forgot: {
      EMAIL_NOT_FOUND: { email: "Email không tồn tại trong hệ thống" },
      TOO_MANY_REQUESTS_RESET_PASSWORD: {
        general: "Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau 1 giờ.",
      },
    },
    reset: {
      TOKEN_EXPIRED: { general: "Liên kết đã hết hạn" },
      TOKEN_INVALID: { general: "Liên kết không hợp lệ" },
    },
    change: {
      INVALID_CURRENT_PASSWORD: { currentPassword: "Mật khẩu cũ không đúng" },
      TOO_MANY_REQUESTS_CHANGE_PASSWORD: {
        general: "Bạn đã đổi mật khẩu quá nhiều lần. Vui lòng thử lại sau 1 giờ.",
      },
    },
    resend: {
      EMAIL_NOT_FOUND: { general: "Tài khoản không tồn tại" },
      EMAIL_ALREADY_VERIFIED: { general: "Tài khoản này đã được xác minh." },
      TOO_MANY_REQUESTS_RESEND_VERIFICATION: {
        general: "Yêu cầu quá 3 lần. Vui lòng thử lại sau",
      },
    },
  };

  return errorMap?.[type]?.[errorCode] || { general: errorCode };
};
