import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { syncUserFromStorage } from "../../store/slices/authSlice";
import { syncProfileFromLocalStorageThunk } from "../../store/thunks/profileThunks";

/**
 * Hook để đồng bộ dữ liệu giữa Redux và localStorage
 * Tự động sync khi app khởi tạo và khi localStorage thay đổi
 */
export const useLocalStorageSync = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Sync data khi component mount
  useEffect(() => {
    dispatch(syncUserFromStorage());
    dispatch(syncProfileFromLocalStorageThunk());
  }, [dispatch]);

  // Listen for localStorage changes (from other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user" || e.key === "accessToken") {
        // Re-sync when localStorage changes
        dispatch(syncUserFromStorage());
        dispatch(syncProfileFromLocalStorageThunk());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [dispatch]);

  return { user };
};

// Helper functions để làm việc với localStorage
export const localStorageUtils = {
  // Get user data from localStorage
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
      console.error("Error getting user from localStorage:", error);
      return null;
    }
  },

  // Update user data in localStorage
  updateUser: (userData) => {
    try {
      const currentUser = localStorageUtils.getUser() || {};
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error("Error updating user in localStorage:", error);
      return null;
    }
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem("accessToken");
  },

  // Clear all auth data from localStorage
  clearAuth: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  },

  // Check if user is authenticated based on localStorage
  isAuthenticated: () => {
    const user = localStorageUtils.getUser();
    const token = localStorageUtils.getToken();
    return !!(user && token);
  },
};
