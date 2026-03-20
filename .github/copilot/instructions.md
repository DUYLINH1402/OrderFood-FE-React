# Copilot Instructions — Hệ Thống Đặt Món Ăn Trực Tuyến (Đông Xanh)

## Language Preference

Luôn phản hồi cho người dùng bằng Tiếng Việt trong mọi tình huống, bao gồm cả giải thích, suy nghĩ hiển thị trong cửa sổ Chat, các ví dụ code, và hướng dẫn.

---

## 1. Tổng quan dự án

### 1.1. Thông tin chung

- **Tên dự án**: food-order-frontend (Nhà hàng Đông Xanh)
- **Phiên bản**: 1.0.0
- **Loại**: Single Page Application (SPA) — hệ thống đặt món ăn trực tuyến
- **Frontend**: React 18.2 + Redux Toolkit + TailwindCSS + React Router 6
- **Backend**: Spring Boot REST API (repo riêng)
- **Build tool**: Vite
- **Deploy**: Firebase Hosting

### 1.2. Công nghệ chính (đồng bộ theo package.json)

| Nhóm             | Thư viện                                                             |
| ---------------- | -------------------------------------------------------------------- |
| Core             | react@18.2.0, react-dom@18.2.0, react-router-dom@6.20.1              |
| State Management | @reduxjs/toolkit@2.8.2, react-redux@9.2.0, redux-persist@6.0.0       |
| UI Framework     | tailwindcss@3.4.17, @mui/material@7.2.0, antd@5.24.6, flowbite-react |
| Icon             | lucide-react@0.539.0, react-icons@5.5.0, @heroicons/react            |
| Animation        | framer-motion@11.18.2, aos@2.3.4 (Animate On Scroll)                 |
| HTTP             | axios@1.9.0                                                          |
| WebSocket        | @stomp/stompjs@7.1.1, sockjs-client@1.6.1                            |
| Search           | algoliasearch@4.26.0                                                 |
| Firebase         | firebase@11.6.0 (Firestore, Hosting — nguồn dữ liệu thay thế)        |
| Rich Text        | react-quill@2.0.0                                                    |
| Chart            | chart.js@4.5.1, react-chartjs-2                                      |
| Toast/Notify     | react-toastify@11.0.5, sonner@2.0.7                                  |
| Payment          | ZaloPay (qua paymentService)                                         |
| 3D/Visual        | ogl@1.0.11                                                           |
| SCSS             | sass (SCSS modules cho một số component)                             |

### 1.3. Kiến trúc tổng thể

```
Browser ─── React SPA ─── Axios (apiClient / publicClient) ─── Spring Boot REST API ─── DB
                │                                                       │
                ├─── Redux Store (persist → localStorage)               │
                ├─── STOMP/SockJS WebSocket ────────────────────────────┘
                ├─── Firebase Firestore (nguồn dữ liệu thay thế via env)
                └─── Algolia (tìm kiếm full-text)
```

---

## 2. Phân quyền và vai trò người dùng

### 2.1. Hệ thống vai trò (roleConfig.js)

| Role           | Constant         | Mô tả                            |
| -------------- | ---------------- | -------------------------------- |
| Khách vãng lai | GUEST            | Chưa đăng nhập, xem công khai    |
| Khách hàng     | ROLE_USER        | Đã đăng nhập, đặt món, tích điểm |
| Nhân viên      | ROLE_STAFF       | Quản lý đơn, cập nhật trạng thái |
| Admin          | ROLE_ADMIN       | Quản lý toàn bộ hệ thống         |
| Super Admin    | ROLE_SUPER_ADMIN | Quyền cao nhất                   |

### 2.2. Hệ thống quyền (permissions.js)

- `hasPermission(role, permission)` — kiểm tra quyền đơn lẻ
- `hasAnyPermission(role, permissions)` — kiểm tra ít nhất 1 quyền
- `canAccessRoute(role, path)` — kiểm tra quyền truy cập route
- `getDefaultRoute(role)` — redirect về trang mặc định theo role
- **Permissions**: view_menu, place_order, manage_orders, manage_users, manage_menu, view_analytics, manage_staff, system_settings...

### 2.3. Guard components (src/components/auth/)

| Component           | Chức năng                                     |
| ------------------- | --------------------------------------------- |
| `AuthGuard`         | Bảo vệ route theo role (ADMIN, STAFF...)      |
| `PermissionGuard`   | Bảo vệ feature theo permission cụ thể         |
| `LoginRequired`     | Redirect về login nếu chưa đăng nhập          |
| `GuestOnly`         | Chặn user đã đăng nhập (trang login/register) |
| `CustomerOnlyGuard` | Chỉ cho khách hàng truy cập                   |
| `HomeRedirect`      | Redirect nếu đã đăng nhập                     |

### 2.4. Giao diện theo vai trò

- **Khách vãng lai**: Xem thực đơn, thêm giỏ hàng (localStorage), đăng ký/đăng nhập, xem blog/tin tức/đánh giá
- **Khách hàng (ROLE_USER)**: Tất cả trên + đặt món, thanh toán, tích/dùng điểm thưởng, chat với nhân viên, quản lý profile, xem lịch sử đơn, yêu thích món ăn, nhận thông báo real-time
- **Nhân viên (ROLE_STAFF)**: Dashboard đơn hàng real-time, xác nhận/chuẩn bị/giao/hủy đơn, chat với khách hàng, quản lý trạng thái món (hết/còn), xem báo cáo
- **Admin (ROLE_ADMIN)**: Dashboard thống kê, quản lý người dùng/nhân viên, quản lý thực đơn, quản lý đơn hàng, phân tích doanh thu, quản lý coupon/khuyến mãi, quản lý blog/tin tức, kiểm duyệt bình luận, quản lý liên hệ, cài đặt hệ thống, quản lý dữ liệu (reindex Algolia, xóa cache)

