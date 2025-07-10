import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/slices/authSlice";
import { getFavorites } from "../services/service/favoriteService";
import { setFavorites } from "../store/slices/favoriteSlice";

export default function AuthLoader({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");

    if (token && userStr && userStr !== "undefined") {
      try {
        const user = JSON.parse(userStr);
        dispatch(loginSuccess({ accessToken: token, user }));

        //  Gọi API lấy danh sách yêu thích - sử dụng apiClient
        const fetchFavorites = async () => {
          try {
            const res = await getFavorites(); // Không cần truyền token nữa
            dispatch(setFavorites(res.data));
          } catch (err) {
            console.error("Lỗi khi load favorites:", err);
            // Nếu lỗi JWT, apiClient sẽ tự xử lý logout
          }
        };

        fetchFavorites();
      } catch (err) {
        console.error("Lỗi parse user từ localStorage:", err);
        // Clear invalid data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    }
  }, []);

  return children;
}
