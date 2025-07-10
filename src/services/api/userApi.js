import apiClient from "../apiClient";

export const getToken = () => {
  const token = localStorage.getItem("accessToken");
  return token || null;
};

// API Get Profile - Cần token
export const getProfileApi = async () => {
  const response = await apiClient.get("/api/users/profile");
  return response.data; // trả về UserResponse
};

// API Update Profile - Cần token
export const updateProfileApi = async (data) => {
  const response = await apiClient.put("/api/users/update-profile", data);
  return response.data;
};

// API Upload Avatar - Cần token
export const uploadAvatarApi = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/api/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data; // trả về imageUrl từ S3
};

// API Change Password - Cần token
export const changePasswordApi = async (data) => {
  const response = await apiClient.post("/api/users/change-password", data);
  return response.data;
};
