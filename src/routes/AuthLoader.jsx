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

        //  Gọi API lấy danh sách yêu thích
        const fetchFavorites = async () => {
          try {
            const res = await getFavorites(token);
            dispatch(setFavorites(res.data));
          } catch (err) {
            console.error("Lỗi khi load favorites:", err);
          }
        };

        fetchFavorites();
      } catch (err) {
        console.error("Lỗi parse user từ localStorage:", err);
      }
    }
  }, []);

  return children;
}
