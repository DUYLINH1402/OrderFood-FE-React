import { db } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export const getNewFoodsFromFirebase = async () => {
  const snapshot = await getDocs(collection(db, "foods_new"));
  return (snapshot.docs || []).map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
