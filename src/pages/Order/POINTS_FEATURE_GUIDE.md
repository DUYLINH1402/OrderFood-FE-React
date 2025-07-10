# Tính năng Điểm Thưởng - Hướng dẫn sử dụng

## Tổng quan
Tính năng điểm thưởng cho phép khách hàng sử dụng điểm tích lũy để giảm giá trị đơn hàng khi thanh toán.

## Các thành phần đã thêm

### 1. Services
- **`pointsService.js`**: Chứa các API calls liên quan đến điểm thưởng
  - `getUserPoints()`: Lấy số điểm hiện có của user
  - `usePointsForOrder()`: Sử dụng điểm cho đơn hàng
  - `getPointsHistory()`: Lấy lịch sử điểm thưởng
  - `calculateEarnedPoints()`: Tính điểm sẽ nhận được từ đơn hàng
  - `validatePointsUsage()`: Validate việc sử dụng điểm

### 2. Redux Store
- **`pointsSlice.js`**: Quản lý state điểm thưởng
  - `availablePoints`: Số điểm hiện có
  - `pointsHistory`: Lịch sử điểm thưởng
  - `loading`, `error`: Trạng thái loading và lỗi

### 3. Utils Functions
Đã thêm vào `orderUtils.js`:
- `calculateTotalPriceWithPoints()`: Tính tổng tiền sau khi trừ điểm
- `calculateMaxPointsDiscount()`: Tính số tiền giảm tối đa (50% đơn hàng)
- `calculatePointsNeeded()`: Tính số điểm cần để được giảm X VND
- `calculateDiscountFromPoints()`: Tính số tiền được giảm từ X điểm
- `validatePointsUsage()`: Validate số điểm sử dụng

### 4. UI Components
- **`PointsUsageSection.jsx`**: Component riêng cho phần sử dụng điểm
- **Cập nhật `CheckoutPage.jsx`**: Tích hợp tính năng điểm thưởng

## Cách hoạt động

### Quy tắc sử dụng điểm
1. **Tỷ lệ quy đổi**: 1 điểm = 1.000 VND
2. **Giới hạn sử dụng**: Tối đa 50% tổng giá trị đơn hàng
3. **Điều kiện**: Chỉ user đã đăng nhập mới được sử dụng điểm

### Flow sử dụng
1. User đăng nhập → Hệ thống fetch điểm thưởng từ API
2. Trong CheckoutPage, nếu user có điểm → Hiển thị checkbox "Sử dụng điểm thưởng"
3. User check vào checkbox → Hiển thị input nhập số điểm + nút "Dùng tối đa"
4. User nhập điểm hoặc click "Dùng tối đa" → Tính toán và hiển thị số tiền được giảm
5. Validate số điểm (không âm, không quá điểm có sẵn, không quá 50% đơn hàng)
6. Khi đặt hàng → Gửi thông tin điểm sử dụng lên server

## Cần thiết lập Backend

### API Endpoints
```
GET /users/:userId/points - Lấy điểm hiện có
POST /points/use - Sử dụng điểm cho đơn hàng  
GET /users/:userId/points/history - Lịch sử điểm
POST /points/calculate - Tính điểm sẽ nhận được
POST /points/validate - Validate việc sử dụng điểm
```

### Database Schema
Cần bảng `user_points` hoặc field `reward_points` trong bảng `users`

### Order Schema
Cần thêm fields:
- `points_used`: Số điểm đã sử dụng
- `points_discount`: Số tiền được giảm từ điểm

## Mở rộng tương lai
1. **Lịch sử điểm thưởng**: Trang xem lịch sử tích/tiêu điểm
2. **Thông báo điểm**: Popup hiển thị điểm sẽ nhận được sau khi đặt hàng
3. **Ưu đãi điểm**: Các chương trình khuyến mãi dành cho điểm thưởng
4. **Cấp độ thành viên**: Khác nhau tỷ lệ tích điểm theo cấp độ
