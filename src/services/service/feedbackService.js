const useFirebase = import.meta.env.VITE_USE_FIREBASE === "true";

import {
  getAllFeedbacksFromSQL,
  getFeedbackByIdFromSQL,
  createFeedbackInSQL,
  updateFeedbackInSQL,
  deleteFeedbackInSQL,
} from "../api/feedbackApi";

import {
  getAllFeedbacksFromFirebase,
  getFeedbackByIdFromFirebase,
  createFeedbackInFirebase,
  updateFeedbackInFirebase,
  deleteFeedbackInFirebase,
} from "../firebase/feedbackFirebase";

// LẤY DANH SÁCH FEEDBACK
export const getAllFeedbacks = async () => {
  return useFirebase ? await getAllFeedbacksFromFirebase() : await getAllFeedbacksFromSQL();
};

// LẤY FEEDBACK THEO ID
export const getFeedbackById = async (id) => {
  return useFirebase ? await getFeedbackByIdFromFirebase(id) : await getFeedbackByIdFromSQL(id);
};

// TẠO FEEDBACK MỚI
export const createFeedback = async (data) => {
  return useFirebase ? await createFeedbackInFirebase(data) : await createFeedbackInSQL(data);
};

// CẬP NHẬT FEEDBACK
export const updateFeedback = async (id, data) => {
  return useFirebase
    ? await updateFeedbackInFirebase(id, data)
    : await updateFeedbackInSQL(id, data);
};

// XOÁ FEEDBACK
export const deleteFeedback = async (id) => {
  return useFirebase ? await deleteFeedbackInFirebase(id) : await deleteFeedbackInSQL(id);
};
