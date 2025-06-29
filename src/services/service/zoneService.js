import { getDistrictsFromSQL, getWardsByDistrictFromSQL } from "../api/zoneApi";

// LẤY DANH SÁCH QUẬN/HUYỆN
export const getDistricts = async () => {
  return await getDistrictsFromSQL();
};

// LẤY DANH SÁCH PHƯỜNG/XÃ THEO QUẬN/HUYỆN
export const getWardsByDistrict = async (districtId) => {
  return await getWardsByDistrictFromSQL(districtId);
};
