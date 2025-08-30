import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null, // ĐỔI TỪ token THÀNH accessToken để thống nhất
  isLoggedIn: false, // ĐỔI TỪ isAuthenticated THÀNH isLoggedIn để thống nhất
  loading: false,
  error: null,
};

// Helper function to get initial state from localStorage
const getInitialStateFromStorage = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const accessToken = localStorage.getItem("accessToken");

    return {
      ...initialState,
      user,
      accessToken,
      isLoggedIn: !!(user && accessToken),
    };
  } catch (error) {
    console.error("Error loading auth state from localStorage:", error);
    return initialState;
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialStateFromStorage(),
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    loginSuccess: (state, action) => {
      // QUAN TRỌNG: Kiểm tra để tránh update không cần thiết
      const { user, accessToken } = action.payload;

      // Chỉ update nếu thực sự có thay đổi
      if (
        state.isLoggedIn &&
        JSON.stringify(state.user) === JSON.stringify(user) &&
        state.accessToken === accessToken
      ) {
        return; // Không làm gì nếu data giống nhau
      }

      state.loading = false;
      state.isLoggedIn = true;
      state.user = user;
      state.accessToken = accessToken;
      state.error = null;

      // Save to localStorage chỉ khi cần thiết
      try {
        const currentUser = localStorage.getItem("user");
        const currentToken = localStorage.getItem("accessToken");

        if (currentUser !== JSON.stringify(user)) {
          localStorage.setItem("user", JSON.stringify(user));
        }
        if (currentToken !== accessToken) {
          localStorage.setItem("accessToken", accessToken);
        }
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isLoggedIn = false;
      state.loading = false;
      state.error = null;

      // Xóa dữ liệu authentication trong localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("cartItems");
    },

    loginFailure: (state, action) => {
      state.loading = false;
      state.isLoggedIn = false;
      state.user = null;
      state.accessToken = null;
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    setUser: (state, action) => {
      // Kiểm tra để tránh update không cần thiết
      if (JSON.stringify(state.user) !== JSON.stringify(action.payload)) {
        state.user = action.payload;

        // Update localStorage
        try {
          localStorage.setItem("user", JSON.stringify(action.payload));
        } catch (error) {
          console.error("Error updating user in localStorage:", error);
        }
      }
    },

    updateUser: (state, action) => {
      if (state.user) {
        const updatedUser = { ...state.user, ...action.payload };

        // Chỉ update nếu có thay đổi
        if (JSON.stringify(state.user) !== JSON.stringify(updatedUser)) {
          state.user = updatedUser;

          // Update localStorage
          try {
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } catch (error) {
            console.error("Error updating user in localStorage:", error);
          }
        }
      }
    },

    updateAvatar: (state, action) => {
      if (state.user && state.user.avatarUrl !== action.payload.avatarUrl) {
        state.user.avatarUrl = action.payload.avatarUrl;

        // Update localStorage
        try {
          localStorage.setItem("user", JSON.stringify(state.user));
        } catch (error) {
          console.error("Error updating avatar in localStorage:", error);
        }
      }
    },

    // Loại bỏ syncUserFromStorage vì nó có thể gây infinite loop
  },
});

export const {
  loginSuccess,
  logout,
  setUser,
  loginStart,
  loginFailure,
  clearError,
  updateUser,
  updateAvatar,
} = authSlice.actions;
export default authSlice.reducer;
