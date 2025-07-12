# Order Management System Documentation

## Overview

Hệ thống quản lý đơn hàng cho ứng dụng đặt đồ ăn, hỗ trợ cả API backend (Spring Boot) và Firebase như nguồn dữ liệu.

## Architecture

### Backend (Spring Boot)

- **Controller**: `OrderController.java` - Xử lý HTTP requests
- **Service**: `OrderService.java` + `OrderServiceImpl.java` - Business logic
- **Repository**: `OrderRepository.java` - Data access layer
- **DTOs**: Request/Response objects cho API
- **Entities**: `Order.java`, `OrderItem.java`, `OrderStatus.java`

### Frontend (React)

- **API Layer**: `orderApi.js` - HTTP client functions
- **Service Layer**: `orderService.js` - Business logic abstraction
- **Firebase Layer**: `orderFirebase.js` - Firebase operations
- **Components**: `OrdersTab.jsx`, `OrderDetailModal.jsx`
- **Constants**: `orderConstants.js` - Status, payment methods, etc.
- **Utils**: `orderUtils.js` - Data transformation utilities

## API Endpoints

### Backend APIs

```
GET    /api/orders                    - Lấy danh sách đơn hàng
GET    /api/orders/{orderCode}        - Lấy chi tiết đơn hàng
POST   /api/orders                    - Tạo đơn hàng mới
PUT    /api/orders/{orderCode}/status - Cập nhật trạng thái đơn hàng
PUT    /api/orders/{orderCode}/cancel - Hủy đơn hàng
GET    /api/orders/statistics         - Lấy thống kê đơn hàng
```

### Query Parameters

- `page`: Trang hiện tại (default: 0)
- `size`: Số lượng items per page (default: 10)
- `status`: Lọc theo trạng thái (PENDING, CONFIRMED, PREPARING, SHIPPING, DELIVERED, CANCELLED)
- `userId`: Lọc theo user ID

## Order Status Flow

```
PENDING → CONFIRMED → PREPARING → SHIPPING → DELIVERED
    ↓         ↓           ↓
CANCELLED  CANCELLED  CANCELLED
```

### Status Definitions

- **PENDING**: Đơn hàng mới tạo, chờ xác nhận
- **CONFIRMED**: Đã xác nhận, chuẩn bị thực hiện
- **PREPARING**: Đang chuẩn bị món ăn
- **SHIPPING**: Đang giao hàng
- **DELIVERED**: Đã giao hàng thành công
- **CANCELLED**: Đã hủy đơn hàng

## Data Models

### Order Object

```javascript
{
  id: "string",
  orderCode: "string",
  status: "ORDER_STATUS",
  createdAt: "datetime",
  updatedAt: "datetime",

  // Customer Information
  receiverName: "string",
  receiverPhone: "string",
  receiverEmail: "string",

  // Delivery Information
  deliveryType: "DELIVERY | PICKUP",
  deliveryAddress: "string",
  districtId: "number",
  wardId: "number",
  estimatedDelivery: "datetime",
  deliveryTime: "datetime",
  deliveryFee: "number",

  // Payment Information
  paymentMethod: "COD | ZALOPAY | MOMO | VNPAY | BANK_TRANSFER",
  totalPrice: "number",
  pointsToUse: "number",
  pointsDiscount: "number",

  // Order Items
  items: [
    {
      id: "string",
      foodId: "number",
      foodName: "string",
      variantId: "number",
      variantName: "string",
      price: "number",
      quantity: "number"
    }
  ],

  // Status Specific Fields
  cancelReason: "string",
  cancelledAt: "datetime",
  statusNote: "string"
}
```

## Configuration

### Environment Variables

```bash
# Use Firebase or API
VITE_USE_FIREBASE=false

# API Base URL
VITE_API_BASE_URL=http://localhost:8080

# Firebase Config (if using Firebase)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Usage Examples

### Creating an Order

```javascript
import { createOrder } from "../services/service/orderService";

