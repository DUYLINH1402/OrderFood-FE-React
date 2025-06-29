import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// LẤY DANH SÁCH QUẬN/HUYỆN
export const getDistrictsFromSQL = async () => {
  const response = await axios.get(`${BASE_URL}/api/districts`);
  //   console.log("Districts response:", response.data);
  return response.data;
};

// LẤY DANH SÁCH PHƯỜNG/XÃ THEO QUẬN/HUYỆN
export const getWardsByDistrictFromSQL = async (districtId) => {
  const response = await axios.get(`${BASE_URL}/api/wards/by-district/${districtId}`);
  return response.data;
};
