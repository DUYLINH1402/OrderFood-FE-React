import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess, logout } from "../store/slices/authSlice";

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const userStr = localStorage.getItem("user");

        if (token && userStr && userStr !== "undefined") {
          const userData = JSON.parse(userStr);
          dispatch(loginSuccess({ user: userData, accessToken: token }));
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  const value = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    logout: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      dispatch(logout());
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
