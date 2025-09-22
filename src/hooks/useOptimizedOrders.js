// Hook tích hợp tất cả: WebSocket + Cache + State Management

import { useState, useEffect, useCallback, useRef } from "react";
import orderCacheService from "../services/cache/orderCacheService";
import orderWebSocketClient from "../services/websocket/orderWebSocketClient";
import { ORDER_STATUS } from "../constants/orderConstants";
import { useAuth } from "../hooks/auth/useAuth";

// Disable WebSocket for now since we're using StaffOrderWebSocketService instead
const USE_WEBSOCKET = false; // import.meta.env.VITE_USE_WEBSOCKET === "true";

export const useOptimizedOrders = (initialTab = "processing") => {
  const { user } = useAuth();

  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [orders, setOrders] = useState({
    processing: [],
    confirmed: [],
    delivering: [],
    completed: [],
    cancelled: [],
  });
  // console.log("Initial orders state:", orders);
  const [stats, setStats] = useState({
    processingOrders: 0,
    confirmedOrders: 0,
    deliveringOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [webSocketConnected, setWebSocketConnected] = useState(false); // Add WebSocket connection state

  // Refs cho cleanup
  const wsUnsubscribers = useRef([]);
  const cacheUnsubscribers = useRef([]);

  // Map tab names to order statuses
  const statusMap = {
    processing: ORDER_STATUS.PROCESSING,
    confirmed: ORDER_STATUS.CONFIRMED,
    delivering: ORDER_STATUS.DELIVERING,
    completed: ORDER_STATUS.COMPLETED,
    cancelled: ORDER_STATUS.CANCELLED,
  };

  // Cập nhật orders và stats từ dữ liệu nhận được
  const updateOrdersData = useCallback((data) => {
    if (data.ordersByStatus) {
      setOrders({
        processing: data.ordersByStatus.PROCESSING || [],
        confirmed: data.ordersByStatus.CONFIRMED || [],
        delivering: data.ordersByStatus.DELIVERING || [],
        completed: data.ordersByStatus.COMPLETED || [],
        cancelled: data.ordersByStatus.CANCELLED || [],
      });
    }

    if (data.stats) {
      setStats(data.stats);
    }

    setLastUpdated(new Date());
    setLoading(false);
    setError(null);
  }, []);

  // Xử lý lỗi
  const handleError = useCallback((errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  }, []);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await orderCacheService.getAllOrdersGrouped();

      if (result.success) {
        updateOrdersData(result.data);
      } else {
        handleError(result.message || "Không thể tải dữ liệu đơn hàng");
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      handleError("Có lỗi xảy ra khi tải dữ liệu");
    }
  }, [updateOrdersData, handleError]);

  // Refresh data
  const refreshData = useCallback(
    async (force = false) => {
      try {
        setLoading(true); // Bắt đầu loading ngay lập tức
        setError(null); // Clear error trước đó

        const result = await orderCacheService.getAllOrdersGrouped(force);

        if (result.success) {
          updateOrdersData(result.data);
          // console.log("Data refreshed", result.fromCache ? "(from cache)" : "(from API)");
        } else {
          handleError(result.message || "Không thể làm mới dữ liệu");
        }
      } catch (error) {
        console.error("Error refreshing data:", error);
        handleError("Có lỗi xảy ra khi làm mới dữ liệu");
      } finally {
        setLoading(false); // Kết thúc loading
      }
    },
    [updateOrdersData, handleError]
  );

  // Setup WebSocket real-time updates
  const setupWebSocket = useCallback(async () => {
    if (!user?.accessToken || !import.meta.env.VITE_ENABLE_WEBSOCKET) return;

    try {
      const success = await orderWebSocketClient.initialize(user.accessToken);
      if (!success) {
        console.warn("Failed to initialize WebSocket, falling back to polling only");
        return;
      }

      // Handle real-time orders updates
      orderWebSocketClient.onOrdersUpdate((updatedOrders) => {
        console.log("Received orders update via WebSocket:", updatedOrders);
        orderCacheService.updateCacheWithServerData(updatedOrders);
        setOrders(updatedOrders);
        setLastUpdated(Date.now());
      });

      // Handle individual order status changes
      orderWebSocketClient.onOrderStatusChanged((orderUpdate) => {
        console.log("Received order status change via WebSocket:", orderUpdate);
        orderCacheService.updateOrderInCache(orderUpdate);

        setOrders((prevOrders) => {
          const newOrders = { ...prevOrders };
          Object.keys(newOrders).forEach((status) => {
            const orderIndex = newOrders[status].findIndex((order) => order.id === orderUpdate.id);
            if (orderIndex !== -1) {
              // Remove from old status
              newOrders[status] = newOrders[status].filter((order) => order.id !== orderUpdate.id);
            }
          });

          // Add to new status
          if (!newOrders[orderUpdate.status]) {
            newOrders[orderUpdate.status] = [];
          }
          newOrders[orderUpdate.status].unshift(orderUpdate);

          return newOrders;
        });
        setLastUpdated(Date.now());
      });

      // Handle new orders
      orderWebSocketClient.onNewOrder((newOrder) => {
        console.log("Received new order via WebSocket:", newOrder);
        orderCacheService.addOrderToCache(newOrder);

        setOrders((prevOrders) => ({
          ...prevOrders,
          [newOrder.status]: [newOrder, ...(prevOrders[newOrder.status] || [])],
        }));
        setLastUpdated(Date.now());
      });

      // Handle cancelled orders
      orderWebSocketClient.onOrderCancelled((cancelledOrder) => {
        console.log("Received order cancellation via WebSocket:", cancelledOrder);
        orderCacheService.removeOrderFromCache(cancelledOrder.id);

        setOrders((prevOrders) => {
          const newOrders = { ...prevOrders };
          Object.keys(newOrders).forEach((status) => {
            newOrders[status] = newOrders[status].filter((order) => order.id !== cancelledOrder.id);
          });
          return newOrders;
        });
        setLastUpdated(Date.now());
      });

      setWebSocketConnected(true);
      console.log("WebSocket setup completed successfully");
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
      setWebSocketConnected(false);
    }
  }, [user?.accessToken]); // Setup cache listeners
  const setupCacheListeners = useCallback(() => {
    const unsubscribeAll = orderCacheService.addListener("all", updateOrdersData);
    const unsubscribeOrderUpdated = orderCacheService.addListener("orderUpdated", (data) => {
      // Cập nhật UI ngay lập tức thay vì gọi refreshData()
      if (data && data.order) {
        const { order, oldStatus, newStatus } = data;

        setOrders((prevOrders) => {
          const newOrders = { ...prevOrders };

          // Nếu status thay đổi, di chuyển order giữa các tab
          if (oldStatus && oldStatus !== newStatus) {
            // Xóa khỏi tab cũ
            const oldStatusKey = oldStatus.toLowerCase();
            if (newOrders[oldStatusKey]) {
              const oldLength = newOrders[oldStatusKey].length;
              newOrders[oldStatusKey] = newOrders[oldStatusKey].filter(
                (o) => (o.orderId || o.id) !== (order.orderId || order.id)
              );
            }

            // Thêm vào tab mới
            const newStatusKey = newStatus.toLowerCase();
            if (newOrders[newStatusKey]) {
              // Kiểm tra xem order đã tồn tại chưa
              const existingIndex = newOrders[newStatusKey].findIndex(
                (o) => (o.orderId || o.id) === (order.orderId || order.id)
              );

              if (existingIndex !== -1) {
                // Cập nhật order hiện có
                newOrders[newStatusKey][existingIndex] = order;
              } else {
                // Thêm order mới vào đầu danh sách
                const oldLength = newOrders[newStatusKey].length;
                newOrders[newStatusKey] = [order, ...newOrders[newStatusKey]];
              }
            }
          } else {
            // Chỉ cập nhật thông tin order trong cùng tab
            Object.keys(newOrders).forEach((statusKey) => {
              const orderIndex = newOrders[statusKey].findIndex(
                (o) => (o.orderId || o.id) === (order.orderId || order.id)
              );
              if (orderIndex !== -1) {
                newOrders[statusKey][orderIndex] = order;
              }
            });
          }
          return newOrders;
        });

        // Cập nhật stats ngay sau khi cập nhật orders
        setTimeout(() => {
          setStats((prevStats) => {
            // Lấy orders mới nhất
            setOrders((currentOrders) => {
              const newStats = {
                processingOrders: currentOrders.processing?.length || 0,
                confirmedOrders: currentOrders.confirmed?.length || 0,
                deliveringOrders: currentOrders.delivering?.length || 0,
                completedOrders: currentOrders.completed?.length || 0,
                cancelledOrders: currentOrders.cancelled?.length || 0,
              };
              setStats(newStats);
              return currentOrders;
            });
            return prevStats;
          });
        }, 0);

        setLastUpdated(new Date());
      }
    });

    cacheUnsubscribers.current = [unsubscribeAll, unsubscribeOrderUpdated];
  }, [updateOrdersData]);

  // Initialize
  useEffect(() => {
    fetchInitialData();
    setupCacheListeners();
    setupWebSocket();

    return () => {
      // Cleanup WebSocket
      wsUnsubscribers.current.forEach((unsubscribe) => unsubscribe());
      if (USE_WEBSOCKET) {
        orderWebSocketClient.disconnect();
      }

      // Cleanup cache listeners
      cacheUnsubscribers.current.forEach((unsubscribe) => unsubscribe());
    };
  }, [fetchInitialData, setupCacheListeners, setupWebSocket]);

  // Get current tab orders
  const getCurrentOrders = useCallback(() => {
    return orders[selectedTab] || [];
  }, [orders, selectedTab]);

  // Manual refresh function
  const manualRefresh = useCallback(() => {
    refreshData(true);
  }, [refreshData]);

  // Update order status optimistically với cập nhật UI ngay lập tức
  const updateOrderStatus = useCallback(
    async (orderIdentifier, newStatus, note = "") => {
      try {
        // Tìm order cần cập nhật từ tất cả các tab
        // orderIdentifier có thể là orderId hoặc orderCode
        let orderToUpdate = null;
        let currentStatus = null;

        Object.keys(orders).forEach((statusKey) => {
          const foundOrder = orders[statusKey].find((order) => {
            const matchOrderId = (order.orderId || order.id) === orderIdentifier;
            const matchOrderCode = order.orderCode === orderIdentifier;
            const matchId = order.id === orderIdentifier;
            return matchOrderId || matchOrderCode || matchId;
          });
          if (foundOrder) {
            orderToUpdate = foundOrder;
            currentStatus = statusKey.toUpperCase();
          }
        });

        if (orderToUpdate) {
          const updatedOrder = {
            ...orderToUpdate,
            status: newStatus,
            staffNote: note,
            updatedAt: new Date(),
          };

          // Cập nhật cache trước
          orderCacheService.updateOrderInCache(updatedOrder);
          // Cập nhật UI ngay lập tức (optimistic update)
          setOrders((prevOrders) => {
            const newOrders = { ...prevOrders };
            // Xóa từ status cũ
            if (currentStatus) {
              const oldStatusKey = currentStatus.toLowerCase();
              const oldLength = newOrders[oldStatusKey]?.length || 0;
              newOrders[oldStatusKey] = newOrders[oldStatusKey].filter(
                (o) => (o.orderId || o.id) !== (orderToUpdate.orderId || orderToUpdate.id)
              );
            }

            // Thêm vào status mới
            const newStatusKey = newStatus.toLowerCase();
            if (newOrders[newStatusKey]) {
              const oldLength = newOrders[newStatusKey]?.length || 0;
              newOrders[newStatusKey] = [updatedOrder, ...newOrders[newStatusKey]];
            }
            return newOrders;
          });

          // Cập nhật stats ngay lập tức
          setStats((prevStats) => {
            const newStats = { ...prevStats };

            // Giảm count của status cũ
            if (currentStatus) {
              const oldStatusCount = `${currentStatus.toLowerCase()}Orders`;
              if (newStats[oldStatusCount]) {
                const oldCount = newStats[oldStatusCount];
                newStats[oldStatusCount] = Math.max(0, newStats[oldStatusCount] - 1);
              }
            }

            // Tăng count của status mới
            const newStatusCount = `${newStatus.toLowerCase()}Orders`;
            if (newStats[newStatusCount] !== undefined) {
              const oldCount = newStats[newStatusCount];
              newStats[newStatusCount] = newStats[newStatusCount] + 1;
            }
            return newStats;
          });

          setLastUpdated(new Date());
        } else {
          console.log("Order not found in any tab", { orderIdentifier, availableOrders: orders });
        }

        // Send to server
        if (USE_WEBSOCKET) {
          orderWebSocketClient.updateOrderStatus(orderIdentifier, newStatus, note);
        } else {
          // Use regular API call
          const { updateStaffOrderStatus } = await import("../services/service/staffOrderService");

          // API cần orderCode, không phải orderId
          const apiOrderCode = orderToUpdate
            ? orderToUpdate.orderCode || orderIdentifier
            : orderIdentifier;
          const result = await updateStaffOrderStatus(apiOrderCode, newStatus, note);

          if (!result.success) {
            // Revert optimistic update on failure
            console.error("Failed to update order status:", result.message);
            refreshData(true);
            throw new Error(result.message);
          }
        }

        return { success: true };
      } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false, message: error.message };
      }
    },
    [orders, refreshData]
  );

  return {
    // State
    selectedTab,
    setSelectedTab,
    orders: getCurrentOrders(),
    allOrders: orders,
    stats,
    loading,
    error,
    lastUpdated,

    // Actions
    refreshData: manualRefresh,
    updateOrderStatus,

    // Utils
    webSocketConnected, // Add WebSocket connection status
    connectionStatus: USE_WEBSOCKET ? orderWebSocketClient.getConnectionStatus() : null,
    cacheInfo: orderCacheService.getCacheInfo(),
  };
};
