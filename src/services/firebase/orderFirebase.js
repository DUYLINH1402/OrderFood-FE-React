// src/services/firebase/orderFirebase.js
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { ORDER_STATUS } from "../../constants/orderConstants";

const ORDERS_COLLECTION = "orders";

// TẠO ĐƠN HÀNG FIREBASE
export const createOrderFromFirebase = async (payload) => {
  try {
    const orderData = {
      ...payload,
      status: ORDER_STATUS.PENDING,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      orderCode: `FB${Date.now()}`, // Generate unique order code
    };

    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderData);

    return {
      success: true,
      data: {
        id: docRef.id,
        orderCode: orderData.orderCode,
        ...orderData,
      },
      message: "Đơn hàng đã được tạo thành công",
    };
  } catch (error) {
    console.error("Error creating order in Firebase:", error);
    return {
      success: false,
      message: error.message || "Không thể tạo đơn hàng",
    };
  }
};

// LẤY DANH SÁCH ĐƠN HÀNG FIREBASE
export const getOrdersFromFirebase = async (params = {}) => {
  try {
    const { userId, status, page = 0, size = 10 } = params;

    let q = collection(db, ORDERS_COLLECTION);

    // Filter by userId if provided
    if (userId) {
      q = query(q, where("userId", "==", userId));
    }

    // Filter by status if provided
    if (status && status !== "all") {
      q = query(q, where("status", "==", status.toUpperCase()));
    }

    // Order by creation date (newest first)
    q = query(q, orderBy("createdAt", "desc"));

    // Apply pagination
    if (page > 0) {
      // For pagination, you'd need to implement cursor-based pagination
      // This is a simplified version
      q = query(q, limit(size));
    } else {
      q = query(q, limit(size));
    }

    const querySnapshot = await getDocs(q);
    const orders = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      });
    });

    return {
      success: true,
      data: orders,
      pagination: {
        page,
        size,
        total: orders.length, // Note: Firebase doesn't provide total count easily
        totalPages: Math.ceil(orders.length / size),
      },
    };
  } catch (error) {
    console.error("Error fetching orders from Firebase:", error);
    return {
      success: false,
      message: error.message || "Không thể tải danh sách đơn hàng",
    };
  }
};

// LẤY CHI TIẾT ĐƠN HÀNG FIREBASE
export const getOrderByIdFromFirebase = async (orderId) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const orderData = docSnap.data();
      return {
        success: true,
        data: {
          id: docSnap.id,
          ...orderData,
          createdAt: orderData.createdAt?.toDate(),
          updatedAt: orderData.updatedAt?.toDate(),
        },
      };
    } else {
      return {
        success: false,
        message: "Không tìm thấy đơn hàng",
      };
    }
  } catch (error) {
    console.error("Error fetching order by ID from Firebase:", error);
    return {
      success: false,
      message: error.message || "Không thể tải chi tiết đơn hàng",
    };
  }
};

// CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG FIREBASE
export const updateOrderStatusFromFirebase = async (orderId, statusData) => {
  try {
    const { status, note } = statusData;

    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status: status.toUpperCase(),
      statusNote: note || "",
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
    };
  } catch (error) {
    console.error("Error updating order status in Firebase:", error);
    return {
      success: false,
      message: error.message || "Không thể cập nhật trạng thái đơn hàng",
    };
  }
};

// HỦY ĐƠN HÀNG FIREBASE
export const cancelOrderFromFirebase = async (orderId, cancelReason) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status: ORDER_STATUS.CANCELLED,
      cancelReason: cancelReason || "",
      cancelledAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
      message: "Hủy đơn hàng thành công",
    };
  } catch (error) {
    console.error("Error cancelling order in Firebase:", error);
    return {
      success: false,
      message: error.message || "Không thể hủy đơn hàng",
    };
  }
};

// LẤY THỐNG KÊ ĐƠN HÀNG FIREBASE
export const getOrderStatisticsFromFirebase = async (userId) => {
  try {
    let q = collection(db, ORDERS_COLLECTION);

    if (userId) {
      q = query(q, where("userId", "==", userId));
    }

    const querySnapshot = await getDocs(q);
    const statistics = {
      totalOrders: 0,
      confirmedOrders: 0,
      shippingOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      totalSpent: 0,
    };

    querySnapshot.forEach((doc) => {
      const order = doc.data();
      statistics.totalOrders++;

      switch (order.status) {
        case ORDER_STATUS.CONFIRMED:
          statistics.confirmedOrders++;
          break;
        case ORDER_STATUS.SHIPPING:
          statistics.shippingOrders++;
          break;
        case ORDER_STATUS.DELIVERED:
          statistics.deliveredOrders++;
          statistics.totalSpent += order.totalPrice || 0;
          break;
        case ORDER_STATUS.CANCELLED:
          statistics.cancelledOrders++;
          break;
      }
    });

    return {
      success: true,
      data: statistics,
    };
  } catch (error) {
    console.error("Error fetching order statistics from Firebase:", error);
    return {
      success: false,
      message: error.message || "Không thể tải thống kê đơn hàng",
    };
  }
};