---

## 3. Cấu trúc thư mục chi tiết

```
src/
├── App.jsx                  # Entry component: Redux Provider, PersistGate, Context Providers, AOS init
├── main.jsx                 # ReactDOM render vào #root
├── index.css                # Global styles + Tailwind directives
│
├── assets/                  # Tài nguyên tĩnh
│   ├── fonts/               # Font chữ tùy chỉnh
│   ├── icons/               # Icon SVG
│   ├── images/              # Hình ảnh
│   └── styles/              # SCSS modules (CartPage.scss, SharedChatStyles.scss...)
│
├── components/              # ~71 UI component tái sử dụng
│   ├── auth/                # Guard components (AuthGuard, PermissionGuard, LoginRequired...)
│   ├── Button/              # ReadMoreButton (expand/collapse)
│   ├── Chatbot/             # Chatbot widget (Chatbot, ChatbotFAB, MessageItem, QuickReplies, TypingIndicator)
│   ├── Comment/             # Hệ thống bình luận
│   ├── GuideModal/          # Modal hướng dẫn sử dụng
│   ├── LikeButton/          # Nút like/unlike
│   ├── NavBar/              # Header, Footer, Sidebar mobile, Layout wrapper
│   ├── Notification/        # NotificationBell, NotificationBellContainer, StaffNotificationBellContainer
│   ├── Ribbons/             # Ribbon trang trí (new, best seller...)
│   ├── ShareButton/         # Nút chia sẻ
│   ├── Sidebar/             # (placeholder — sidebar dùng trong layouts/)
│   ├── Skeleton/            # Skeleton loading placeholders
│   ├── Support/             # SupportFloating (chatbot + staff chat + hotline), StaffChat, ScrollToTop
│   ├── AudioEnabler.jsx     # Quản lý quyền phát âm thanh
│   ├── CateringCard.jsx     # Card dịch vụ tiệc
│   ├── CateringServicesSection.jsx
│   ├── ConfirmModal.jsx     # Modal xác nhận chung
│   ├── CustomerReviews.jsx  # Section đánh giá khách hàng
│   ├── DishCard.jsx         # Card món ăn variant
│   ├── FlyImage.jsx         # Hiệu ứng ảnh bay vào giỏ hàng
│   ├── FoodGridItem.jsx     # Card món ăn trong grid
│   ├── ForgotPasswordModal.jsx
│   ├── GlassPageWrapper.jsx # Hiệu ứng frosted glass
│   ├── LazyImage.jsx        # Lazy load ảnh (Intersection Observer)
│   ├── LoginForm.jsx        # Form đăng nhập/đăng ký
│   ├── MediaPressCard.jsx   # Card bài báo chí
│   ├── MediaPressSection.jsx
│   ├── NewsCard.jsx         # Card tin tức
│   ├── NewsSection.jsx
│   ├── OrderDetailModal.jsx # Chi tiết đơn hàng
│   ├── RestaurantInfoSection.jsx
│   ├── ScrollRevealContainer.jsx  # Wrapper animation khi scroll
│   ├── ScrollToTopOnNavigate.jsx  # Auto scroll top khi chuyển route
│   ├── SearchBar.jsx        # Thanh tìm kiếm (Algolia)
│   ├── ServiceHighlights.jsx
│   └── WebSocketStatusIndicator.jsx  # Trạng thái kết nối WebSocket
│
├── constants/               # Hằng số nghiệp vụ
│   ├── orderConstants.js    # ORDER_STATUS, PAYMENT_METHODS, DELIVERY_TYPES, ORDER_ACTIONS
│   └── blogConstants.js     # BLOG_TYPES (NEWS, MEDIA_PRESS, CATERING), BLOG_TYPE_INFO
│
├── contexts/                # React Context
│   ├── HeaderVisibilityContext.jsx  # Show/hide header khi scroll
│   └── NotificationContext.jsx      # Quản lý notification tập trung (markAsRead, audio, badge...)
│
├── hooks/                   # ~20 custom hooks
│   ├── auth/                # useAuth, useLocalStorageSync
│   ├── useAuthRedirect.js   # Auto-redirect nếu chưa đăng nhập
│   ├── useChatbotWebSocket.js
│   ├── useComment.js        # CRUD comment + pagination + replies
│   ├── useGlobalAuthWatch.js  # Theo dõi auth cross-tab
│   ├── useHeaderHeight.js   # Theo dõi chiều cao header
│   ├── useInView.js         # Intersection Observer (lazy render)
│   ├── useLike.js           # Toggle like với optimistic update
│   ├── useNotifications.js  # Notification cơ bản
│   ├── useOptimizedOrders.js  # Đơn hàng nhân viên + cache + WebSocket
│   ├── useRemoveAnimation.js  # Animation xóa item
│   ├── useScrollReveal.js   # Animation scroll reveal
│   ├── useShare.js          # Chia sẻ + copy link
│   ├── useStaffChatWebSocket.js    # WebSocket chat nhân viên-khách
│   ├── useStaffNotifications.js    # Notification cho nhân viên
│   ├── useStaffOrderWebSocket.js   # WebSocket đơn hàng real-time
│   ├── useUserChat.js       # Chat khách hàng-nhân viên + pagination
│   └── useUserNotifications.js     # Notification nâng cao (merge WS + API, loại trùng)
│
├── layouts/                 # Layout wrapper theo vai trò
│   ├── BaseLayout.jsx       # Layout công khai (NavBar + Footer)
│   ├── AdminLayout.jsx      # Layout admin (Sidebar + Content)
│   ├── StaffLayout.jsx      # Layout nhân viên (Sidebar + Content)
│   └── Sidebar/             # MobileMenuToggle, Sidebar component, Sidebar.css
│
├── pages/                   # ~100+ page files
│   ├── Home.jsx             # Trang chủ
│   ├── DongXanhIntro.jsx    # Giới thiệu nhà hàng
│   ├── RewardPointsIntro.jsx  # Giới thiệu chương trình điểm thưởng
│   ├── Error404Page.jsx     # Trang 404
│   ├── ResetPasswordPage.jsx
│   ├── home/                # Sections trang chủ (FeaturedDishes, NewDishes, FavoriteDishes, FeedbacksGallery)
│   ├── auth/                # LoginSuccessPage (OAuth2 callback)
│   ├── Foods/               # FoodListPage (danh sách + filter), FoodDetailPage (chi tiết + comment + like)
│   ├── Cart/                # CartPage, CartItem
│   ├── Order/               # CheckoutPage, PaymentResultPage, ClosedHoursModal, PaymentMethodModal, PointsUsageSection, orderUtils
│   ├── Profile/             # ProfilePage (thông tin cá nhân)
│   ├── FavoriteDishes/      # FavoriteDishesPage
│   ├── News/                # NewsPage, NewsDetailPage
│   ├── MediaPress/          # MediaPressPage, MediaPressDetailPage
│   ├── Catering/            # CateringServicesPage, CateringDetailPage
│   ├── CustomerFeedbacks/   # CustomerFeedbacksPage
│   ├── Contact/             # ContactPage (form liên hệ)
│   ├── admin/               # 13 trang admin + 15 modal (xem mục 5)
│   └── staff/               # 5 trang nhân viên + 8 modal (xem mục 5)
│
├── routes/                  # Hệ thống routing
│   ├── AppRoutes.jsx        # Router chính (createBrowserRouter)
│   ├── UserRoutes.jsx       # ~29 route công khai + bảo vệ
│   ├── AdminRoutes.jsx      # ~12 route admin (AuthGuard + PermissionGuard + lazy load)
│   ├── StaffRoutes.jsx      # ~5 route nhân viên (AuthGuard)
│   └── AuthLoader.jsx       # Khôi phục auth từ localStorage khi mount
│
├── services/                # Service layer (27+ service files)
│   ├── apiClient.js         # Axios instances: apiClient (có auth), publicClient (công khai)
│   ├── index.js             # Export tập trung
│   ├── api/                 # ~31 API files (HTTP request thuần, chia theo nghiệp vụ)
│   ├── auth/                # authApi.js (login, register, Google OAuth2)
│   ├── cache/               # orderCacheService.js (in-memory cache, TTL 5 phút)
│   ├── firebase/            # firebaseConfig, foodFirebase, feedbackFirebase, orderFirebase
│   ├── service/             # 27 service files (logic nghiệp vụ, chọn nguồn dữ liệu)
│   └── websocket/           # WebSocket clients & providers
│
├── store/                   # Redux store
│   ├── index.js             # configureStore + redux-persist (whitelist: cart, auth, favorite, points)
│   ├── slices/              # 6 slices (auth, cart, favorite, points, profile, chatbot)
│   └── thunks/              # profileThunks (validate + update + sync localStorage)
│
└── utils/                   # ~13 hàm tiện ích
    ├── validation.js        # Form validation (email, password, phone...)
    ├── formatCurrency.js    # Format tiền VNĐ (B, M, K)
    ├── formatRelativeTime.js  # "5 phút trước"
    ├── roleConfig.js        # ROLES, PERMISSIONS, ROLE_PERMISSIONS, ROLE_ROUTES
    ├── permissions.js       # hasPermission, canAccessRoute, getDefaultRoute
    ├── profileValidation.js # Validate profile fields + avatar
    ├── notificationUtils.js # createNotificationFromSocket, removeDuplicateNotifications
    ├── notificationSound.js # Web Audio API cho âm thanh thông báo
    ├── authErrorMapper.js   # Map lỗi auth sang tiếng Việt
    ├── ErrorMapper.js       # Map lỗi API chung
    ├── icons.js             # Icon mappings
    ├── getActivityColor.js  # Màu theo trạng thái hoạt động
    └── action.jsx           # Action components chung
```

