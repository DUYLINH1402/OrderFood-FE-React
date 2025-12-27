import { db } from "./firebaseConfig";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";

const COLLECTION_NAME = "feedbacks";

// LẤY TẤT CẢ FEEDBACK
export const getAllFeedbacksFromFirebase = async () => {
  try {
    const feedbacksRef = collection(db, COLLECTION_NAME);
    const q = query(feedbacksRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting feedbacks from Firebase:", error);
    return [];
  }
};

// LẤY FEEDBACK THEO ID
export const getFeedbackByIdFromFirebase = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting feedback by id from Firebase:", error);
    return null;
  }
};

// TẠO FEEDBACK MỚI
export const createFeedbackInFirebase = async (data) => {
  try {
    const feedbacksRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(feedbacksRef, {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return {
      id: docRef.id,
      ...data,
    };
  } catch (error) {
    console.error("Error creating feedback in Firebase:", error);
    throw error;
  }
};

// CẬP NHẬT FEEDBACK
export const updateFeedbackInFirebase = async (id, data) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return {
      id,
      ...data,
    };
  } catch (error) {
    console.error("Error updating feedback in Firebase:", error);
    throw error;
  }
};

// XÓA FEEDBACK
export const deleteFeedbackInFirebase = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting feedback from Firebase:", error);
    throw error;
  }
};
