import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/slices/authSlice";

export default function AuthLoader({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");

    if (token && userStr && userStr !== "undefined") {
      try {
        const user = JSON.parse(userStr);
        dispatch(loginSuccess({ accessToken: token, user }));
      } catch (err) {
        console.error("Lỗi parse user từ localStorage:", err);
      }
    }
  }, []);

  return children;
}