---

## 4. Service Layer — API & Nguồn dữ liệu

### 4.1. API Client (apiClient.js)

- **apiClient**: Axios instance có xác thực — tự động gắn `Authorization: Bearer {token}` qua request interceptor. Timeout 30s.
- **publicClient**: Axios instance công khai — không cần token. Timeout 100s.
- **Base URL**: `import.meta.env.VITE_API_BASE_URL`
- **Response interceptor (401)**: Tự động logout, xóa localStorage (accessToken, user, cartItems, persist:root), dispatch `logout()`, redirect về login. Có cơ chế chống redirect trùng lặp.

### 4.2. Danh sách Service theo nghiệp vụ (src/services/service/)

#### Món ăn & Thực đơn

| Service             | Hàm chính                                                                                                             | Mô tả                                                                  |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `foodService`       | getNewFoods, getFeaturedFoods, getBestSellerFoods, getAllFoods, getFoodsByCategoryID, getFoodBySlug, updateFoodStatus | Catalog món ăn. Hỗ trợ chuyển đổi Firebase/API qua `VITE_USE_FIREBASE` |
| `categoriesService` | getCategories                                                                                                         | Danh mục món ăn                                                        |
| `adminFoodService`  | getAdminFoods, createFood, updateFood, deleteFood, uploadFoodImage                                                    | CRUD món ăn (admin)                                                    |
| `staffMenuService`  | getStaffMenuWithFilter, updateFoodStatusWithNote                                                                      | Quản lý menu (nhân viên)                                               |

