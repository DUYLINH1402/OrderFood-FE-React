// src/services/cache/orderCacheService.js
class OrderCacheService {
  constructor() {
    this.cache = new Map();
    this.lastUpdated = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.listeners = new Map();
  }

  // Lấy orders từ cache hoặc API
  async getOrdersByStatus(status, forceRefresh = false) {
    const cacheKey = `orders_${status}`;
    const now = Date.now();
    const lastUpdate = this.lastUpdated.get(cacheKey) || 0;

    // Kiểm tra cache còn hợp lệ không
    if (!forceRefresh && this.cache.has(cacheKey) && now - lastUpdate < this.cacheTimeout) {
      console.log(`Cache hit for ${cacheKey}`);
      return {
        success: true,
        data: this.cache.get(cacheKey),
        fromCache: true,
      };
    }

    try {
      // Import service để tránh circular dependency
      const { getAllStaffOrders } = await import("../service/staffOrderService");

      console.log(`Fetching fresh data for ${cacheKey}`);
      const result = await getAllStaffOrders(0, 100);

      if (result.success) {
        // Filter theo status
        const filteredOrders = result.data?.filter((order) => order.status === status) || [];

        // Cập nhật cache
        this.cache.set(cacheKey, filteredOrders);
        this.lastUpdated.set(cacheKey, now);

        // Thông báo cho listeners
        this.notifyListeners(status, filteredOrders);

        return {
          success: true,
          data: filteredOrders,
          fromCache: false,
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error(`Error fetching orders for status ${status}:`, error);
      return {
        success: false,
        message: error.message,
        fromCache: false,
      };
    }
  }

  // Lấy tất cả orders và group theo status
  async getAllOrdersGrouped(forceRefresh = false) {
    try {
      const { getAllStaffOrders } = await import("../service/staffOrderService");
      const cacheKey = "all_orders";
      const now = Date.now();
      const lastUpdate = this.lastUpdated.get(cacheKey) || 0;

      // Kiểm tra cache
      if (!forceRefresh && this.cache.has(cacheKey) && now - lastUpdate < this.cacheTimeout) {
        console.log("Cache hit for all orders");
        return {
          success: true,
          data: this.cache.get(cacheKey),
          fromCache: true,
        };
      }

      console.log("Fetching fresh data for all orders");
      const result = await getAllStaffOrders(0, 100);

      if (result.success) {
        const allOrders = result.data || [];

        // Group theo status
        const ordersByStatus = {
          PROCESSING: [],
          CONFIRMED: [],
          DELIVERING: [],
          COMPLETED: [],
          CANCELLED: [],
        };

        allOrders.forEach((order) => {
          if (ordersByStatus[order.status]) {
            ordersByStatus[order.status].push(order);
          }
        });

        // Tính stats
        const stats = {
          processingOrders: ordersByStatus.PROCESSING.length,
          confirmedOrders: ordersByStatus.CONFIRMED.length,
          deliveringOrders: ordersByStatus.DELIVERING.length,
          completedOrders: ordersByStatus.COMPLETED.length,
          cancelledOrders: ordersByStatus.CANCELLED.length,
        };

        const cacheData = {
          ordersByStatus,
          stats,
          allOrders,
        };

        // Cập nhật cache
        this.cache.set(cacheKey, cacheData);
        this.lastUpdated.set(cacheKey, now);

        // Cập nhật cache từng status
        Object.keys(ordersByStatus).forEach((status) => {
          this.cache.set(`orders_${status}`, ordersByStatus[status]);
          this.lastUpdated.set(`orders_${status}`, now);
        });

        // Thông báo listeners
        this.notifyListeners("all", cacheData);

        return {
          success: true,
          data: cacheData,
          fromCache: false,
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error("Error fetching all orders:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Cập nhật một order trong cache
  updateOrderInCache(updatedOrder) {
    const orderId = updatedOrder.orderId || updatedOrder.id;

    // Cập nhật trong cache all_orders
    const allOrdersCache = this.cache.get("all_orders");
    if (allOrdersCache) {
      // Tìm và cập nhật order
      const orderIndex = allOrdersCache.allOrders.findIndex(
        (order) => (order.orderId || order.id) === orderId
      );

      if (orderIndex !== -1) {
        // Lấy status cũ để remove khỏi group cũ
        const oldOrder = allOrdersCache.allOrders[orderIndex];
        const oldStatus = oldOrder.status;
        const newStatus = updatedOrder.status;

        // Cập nhật order trong allOrders
        allOrdersCache.allOrders[orderIndex] = updatedOrder;

        // Nếu status thay đổi, cập nhật groups
        if (oldStatus !== newStatus) {
          // Remove từ group cũ
          if (allOrdersCache.ordersByStatus[oldStatus]) {
            const oldIndex = allOrdersCache.ordersByStatus[oldStatus].findIndex(
              (order) => (order.orderId || order.id) === orderId
            );
            if (oldIndex !== -1) {
              allOrdersCache.ordersByStatus[oldStatus].splice(oldIndex, 1);
            }
          }

          // Add vào group mới
          if (allOrdersCache.ordersByStatus[newStatus]) {
            allOrdersCache.ordersByStatus[newStatus].push(updatedOrder);
          }

          // Cập nhật stats
          allOrdersCache.stats = {
            processingOrders: allOrdersCache.ordersByStatus.PROCESSING.length,
            confirmedOrders: allOrdersCache.ordersByStatus.CONFIRMED.length,
            deliveringOrders: allOrdersCache.ordersByStatus.DELIVERING.length,
            completedOrders: allOrdersCache.ordersByStatus.COMPLETED.length,
            cancelledOrders: allOrdersCache.ordersByStatus.CANCELLED.length,
          };

          // Cập nhật cache từng status
          this.cache.set(`orders_${oldStatus}`, allOrdersCache.ordersByStatus[oldStatus]);
          this.cache.set(`orders_${newStatus}`, allOrdersCache.ordersByStatus[newStatus]);
        } else {
          // Chỉ cập nhật trong group hiện tại
          if (allOrdersCache.ordersByStatus[newStatus]) {
            const index = allOrdersCache.ordersByStatus[newStatus].findIndex(
              (order) => (order.orderId || order.id) === orderId
            );
            if (index !== -1) {
              allOrdersCache.ordersByStatus[newStatus][index] = updatedOrder;
              this.cache.set(`orders_${newStatus}`, allOrdersCache.ordersByStatus[newStatus]);
            }
          }
        }

        // Thông báo listeners
        this.notifyListeners("orderUpdated", {
          order: updatedOrder,
          oldStatus,
          newStatus,
        });
        this.notifyListeners(newStatus, allOrdersCache.ordersByStatus[newStatus]);
        if (oldStatus !== newStatus) {
          this.notifyListeners(oldStatus, allOrdersCache.ordersByStatus[oldStatus]);
        }
      }
    }
  }

  // Xóa cache
  clearCache(pattern = null) {
    if (pattern) {
      // Xóa cache theo pattern
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
          this.lastUpdated.delete(key);
        }
      }
    } else {
      // Xóa tất cả cache
      this.cache.clear();
      this.lastUpdated.clear();
    }
  }

  // Làm mới cache
  async refreshCache() {
    console.log("Refreshing all cache...");
    this.clearCache();
    return await this.getAllOrdersGrouped(true);
  }

  // Đăng ký listener để lắng nghe thay đổi
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  // Thông báo listeners
  notifyListeners(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in cache listener for event ${event}:`, error);
        }
      });
    }
  }

  // Lấy thông tin cache
  getCacheInfo() {
    return {
      cacheSize: this.cache.size,
      cacheKeys: Array.from(this.cache.keys()),
      lastUpdated: Object.fromEntries(this.lastUpdated),
      cacheTimeout: this.cacheTimeout,
    };
  }

  // Set cache timeout
  setCacheTimeout(timeout) {
    this.cacheTimeout = timeout;
  }
}

// Singleton instance
const orderCacheService = new OrderCacheService();

export default orderCacheService;
