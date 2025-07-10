import { publicClient } from "../apiClient";

// LẤY DANH SÁCH QUẬN/HUYỆN - API công khai
export const getDistrictsFromSQL = async () => {
  const response = await publicClient.get("/api/districts");
  return response.data;
};

// LẤY DANH SÁCH PHƯỜNG/XÃ THEO QUẬN/HUYỆN - API công khai
export const getWardsByDistrictFromSQL = async (districtId) => {
  const response = await publicClient.get(`/api/wards/by-district/${districtId}`);
  return response.data;
};