#### Giỏ hàng & Đơn hàng

| Service             | Hàm chính                                                                                      | Mô tả                              |
| ------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------- |
| `cartService`       | syncCart, getUserCart, addToCartApi, updateCartApi, removeCartItemApi, clearCartApi            | Giỏ hàng (sync localStorage ↔ API) |
| `orderService`      | createOrder, getOrders, getOrderById, updateOrderStatus, cancelOrder, getOrderStatistics       | CRUD đơn hàng. Hỗ trợ Firebase/API |
| `staffOrderService` | getAllStaffOrders, searchStaffOrderByCode, confirmOrder, cancelOrderWithReason...              | Đơn hàng phía nhân viên            |
| `adminOrderService` | getAllAdminOrders, getDashboardStats, cancelOrderWithReason, restoreOrder, updateInternalNote  | Đơn hàng phía admin                |
| `paymentService`    | createPayment, updatePaymentStatus, checkPaymentStatus                                         | Thanh toán ZaloPay                 |
| `couponService`     | getUserCoupons, redeemCoupon, validateCoupon                                                   | Mã giảm giá                        |
| `pointsService`     | getUserPoints, usePointsForOrder, getPointsHistory, calculateEarnedPoints, validatePointsUsage | Điểm thưởng                        |

#### Người dùng & Xác thực

| Service           | Hàm chính                                               | Mô tả                                                 |
| ----------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| `authApi`         | loginApi, registerApi, loginWithGoogleApi, getToken     | Đăng nhập/đăng ký (endpoint: `/api/v1/public/auth/*`) |
| `userService`     | getProfile, updateProfile, uploadAvatar, changePassword | Quản lý tài khoản                                     |
| `favoriteService` | getFavorites, addToFavorites, removeFromFavorites       | Món yêu thích                                         |

#### Giao tiếp & Thông báo

| Service               | Hàm chính                                                               | Mô tả                    |
| --------------------- | ----------------------------------------------------------------------- | ------------------------ |
| `chatService`         | getChatHistory, getUnreadCount, getUnreadMessages                       | Chat khách-nhân viên     |
| `chatbotService`      | sendMessageToChatbot, getChatHistory, generateSessionId, getUserContext | Chatbot AI               |
| `notificationService` | getUserNotifications, markAsRead, markAllAsRead...                      | Thông báo (user & staff) |

#### Nội dung & Blog

| Service           | Hàm chính                                                                                                        | Mô tả                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `blogService`     | getBlogs, getFeaturedBlogs, searchBlogs, getBlogBySlug, getRelatedBlogs, getBlogsByType, getBlogCategoriesByType | 3 loại: tin tức, báo chí, dịch vụ tiệc |
| `commentService`  | getComments, getReplies, createComment, updateComment, deleteComment                                             | Bình luận (FOOD, BLOG)                 |
| `likeService`     | getLikeInfo, getLikeCount, checkLikeStatus, toggleLike                                                           | Like/unlike                            |
| `shareService`    | trackShare, getShareCount                                                                                        | Theo dõi lượt chia sẻ                  |
| `feedbackService` | getAllFeedbacks, createFeedback, updateFeedback, deleteFeedback                                                  | Phản hồi khách hàng                    |

#### Admin nâng cao

| Service                  | Hàm chính                                                                     | Mô tả                                                          |
| ------------------------ | ----------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `adminRestaurantService` | getAdminRestaurantInfo, updateRestaurantInfo, addGalleryImage, reorderGallery | Quản lý thông tin nhà hàng + gallery                           |
| `restaurantService`      | getRestaurantInfo                                                             | Thông tin nhà hàng công khai (logo, address, phone, galleries) |
| `staffReportService`     | getStaffReports...                                                            | Báo cáo nhân viên                                              |
| `dataManagementService`  | reindexSearchData, initAlgoliaData, clearCache, getCacheStatus                | Quản lý dữ liệu hệ thống                                       |
| `adminCommentService`    | Moderation functions                                                          | Kiểm duyệt bình luận                                           |
| `zoneService`            | getDistricts, getWardsByDistrict                                              | Tra cứu quận/huyện, phường/xã                                  |

### 4.3. Firebase Layer (src/services/firebase/)

Nguồn dữ liệu thay thế, kích hoạt qua `VITE_USE_FIREBASE=true`:

- **firebaseConfig.js**: Khởi tạo Firebase (env vars: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN...)
- **foodFirebase.js**: Query Firestore collection `foods` (getNew, getFeatured, getBestSeller, getAll, getByCategory) — phân trang thủ công
- **feedbackFirebase.js**: CRUD collection `feedbacks`
- **orderFirebase.js**: Create + query orders từ Firestore

### 4.4. Cache Layer (src/services/cache/)