const orderData = {
  userId: 1,
  receiverName: "Nguyễn Văn A",
  receiverPhone: "0123456789",
  receiverEmail: "test@example.com",
  deliveryType: "DELIVERY",
  deliveryAddress: "123 Nguyễn Văn Cừ, Q5, TP.HCM",
  districtId: 1,
  wardId: 1,
  paymentMethod: "COD",
  totalPrice: 150000,
  pointsToUse: 0,
  pointsDiscount: 0,
  items: [
    {
      foodId: 1,
      variantId: null,
      price: 85000,
      quantity: 1,
    },
  ],
};

const result = await createOrder(orderData);
if (result.success) {
  console.log("Order created:", result.data);
}
```

### Fetching Orders

```javascript
import { getOrders } from "../services/service/orderService";

// Get all orders
const result = await getOrders();

// Get orders with filters
const filteredResult = await getOrders({
  status: "CONFIRMED",
  page: 0,
  size: 10,
});
```

### Cancelling an Order

```javascript
import { cancelOrder } from "../services/service/orderService";

const result = await cancelOrder(orderId, "Khách hàng đổi ý");
if (result.success) {
  console.log("Order cancelled successfully");
}
```

## Frontend Components

### OrdersTab

Main component for displaying user's orders with:

- Status filtering tabs
- Order cards with expand/collapse
- Cancel order functionality
- Order detail modal

### OrderDetailModal

Detailed view of an order with:

- Complete order information
- Status tracking
- Customer and delivery details
- Payment information
- Order items breakdown

## Data Transformation

### API Response Mapping

The system automatically transforms API responses to a consistent frontend format using utility functions:

- `transformApiOrderToFrontend()`: API → Frontend format
- `transformFirebaseOrderToFrontend()`: Firebase → Frontend format
- `transformFrontendOrderToApi()`: Frontend → API format

### Validation

Order data validation includes:

- Required field validation
- Phone number format validation
- Email format validation
- Address validation for delivery orders
- Total price validation

## Error Handling

### API Errors

- Network errors
- Server errors (5xx)
- Validation errors (4xx)
- Authentication errors

### Firebase Errors

- Connection errors
- Permission errors
- Data validation errors

## Testing

### API Testing

```bash
# Test order creation
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "receiverName": "Test User",
    "receiverPhone": "0123456789",
    "deliveryType": "DELIVERY",
    "paymentMethod": "COD",
    "totalPrice": 100000,
    "items": [...]
  }'

# Test get orders
curl -X GET "http://localhost:8080/api/orders?page=0&size=10"

# Test cancel order
curl -X PUT http://localhost:8080/api/orders/ORD001/cancel \
  -H "Content-Type: application/json" \
  -d '{"cancelReason": "Test cancel"}'
```

## Performance Considerations

### Database

- Index on `userId`, `status`, `createdAt`
- Pagination for large datasets
- Caching for frequently accessed data

### Frontend

- Lazy loading for order details
- Debounced search and filtering
- Optimistic UI updates
- Error boundary components

## Security

### Backend

- JWT token validation
- User authorization (users can only access their own orders)
- Input validation and sanitization
- Rate limiting

### Frontend

- Token management
- Secure storage of sensitive data
- XSS protection
- CSRF protection

## Deployment

### Backend

```bash
# Build JAR file
mvn clean package

# Run application
java -jar target/food-order-backend.jar
```

### Frontend

```bash
# Build for production
npm run build

# Serve static files
npm run preview
```

## Monitoring & Logging

### Backend

- Application logs
- Database query logs
- API response times
- Error tracking

### Frontend

- Console error tracking
- User interaction analytics
- Performance monitoring
- Network request monitoring

## Future Enhancements

### Features

- Real-time order tracking
- Push notifications
- Order history export
- Bulk operations
- Order templates
- Recurring orders

### Technical

- WebSocket for real-time updates
- Service worker for offline support
- GraphQL API
- Microservices architecture
- Database sharding
- CDN for static assets

## Troubleshooting

### Common Issues

1. **Orders not loading**: Check API connection and authentication
2. **Status not updating**: Verify WebSocket connection
3. **Payment failures**: Check payment gateway configuration
4. **Firebase errors**: Verify Firebase configuration and permissions

### Debug Tools

- Browser Developer Tools
- Network tab for API calls
- Console for JavaScript errors
- Redux DevTools for state management

## Support

For technical support or questions about the order management system:

- Create an issue in the project repository
- Contact the development team
- Check the FAQ section
- Review the API documentation
