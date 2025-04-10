const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";

import { getNewFoodsFromFirebase } from "../firebase/foodFirebase";

import {
  getNewFoodsFromSQL,
  getFeaturedFoodsFromSQL,
  getBestSellerFoodsFromSQL,
} from "../api/foodApi";

export const getNewFoods = async () => {
  return useFirebase ? await getNewFoodsFromFirebase() : await getNewFoodsFromSQL();
};

export const getFeaturedFoods = async () => {
  return useFirebase ? await getFeaturedFoodsFromFirebase() : await getFeaturedFoodsFromSQL();
};

export const getBestSellerFoods = async () => {
  return useFirebase ? await getBestSellerFoodsFromFirebase() : await getBestSellerFoodsFromSQL();
};