- **orderCacheService.js**: In-memory cache cho đơn hàng nhân viên
  - TTL: 5 phút
  - Phương thức: getOrdersByStatus, getAllOrdersGrouped (nhóm theo PROCESSING, CONFIRMED, DELIVERING, COMPLETED, CANCELLED)
  - Listener pattern: notifyListeners khi cache thay đổi
  - Force refresh: bỏ qua cache khi cần

---

## 5. Các chức năng đã hoàn thành (tiến độ dự án)

### 5.1. Khách hàng — Hoàn thành

- [x] **Trang chủ**: Hero section, món nổi bật, món mới, best seller, gallery phản hồi, đánh giá khách hàng, tin tức, báo chí, dịch vụ tiệc, giới thiệu nhà hàng, dịch vụ nổi bật
- [x] **Xem thực đơn**: Danh sách món + bộ lọc danh mục + phân trang + tìm kiếm (Algolia)
- [x] **Chi tiết món**: Thông tin, ảnh, giá, biến thể, bình luận, like, chia sẻ, món liên quan
- [x] **Giỏ hàng**: Thêm/sửa/xóa món, điều chỉnh số lượng, sync localStorage ↔ API khi đăng nhập
- [x] **Thanh toán (Checkout)**: Chọn địa chỉ giao (quận/phường), phí vận chuyển theo quận, áp mã giảm giá, dùng điểm thưởng (tối đa 70% giá món), chọn giao hàng/nhận tại quán, kiểm tra giờ hoạt động nhà hàng
- [x] **Thanh toán ZaloPay**: Redirect sang ZaloPay gateway → nhận callback → cập nhật trạng thái
- [x] **Điểm thưởng**: Xem điểm hiện có, lịch sử tích điểm, dùng điểm khi thanh toán (1 điểm = 1 VNĐ)
- [x] **Món yêu thích**: Thêm/xóa yêu thích, xem danh sách
- [x] **Đăng nhập/Đăng ký**: Email + mật khẩu, Google OAuth2, quên mật khẩu, reset mật khẩu
- [x] **Hồ sơ cá nhân**: Cập nhật thông tin, upload avatar, đổi mật khẩu
- [x] **Thông báo real-time**: WebSocket → NotificationBell (9 loại: ORDER, DELIVERY, READY_FOR_PICKUP, PAYMENT_CONFIRMED, REFUND, CANCELLED, ALERT, PROMOTION, NEW_MESSAGE), âm thanh, shake animation
- [x] **Chat với nhân viên**: Real-time qua WebSocket, lịch sử chat, reply message, lazy load, đánh dấu đã đọc
- [x] **Chatbot AI**: Chatbot tự động hỗ trợ, quick replies, typing indicator, quản lý session
- [x] **Bình luận**: Bình luận món ăn + blog, trả lời, sửa/xóa, phân trang
- [x] **Like/Share**: Toggle like (optimistic update), chia sẻ + copy link, tracking lượt share
- [x] **Blog/Tin tức**: 3 loại (tin tức & khuyến mãi, báo chí, dịch vụ tiệc), chi tiết bài, bài liên quan
- [x] **Đánh giá khách hàng**: Xem feedback, gallery ảnh dạng masonry
- [x] **Liên hệ**: Form gửi liên hệ
- [x] **Giới thiệu**: Trang giới thiệu Đông Xanh, trang giới thiệu điểm thưởng
- [x] **UX nâng cao**: Lazy image, skeleton loading, scroll reveal animation, frosted glass effect, fly image (hiệu ứng bay vào giỏ), scroll to top, responsive mobile sidebar
- [x] **Widget hỗ trợ**: Floating button (Chatbot + Staff Chat + Hotline) — ẩn với Staff/Admin

### 5.2. Nhân viên (Staff) — Hoàn thành

- [x] **Dashboard đơn hàng real-time**: WebSocket nhận đơn mới, hiển thị theo tab trạng thái (mặc định: PROCESSING), tìm kiếm theo mã đơn
- [x] **Xử lý đơn hàng**: Xác nhận qua điện thoại (PhoneConfirmModal), hủy đơn kèm lý do (CancelOrderModal), xác nhận giao hàng (DeliveryConfirmModal), hoàn thành giao (CompleteDeliveryModal)
- [x] **Thống kê đơn hàng**: Bộ lọc trạng thái + khoảng thời gian, tổng đơn/processing/confirmed/delivering/completed/cancelled, phân trang
- [x] **Quản lý menu**: Xem danh sách món (grid/list), lọc theo danh mục/trạng thái, cập nhật trạng thái món (còn/hết) kèm ghi chú, tab best seller/combo khuyến mãi
- [x] **Hồ sơ nhân viên**: Thông tin tài khoản, đổi mật khẩu, upload avatar
- [x] **Thông báo real-time**: WebSocket + âm thanh + badge
- [x] **Chỉ báo WebSocket**: WebSocketStatusIndicator hiển thị trạng thái kết nối
- [x] **Báo cáo**: Xem báo cáo hiệu suất

### 5.3. Admin — Hoàn thành

