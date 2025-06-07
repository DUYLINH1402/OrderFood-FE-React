const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";

import {
  getProfileApi,
  updateProfileApi,
  uploadAvatarApi,
  changePasswordApi,
} from "../api/userApi";

// LẤY THÔNG TIN USER
export const getProfile = async (cartItems, token) => {
  return useFirebase
    ? await getProfileFromFirebase(cartItems, token)
    : await getProfileApi(cartItems, token);
};
// CHỈNH SỬA THÔNG TIN USER
export const updateProfile = async (cartItems, token) => {
  return useFirebase
    ? await updateProfileFromFirebase(cartItems, token)
    : await updateProfileApi(cartItems, token);
};
// UPLOAD AVATAR USER
export const uploadAvatar = async (cartItems, token) => {
  return useFirebase
    ? await uploadAvatarFromFirebase(cartItems, token)
    : await uploadAvatarApi(cartItems, token);
};
// CHANGEPASSWORD
export const changePassword = async (data, token) => {
  return useFirebase
    ? await changePasswordFromFirebase(data, token)
    : await changePasswordApi(data, token);
};
