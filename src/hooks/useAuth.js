// src/hooks/useAuth.js
// Custom hook mẫu cho xác thực người dùng với Redux store
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "../store/slices/authSlice";

export function useAuth() {
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  const handleLogin = (credentials) => {
    dispatch(login(credentials));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
  };
}