- [x] **Dashboard**: Tổng quan (tổng khách, doanh thu tháng, đơn hôm nay, tổng nhân viên, đơn chờ, đơn hoàn thành, tăng trưởng %), biểu đồ doanh thu 7 ngày (Bar/Line toggle), feed hoạt động gần đây
- [x] **Quản lý người dùng**: Danh sách (search, filter active), xem chi tiết, tạo/sửa/xóa, bật/tắt trạng thái
- [x] **Quản lý nhân viên**: Danh sách, xem chi tiết, tạo/sửa/xóa, bật/tắt trạng thái
- [x] **Quản lý đơn hàng**: 21+ metrics thống kê, lọc trạng thái/ngày/mã đơn, hủy/khôi phục đơn, ghi chú nội bộ
- [x] **Quản lý thực đơn**: CRUD món ăn, upload ảnh, tab menu/best seller/khuyến mãi, grid/list view, lọc danh mục/trạng thái
- [x] **Phân tích nâng cao**: Thống kê 7/30 ngày (đơn, hủy, AOV, churn, khách, điểm), doanh thu theo danh mục (doughnut chart), hiệu suất món ăn (bảng), top bán chạy (bar chart)
- [x] **Quản lý coupon/khuyến mãi**: Dashboard thống kê, CRUD coupon, hiệu suất coupon, xu hướng sử dụng 30 ngày, top user dùng coupon
- [x] **Quản lý blog**: CRUD bài viết (3 loại tin tức)
- [x] **Kiểm duyệt bình luận**: Xem, xóa bình luận
- [x] **Quản lý liên hệ**: Xem danh sách, chi tiết, trả lời liên hệ
- [x] **Cài đặt hệ thống**: Cấu hình chung
- [x] **Quản lý thông tin nhà hàng**: Cập nhật info, CRUD gallery ảnh, sắp xếp thứ tự gallery
- [x] **Quản lý dữ liệu**: Reindex Algolia, xóa cache, xem trạng thái cache
- [x] **Hồ sơ admin**: Thông tin tài khoản, đổi mật khẩu, bảo mật

### 5.4. Hệ thống chung — Hoàn thành

- [x] **WebSocket real-time**: STOMP + SockJS, heartbeat 10s, reconnect tự động (max 5 lần, delay 3s), message queue buffer (50 msg, 30s retention)
- [x] **Auth toàn diện**: JWT token, auto-refresh, cross-tab sync, auto-logout khi 401, Google OAuth2
- [x] **Routing phân quyền**: 3 nhóm route (User/Staff/Admin), lazy load tất cả trang admin/staff
- [x] **Redux persist**: Giữ state cart, auth, favorite, points qua page reload
- [x] **Responsive**: Mobile sidebar, adaptive grid, breakpoints
- [x] **SEO-friendly URLs**: Slug-based routes (`/mon-an/:slug`, `/tin-tuc/:slug`)
- [x] **Dual data source**: Chuyển đổi Firebase ↔ API backend qua env var
- [x] **Code splitting**: Vite tách chunk vendor, mui, antd, stomp
- [x] **Xử lý lỗi**: Error mapper (tiếng Việt), toast notification, 404 page, 403 unauthorized page

---

## 6. WebSocket — Chi tiết kết nối

### 6.1. Cơ sở hạ tầng

- **Protocol**: STOMP over SockJS fallback (websocket → xhr-streaming → xhr-polling)
- **URL**: `${VITE_API_BASE_URL}/ws`
- **Heartbeat**: 10s incoming / 10s outgoing
- **Reconnect**: max 5 lần, delay 3s
- **Connection timeout**: 15s (SockJS 10s)

### 6.2. Kênh cho nhân viên (StaffOrderWebSocketService)

| Topic                        | Hướng | Mô tả                             |
| ---------------------------- | ----- | --------------------------------- |
| `/app/order/register`        | OUT   | Đăng ký nhận cập nhật đơn         |
| `/topic/order-updates`       | IN    | Broadcast thay đổi trạng thái đơn |
| `/topic/staff-notifications` | IN    | Thông báo cho nhân viên           |

### 6.3. Kênh chat nhân viên (StaffChatWebSocketService)

| Topic                       | Hướng | Message Types                                                                                                  |
| --------------------------- | ----- | -------------------------------------------------------------------------------------------------------------- |
| `/app/chat/staff/register`  | OUT   | Đăng ký nhân viên                                                                                              |
| `/topic/staff-chat`         | IN    | STAFF_WELCOME, STAFF_REPLY, REPLY_SENT, USER_CHAT, USER_CHAT_REALTIME, ERROR, ONLINE_STAFF_LIST, STAFF_OFFLINE |
| `/user/queue/chat-messages` | IN    | Tin nhắn targeted cho user cụ thể                                                                              |

### 6.4. User WebSocket Client

- Event listener pattern: `addEventListener(type, callback)` / `emitEvent(type, data)`
- Message queue: buffer 50 messages, retention 30s, processor interval 2s
- Token-based authentication (JWT)
- Cơ chế chống duplicate: flags cho connect/register/subscribe
- Provider: `UserWebSocketProvider` (React Context, auth-aware)

### 6.5. Luồng đơn hàng real-time (Staff)

```
Đơn mới → WebSocket broadcast → useStaffOrderWebSocket listener
        → Toast + Sound notification → StaffDashboard hiển thị tab PROCESSING
        → Nhân viên xử lý (confirm/cancel/deliver)
        → Gửi cập nhật → Backend broadcast → Cache invalidate
        → Khách hàng nhận thông báo qua WebSocket/Chatbot
```

---

## 7. Redux Store — State Shape

### 7.1. Cấu hình Store (store/index.js)

```javascript
// redux-persist whitelist (lưu vào localStorage)
whitelist: ["cart", "auth", "favorite", "points"];
```

### 7.2. Slices

