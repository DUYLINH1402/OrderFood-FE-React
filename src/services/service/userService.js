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
export const uploadAvatar = async (file, token) => {
  return useFirebase
    ? await uploadAvatarFromFirebase(file, token)
    : await uploadAvatarApi(file, token);
};
// CHANGEPASSWORD
export const changePassword = async (data, token) => {
  return useFirebase
    ? await changePasswordFromFirebase(data, token)
    : await changePasswordApi(data, token);
};

// GET ALL USERS (for Admin)
// export const getAllUsers = async (token) => {
//   return useFirebase
//     ? await getAllUsersFromFirebase(token)
//     : await getAllUsersApi(token);
// };

//  UPDATE USER STATUS (for Admin)
// export const updateUserStatus = async (userId, status, token) => {
//   return useFirebase
//     ? await updateUserStatusFromFirebase(userId, status, token)
//     : await updateUserStatusApi(userId, status, token);
// };
