import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getToken = () => {
  const token = localStorage.getItem("accessToken");
  return token || null;
};
// API Get Profile
export const getProfileApi = async () => {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/api/users/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Lỗi khi lấy thông tin người dùng");
  }

  return await response.json(); // trả về UserResponse
};

// API Update Profile
export const updateProfileApi = async (data) => {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/api/users/update-profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Lỗi khi cập nhật thông tin người dùng");
  }

  return await response.json();
};

// API Upload Avatar
export const uploadAvatarApi = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();

  const res = await axios.post(`${BASE_URL}/api/users/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data; // trả về imageUrl từ S3
};

// API Change Password
export const changePasswordApi = async (data) => {
  const token = getToken();

  const res = await axios.post(`${BASE_URL}/api/users/change-password`, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
