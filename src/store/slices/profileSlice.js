import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Profile data
  profileData: {
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    address: "",
    avatarUrl: "",
  },

  // Validation errors
  errors: {
    fullName: "",
    phoneNumber: "",
    address: "",
    avatar: "",
  },

  // Loading states
  loading: {
    updateProfile: false,
    uploadAvatar: false,
  },

  // Success messages
  successMessages: {
    updateProfile: "",
    uploadAvatar: "",
  },
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    // Set profile data
    setProfileData: (state, action) => {
      state.profileData = { ...state.profileData, ...action.payload };
    },

    // Update single field
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state.profileData[field] = value;
    },

    // Set validation errors
    setErrors: (state, action) => {
      state.errors = { ...state.errors, ...action.payload };
    },

    // Clear single error
    clearError: (state, action) => {
      const field = action.payload;
      state.errors[field] = "";
    },

    // Clear all errors
    clearAllErrors: (state) => {
      state.errors = {
        fullName: "",
        phoneNumber: "",
        address: "",
        avatar: "",
      };
    },

    // Set loading states
    setLoading: (state, action) => {
      const { type, loading } = action.payload;
      state.loading[type] = loading;
    },

    // Set success messages
    setSuccessMessage: (state, action) => {
      const { type, message } = action.payload;
      state.successMessages[type] = message;
    },

    // Clear success messages
    clearSuccessMessage: (state, action) => {
      const type = action.payload;
      state.successMessages[type] = "";
    },

    // Reset state
    resetProfileState: (state) => {
      return initialState;
    },
  },
});

export const {
  setProfileData,
  updateField,
  setErrors,
  clearError,
  clearAllErrors,
  setLoading,
  setSuccessMessage,
  clearSuccessMessage,
  resetProfileState,
} = profileSlice.actions;

export default profileSlice.reducer;