| Slice           | State chính                                                   | Actions chính                                                                     |
| --------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `authSlice`     | user, accessToken, isLoggedIn, loading, error                 | loginSuccess, logout, setUser, updateUser, updateAvatar                           |
| `cartSlice`     | items: []                                                     | addToCart, updateQuantity, removeFromCart, clearCart, setCartItems                |
| `favoriteSlice` | list: []                                                      | setFavorites, addFavorite, removeFavorite                                         |
| `pointsSlice`   | availablePoints, pointsHistory, loading, historyLoading       | fetchUserPoints (thunk), fetchPointsHistory (thunk), updateAvailablePoints        |
| `profileSlice`  | fullName, email, phoneNumber, address, avatarUrl, errors      | setProfileData, updateField, setErrors, clearError, resetProfileState             |
| `chatbotSlice`  | messages, sessionId, isLoading, isOpen, unreadCount, settings | sendChatMessage (thunk), openChatbot, closeChatbot, initializeSession, addMessage |

---

## 8. Routing — Bản đồ URL

### 8.1. Route công khai (UserRoutes — 29 routes)

| Path                      | Page                  | Guard         |
| ------------------------- | --------------------- | ------------- |
| `/`                       | Home                  | -             |
| `/gioi-thieu`             | DongXanhIntro         | -             |
| `/gioi-thieu-diem-thuong` | RewardPointsIntro     | -             |
| `/mon-an`                 | FoodListPage          | -             |
| `/mon-an/:slug`           | FoodDetailPage        | -             |
| `/gio-hang`               | CartPage              | -             |
| `/dang-nhap`              | LoginPage             | GuestOnly     |
| `/dang-ky`                | RegisterPage          | GuestOnly     |
| `/reset-password`         | ResetPasswordPage     | -             |
| `/ho-so`                  | ProfilePage           | LoginRequired |
| `/yeu-thich`              | FavoriteDishesPage    | LoginRequired |
| `/thanh-toan`             | CheckoutPage          | LoginRequired |
| `/ket-qua-thanh-toan`     | PaymentResultPage     | LoginRequired |
| `/tin-tuc`                | NewsPage              | -             |
| `/tin-tuc/:slug`          | NewsDetailPage        | -             |
| `/bao-chi`                | MediaPressPage        | -             |
| `/bao-chi/:slug`          | MediaPressDetailPage  | -             |
| `/dai-tiec`               | CateringServicesPage  | -             |
| `/dai-tiec/:slug`         | CateringDetailPage    | -             |
| `/danh-gia-khach-hang`    | CustomerFeedbacksPage | -             |
| `/lien-he`                | ContactPage           | -             |

### 8.2. Route Admin (AdminRoutes — 12+ routes, lazy load)

| Path                | Page            | Permission Required |
| ------------------- | --------------- | ------------------- |
| `/admin`            | AdminDashboard  | ADMIN / SUPER_ADMIN |
| `/admin/users`      | AdminUsers      | manage_users        |
| `/admin/staff`      | AdminStaff      | manage_staff        |
| `/admin/orders`     | AdminOrders     | manage_orders       |
| `/admin/menu`       | AdminMenu       | manage_menu         |
| `/admin/analytics`  | AdminAnalytics  | view_analytics      |
| `/admin/promotions` | AdminPromotions | manage_promotions   |
| `/admin/settings`   | AdminSettings   | system_settings     |
| `/admin/blogs`      | AdminBlogs      | manage_blogs        |
| `/admin/comments`   | AdminComments   | manage_comments     |
| `/admin/contacts`   | AdminContacts   | manage_contacts     |
| `/admin/profile`    | AdminProfile    | -                   |

### 8.3. Route Staff (StaffRoutes — 5 routes)

| Path             | Page           | Role          |
| ---------------- | -------------- | ------------- |
| `/staff`         | StaffDashboard | STAFF / ADMIN |
| `/staff/orders`  | StaffOrders    | STAFF / ADMIN |
| `/staff/menu`    | StaffMenu      | STAFF / ADMIN |
| `/staff/reports` | StaffReports   | STAFF / ADMIN |
| `/staff/profile` | StaffProfile   | STAFF / ADMIN |

---

## 9. Luồng nghiệp vụ chính

### 9.1. Luồng đặt hàng

```
Khách chọn món → addToCart (Redux + localStorage)
  → Nếu đã login: sync với API (cartService.addToCartApi)
  → Vào CartPage: sửa số lượng / xóa
  → Bấm "Thanh toán" → CheckoutPage:
      1. Kiểm tra giờ hoạt động (isWithinOperatingHours)
      2. Nhập thông tin giao hàng (tên, SĐT, quận/phường)
      3. Tính phí vận chuyển theo quận
      4. Áp mã giảm giá (validateCoupon)
      5. Dùng điểm thưởng (tối đa 70% giá món)
      6. Chọn phương thức thanh toán
      7. Gửi đơn → createOrder API
      8. Nếu ZaloPay: redirect gateway → PaymentResultPage callback
      9. Nếu COD: hiển thị xác nhận
```

### 9.2. Luồng xác thực

```
Đăng nhập (email/password hoặc Google OAuth2)
  → API trả về { user, accessToken }
  → Redux: loginSuccess({ user, accessToken })
  → localStorage: lưu accessToken + user
  → redux-persist: tự động persist auth slice
  → AuthLoader: khôi phục state khi refresh page
  → useGlobalAuthWatch: đồng bộ cross-tab
  → apiClient interceptor: gắn token tự động
  → 401 response: auto-logout + redirect login
```

### 9.3. Luồng thanh toán ZaloPay

