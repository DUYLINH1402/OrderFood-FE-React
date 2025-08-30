import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../store/slices/authSlice";
import { getFavorites } from "../services/service/favoriteService";
import { setFavorites } from "../store/slices/favoriteSlice";

export default function AuthLoader({ children }) {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Ngăn chặn việc chạy lại nếu đã khởi tạo hoặc đã login
    if (hasInitialized.current || isLoggedIn) {
      return;
    }

    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");

    if (token && userStr && userStr !== "undefined") {
      try {
        const userData = JSON.parse(userStr);

        // Đánh dấu đã khởi tạo trước khi dispatch để tránh loop
        hasInitialized.current = true;

        dispatch(loginSuccess({ accessToken: token, user: userData }));

        // Load favorites sau khi login thành công
        const fetchFavorites = async () => {
          try {
            const res = await getFavorites();
            dispatch(setFavorites(res.data));
          } catch (err) {
            console.error("Lỗi khi load favorites:", err);
          }
        };

        fetchFavorites();
      } catch (err) {
        console.error("Lỗi parse user từ localStorage:", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        hasInitialized.current = true;
      }
    } else {
      // Không có token hợp lệ, đánh dấu đã khởi tạo
      hasInitialized.current = true;
    }
  }, []); // Dependency array rỗng - chỉ chạy một lần

  return children;
}
