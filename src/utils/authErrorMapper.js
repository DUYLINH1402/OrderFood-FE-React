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

    case "USER_LOCKED":
      return { login: "Tài khoản đã bị khóa" };

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
    default:
      return { general: errorCode };
  }
};