```
CheckoutPage → createPayment(orderData) → Backend tạo ZaloPay transaction
  → Redirect sang ZaloPay gateway
  → Khách thanh toán
  → ZaloPay redirect về /ket-qua-thanh-toan?appTransId=...&returnCode=...
  → PaymentResultPage:
      - returnCode=0 hoặc status=0 → SUCCESS → updatePaymentStatus(appTransId, SUCCESS)
      - Khác → FAILED → updatePaymentStatus(appTransId, FAILED)
      - Hiển thị animation kết quả (checkmark/X/spinner)
```

### 9.4. Trạng thái đơn hàng (Order Lifecycle)

```
PENDING → PROCESSING → CONFIRMED → DELIVERING → COMPLETED
                ↓                       ↓
            CANCELLED              CANCELLED
```

| Trạng thái | Label tiếng Việt | Ai thao tác           |
| ---------- | ---------------- | --------------------- |
| PENDING    | Chờ xác nhận     | Hệ thống tạo          |
| PROCESSING | Đang xử lý       | Nhân viên tiếp nhận   |
| CONFIRMED  | Đã xác nhận      | Nhân viên xác nhận    |
| DELIVERING | Đang giao hàng   | Nhân viên gửi giao    |
| COMPLETED  | Hoàn thành       | Nhân viên xác nhận    |
| CANCELLED  | Đã hủy           | Nhân viên/Admin/Khách |

---

## 10. Biến môi trường (Environment Variables)

| Biến                                | Mô tả                           |
| ----------------------------------- | ------------------------------- |
| `VITE_API_BASE_URL`                 | Base URL API backend            |
| `VITE_USE_FIREBASE`                 | `true` → dùng Firebase thay API |
| `VITE_FIREBASE_API_KEY`             | Firebase API Key                |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase Auth Domain            |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase Project ID             |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase Storage Bucket         |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID    |
| `VITE_FIREBASE_APP_ID`              | Firebase App ID                 |
| `VITE_ALGOLIA_APP_ID`               | Algolia Application ID (search) |
| `VITE_ALGOLIA_SEARCH_KEY`           | Algolia Search-only API Key     |

---

## 11. Quy tắc code Frontend

### 11.1. Kiến trúc & Tổ chức

- Kiến trúc chuẩn React: Tách rõ component, page, service, store, utils, hooks
- Component chia nhỏ, tái sử dụng, ưu tiên functional component + hooks
- **KHÔNG** để logic nghiệp vụ ở component — component chỉ gọi service và render UI
- Service quyết định nguồn dữ liệu (Firebase hoặc API) dựa vào biến môi trường
- Tách hàm gọi API (api/) và service logic (service/), xử lý lỗi rõ ràng

### 11.2. Đặt tên

- **camelCase** cho biến, hàm: `getUserCart`, `handleSubmit`, `isLoading`
- **PascalCase** cho component, page: `FoodGridItem`, `CheckoutPage`, `AuthGuard`
- Tên file rõ ràng theo chức năng: `orderService.js`, `useComment.js`, `validation.js`

### 11.3. Styling

- Sử dụng **TailwindCSS**: Ưu tiên class utility, tách SCSS riêng cho component phức tạp
- **Tuyệt đối KHÔNG** dùng `text-xs` (quá nhỏ) — tối thiểu là `text-sm`
- Icon mặc định kích thước `w-6 h-6` cho đồng bộ
- **KHÔNG** dùng emoji — dùng icon từ thư viện (lucide-react, react-icons, heroicons)

### 11.4. State Management

- Redux Toolkit: chia slice theo nghiệp vụ (auth, cart, favorite, points, profile, chatbot)
- redux-persist: whitelist cart, auth, favorite, points
- Kết hợp localStorage sync cho auth data

### 11.5. API & HTTP

- `apiClient` cho request cần xác thực (tự động gắn Bearer token)
- `publicClient` cho request công khai
- Xem package.json để dùng đúng công nghệ đã cài
- Khi `console.log` **KHÔNG** dùng icon/emoji

### 11.6. Hiệu năng

- Lazy load ảnh (LazyImage + Intersection Observer)
- Lazy load routes (React.lazy + Suspense cho admin/staff pages)
- Code splitting: vendor, mui, antd, stomp chunks riêng
- Skeleton loading cho content placeholder
- AOS (Animate On Scroll) cho animation

### 11.7. Bảo mật

- Sử dụng biến môi trường cho thông tin nhạy cảm
- Không lưu thông tin bảo mật ở client
- Guard component bảo vệ route + permission level
- Auto-logout khi token hết hạn (401 interceptor)
- Cross-tab auth sync (useGlobalAuthWatch)

---

## 12. Hướng dẫn cho Copilot

- Luôn phản hồi bằng **Tiếng Việt**
- Khi sinh code, **tuân thủ** tất cả quy tắc ở mục 11
- Ưu tiên ví dụ thực tế từ dự án khi giải thích
- Comment rõ ràng cho logic phức tạp hoặc nghiệp vụ đặc thù
- **KHÔNG** dùng emoji — dùng icon từ thư viện đã cài (lucide-react, react-icons, heroicons)
- Khi tạo service mới: tạo file API ở `services/api/`, tạo service logic ở `services/service/`
- Khi tạo page mới: đặt trong thư mục phù hợp dưới `pages/`, thêm route tương ứng
- Khi tạo component: chú ý tái sử dụng, props rõ ràng, không chứa logic nghiệp vụ
- Khi sửa đổi state: dùng Redux Toolkit (createSlice/createAsyncThunk), không manipulate state trực tiếp
- Khi thêm WebSocket event: thêm handler trong hook tương ứng, cập nhật message type constants
- Khi được hỏi về cấu trúc, trả lời dựa trên tài liệu này
