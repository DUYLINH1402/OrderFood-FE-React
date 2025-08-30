// profileThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { updateProfile, uploadAvatar } from "../../services/service/userService";
import {
  validateProfileForm,
  hasValidationErrors,
  validateFullName,
  validatePhoneNumber,
  validateAddress,
  validateAvatarFile,
} from "../../utils/profileValidation";
import {
  setErrors,
  clearAllErrors,
  setLoading,
  setSuccessMessage,
  setProfileData,
} from "../slices/profileSlice";
import { setUser, updateUser } from "../slices/authSlice";

// Helper function to update user data in localStorage
const updateUserInLocalStorage = (updatedData) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUser = { ...currentUser, ...updatedData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error("Error updating localStorage:", error);
    return null;
  }
};

// Helper function to update auth state in Redux if available
const updateAuthState = (dispatch, getState, updatedUserData) => {
  try {
    console.log("Updating auth state with:", updatedUserData);

    // Dispatch updateUser action trực tiếp
    dispatch(updateUser(updatedUserData));

    console.log("Auth state updated successfully");
  } catch (error) {
    console.error("Error updating auth state:", error);
  }
};

// Thunk để update profile
export const updateProfileThunk = createAsyncThunk(
  "profile/updateProfile",
  async (profileData, { dispatch, getState, rejectWithValue }) => {
    try {
      // Validate dữ liệu
      const errors = validateProfileForm(profileData);

      // Nếu có lỗi validation, reject
      if (hasValidationErrors(errors)) {
        dispatch(setErrors(errors));
        return rejectWithValue("Dữ liệu không hợp lệ");
      }

      // Clear errors nếu validation pass
      dispatch(clearAllErrors());
      dispatch(setLoading({ type: "updateProfile", loading: true }));

      // Gọi API update profile
      const token = getState().auth?.token || localStorage.getItem("accessToken");
      const response = await updateProfile(profileData, token);

      const updatedData = response.data || response;

      // Update profile data trong Redux
      dispatch(setProfileData(updatedData));

      // Update localStorage
      const updatedUser = updateUserInLocalStorage(updatedData);

      // Update auth state in Redux if available
      if (updatedUser) {
        updateAuthState(dispatch, getState, updatedUser);
      }

      dispatch(
        setSuccessMessage({
          type: "updateProfile",
          message: "Cập nhật thông tin thành công!",
        })
      );

      return updatedData;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Có lỗi xảy ra khi cập nhật thông tin";
      dispatch(
        setErrors({
          general: errorMessage,
        })
      );
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading({ type: "updateProfile", loading: false }));
    }
  }
);

// Thunk để upload avatar
export const uploadAvatarThunk = createAsyncThunk(
  "profile/uploadAvatar",
  async (file, { dispatch, getState, rejectWithValue }) => {
    try {
      // Validate file
      const avatarError = validateAvatarFile(file);

      if (avatarError) {
        dispatch(setErrors({ avatar: avatarError }));
        return rejectWithValue(avatarError);
      }

      // Clear avatar error
      dispatch(setErrors({ avatar: "" }));
      dispatch(setLoading({ type: "uploadAvatar", loading: true }));

      // Gọi API upload avatar
      const token = getState().auth?.token || localStorage.getItem("accessToken");
      const response = await uploadAvatar(file, token);

      console.log("Upload response:", response);

      // Lấy avatar URL từ response
      let avatarUrl;

      // Trường hợp 1: Response là string trực tiếp
      if (typeof response === "string" && response.startsWith("http")) {
        avatarUrl = response;
      }
      // Trường hợp 2: Response là object có chứa URL
      else {
        avatarUrl =
          response.avatarUrl ||
          response.data?.avatarUrl ||
          response.imageUrl ||
          response.url ||
          response.data?.imageUrl ||
          response.data?.url;
      }

      console.log("Extracted avatar URL:", avatarUrl);

      if (!avatarUrl) {
        console.error("Response structure:", response);
        throw new Error("Không nhận được URL ảnh từ server");
      }
      const avatarData = { avatarUrl };

      // 1. Update profile slice
      dispatch(setProfileData(avatarData));

      // 2. Update localStorage
      const updatedUser = updateUserInLocalStorage(avatarData);

      // 3. Update auth slice - QUAN TRỌNG (giống ProfileTab)
      const currentAuthUser = getState().auth?.user;
      if (currentAuthUser && updatedUser) {
        dispatch(setUser({ ...currentAuthUser, avatarUrl }));
      }

      dispatch(
        setSuccessMessage({
          type: "uploadAvatar",
          message: "Cập nhật ảnh đại diện thành công!",
        })
      );

      return { avatarUrl };
    } catch (error) {
      console.error("Avatar upload error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Có lỗi xảy ra khi tải ảnh lên";
      dispatch(
        setErrors({
          avatar: errorMessage,
        })
      );
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading({ type: "uploadAvatar", loading: false }));
    }
  }
);

// Thunk để validate field khi blur
export const validateFieldThunk = createAsyncThunk(
  "profile/validateField",
  async ({ fieldName, value }, { dispatch }) => {
    let error = "";
    switch (fieldName) {
      case "fullName":
        error = validateFullName(value);
        break;
      case "phoneNumber":
        error = validatePhoneNumber(value);
        break;
      case "address":
        error = validateAddress(value);
        break;
      default:
        break;
    }

    dispatch(setErrors({ [fieldName]: error }));
    return { fieldName, error };
  }
);

// Thunk để đồng bộ data từ localStorage khi khởi tạo
export const syncProfileFromLocalStorageThunk = createAsyncThunk(
  "profile/syncFromLocalStorage",
  async (_, { dispatch }) => {
    try {
      const userFromLocalStorage = JSON.parse(localStorage.getItem("user") || "{}");

      if (userFromLocalStorage && Object.keys(userFromLocalStorage).length > 0) {
        const profileData = {
          fullName: userFromLocalStorage.fullName || "",
          username: userFromLocalStorage.username || "",
          email: userFromLocalStorage.email || "",
          phoneNumber: userFromLocalStorage.phoneNumber || "",
          address: userFromLocalStorage.address || "",
          avatarUrl: userFromLocalStorage.avatarUrl || "",
        };

        dispatch(setProfileData(profileData));
        return profileData;
      }

      return null;
    } catch (error) {
      console.error("Error syncing from localStorage:", error);
      return null;
    }
  }
);
