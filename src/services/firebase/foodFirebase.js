import { db } from "./firebaseConfig";
import { collection, getDocs, query, where, limit, startAfter, orderBy } from "firebase/firestore";

// LẤY DANH SÁCH MÓN MỚI
export const getNewFoodsFromFirebase = async (page = 0, size = 10) => {
  try {
    const foodsRef = collection(db, "foods");
    const q = query(foodsRef, orderBy("createdAt", "desc"), limit(size));
    const snapshot = await getDocs(q);
    return {
      content: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      totalElements: snapshot.size,
      totalPages: 1,
      number: page,
    };
  } catch (error) {
    console.error("Error getting new foods from Firebase:", error);
    return { content: [], totalElements: 0, totalPages: 0, number: 0 };
  }
};

// LẤY DANH SÁCH MÓN NGON (FEATURED)
export const getFeaturedFoodsFromFirebase = async (page = 0, size = 10) => {
  try {
    const foodsRef = collection(db, "foods");
    const q = query(foodsRef, where("featured", "==", true), limit(size));
    const snapshot = await getDocs(q);
    return {
      content: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      totalElements: snapshot.size,
      totalPages: 1,
      number: page,
    };
  } catch (error) {
    console.error("Error getting featured foods from Firebase:", error);
    return { content: [], totalElements: 0, totalPages: 0, number: 0 };
  }
};

// LẤY DANH SÁCH MÓN ĐƯỢC ƯA THÍCH (BEST SELLER)
export const getBestSellerFoodsFromFirebase = async (page = 0, size = 10) => {
  try {
    const foodsRef = collection(db, "foods");
    const q = query(foodsRef, orderBy("soldCount", "desc"), limit(size));
    const snapshot = await getDocs(q);
    return {
      content: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      totalElements: snapshot.size,
      totalPages: 1,
      number: page,
    };
  } catch (error) {
    console.error("Error getting best seller foods from Firebase:", error);
    return { content: [], totalElements: 0, totalPages: 0, number: 0 };
  }
};

// LẤY TẤT CẢ MÓN ĂN
export const getAllFoodsFromFirebase = async (page = 0, size = 10) => {
  try {
    const foodsRef = collection(db, "foods");
    const q = query(foodsRef, limit(size));
    const snapshot = await getDocs(q);
    return {
      content: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      totalElements: snapshot.size,
      totalPages: 1,
      number: page,
    };
  } catch (error) {
    console.error("Error getting all foods from Firebase:", error);
    return { content: [], totalElements: 0, totalPages: 0, number: 0 };
  }
};

// LẤY MÓN ĂN THEO CATEGORY
export const getFoodsByCategoryFromFirebase = async (categoryId, page = 0, size = 10) => {
  try {
    const foodsRef = collection(db, "foods");
    const q = query(foodsRef, where("categoryId", "==", categoryId), limit(size));
    const snapshot = await getDocs(q);
    return {
      content: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      totalElements: snapshot.size,
      totalPages: 1,
      number: page,
    };
  } catch (error) {
    console.error("Error getting foods by category from Firebase:", error);
    return { content: [], totalElements: 0, totalPages: 0, number: 0 };
  }
};

// LẤY CHI TIẾT MÓN ĂN THEO SLUG
export const getFoodBySlugFromFirebase = async (slug) => {
  try {
    const foodsRef = collection(db, "foods");
    const q = query(foodsRef, where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error("Error getting food by slug from Firebase:", error);
    return null;
  }
};
