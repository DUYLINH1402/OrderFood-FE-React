// Mock OrderWebSocketClient for useOptimizedOrders compatibility
// This is a placeholder since the original orderWebSocket service was removed

class OrderWebSocketClient {
  constructor() {
    this.connected = false;
    this.eventHandlers = new Map();
  }

  // Initialize client (mock implementation)
  async initialize(token) {
    try {
      this.connected = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize OrderWebSocketClient:", error);
      return false;
    }
  }

  // Mock event handler registration
  on(eventType, handler) {
    // Store handler but don't actually use it since we have no real WebSocket
    this.eventHandlers.set(eventType, handler);
    // Return a mock unsubscribe function
    return () => {
      this.eventHandlers.delete(eventType);
      console.log(`Mock: Unregistered handler for ${eventType}`);
    };
  }

  // Mock convenience methods for Orders
  onOrdersUpdate(handler) {
    return this.on("ordersUpdate", handler);
  }

  onOrderStatusChanged(handler) {
    return this.on("orderStatusChanged", handler);
  }

  onNewOrder(handler) {
    return this.on("newOrder", handler);
  }

  onOrderCancelled(handler) {
    return this.on("orderCancelled", handler);
  }

  onSearchResult(handler) {
    return this.on("searchResult", handler);
  }

  // Mock order actions
  searchOrder(orderCode) {
    console.log(`Mock: Search order ${orderCode}`);
    return Promise.resolve({ success: false, message: "WebSocket service not available" });
  }

  updateOrderStatus(orderId, status, note) {
    console.log(`Mock: Update order ${orderId} status to ${status}`);
    return Promise.resolve({ success: false, message: "WebSocket service not available" });
  }

  requestOrdersRefresh() {
    console.log("Mock: Request orders refresh");
    return Promise.resolve({ success: false, message: "WebSocket service not available" });
  }

  // Mock connection status
  getConnectionStatus() {
    return {
      isConnected: false,
      isConnecting: false,
      lastError: null,
      reconnectAttempts: 0,
    };
  }

  // Mock cleanup
  disconnect() {
    console.log("Mock: Disconnecting OrderWebSocketClient");
    this.eventHandlers.clear();
    this.connected = false;
  }
}

// Export singleton instance
const orderWebSocketClient = new OrderWebSocketClient();
export default orderWebSocketClient;
