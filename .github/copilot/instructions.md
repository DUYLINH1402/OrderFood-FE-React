# Copilot Instructions for Food Order Project

## Language Preference

Luôn phản hồi cho người dùng bằng Tiếng Việt trong mọi tình huống, bao gồm cả giải thích, ví dụ code, và hướng dẫn.

## Tổng quan dự án

- Frontend: React, Redux, TailwindCSS, React Router.
- Backend: Spring Boot, REST API.
- Dự án là hệ thống đặt món ăn trực tuyến với các chức năng chính:
  - Xem thực đơn, tìm kiếm món ăn
  - Thêm món vào giỏ hàng, đặt món
  - Quản lý điểm thưởng, sử dụng điểm khi thanh toán
  - Đăng ký, đăng nhập, xác thực người dùng
  - Quản lý đơn hàng, trạng thái đơn
  - Đánh giá món ăn, phản hồi khách hàng
  - Quản lý người dùng, phân quyền nhân viên và admin
  - Thống kê, báo cáo cho admin

## Phân quyền và giao diện người dùng

- Dự án có các loại giao diện và phân quyền:
  - Khách hàng chưa đăng nhập: Xem thực đơn, đặt món, đánh giá, thêm món vào giỏ, đăng ký/đăng nhập.
  - Khách hàng đã đăng nhập: Sử dụng điểm thưởng, xem lịch sử đơn hàng, cập nhật thông tin cá nhân.
  - Nhân viên nhà hàng: Quản lý đơn hàng, xác nhận/chuẩn bị món, liên hệ khách hàng, cập nhật trạng thái đơn.
  - Admin: Quản lý toàn bộ hệ thống, người dùng, thực đơn, thống kê, phân quyền nhân viên.
- Khi sinh code hoặc giải thích, Copilot cần chú ý logic, UI và API phù hợp với từng loại user, đảm bảo bảo mật và trải nghiệm riêng biệt cho từng vai trò.

## Quy tắc code Frontend (chi tiết từ toàn bộ dự án)

- Kiến trúc chuẩn React: Tách rõ các component, page, service, store, utils, hooks. Component chia nhỏ, dễ tái sử dụng, ưu tiên functional component và hooks.
- Quản lý state với Redux: Sử dụng Redux Toolkit, chia slice cho từng nghiệp vụ (cart, auth, favorite, points...). Kết hợp redux-persist để lưu state vào localStorage.
- Sử dụng React Router cho điều hướng: Tách page cho từng màn hình, sử dụng useNavigate, useLocation.
- Sử dụng TailwindCSS cho style: Ưu tiên class utility, tách style riêng cho từng component.
- Quản lý API/service: Tách riêng các hàm gọi API, chia theo nghiệp vụ (foodService, cartService, orderService, userService...).
- Sử dụng apiClient và publicClient cho các request:
  - apiClient dùng cho API cần xác thực, tự động thêm token vào header.
  - publicClient dùng cho API công khai, không cần token.
- Service quyết định nguồn dữ liệu (Firebase hoặc API backend) dựa vào biến môi trường, giúp dễ chuyển đổi và mở rộng.
- Tách hàm gọi API và hàm gọi Firebase, xử lý lỗi rõ ràng, trả về giá trị mặc định hoặc throw lại cho component xử lý.
- Không để logic nghiệp vụ ở component, component chỉ gọi service và render UI.
- Quản lý token, xác thực, tự động logout khi token hết hạn.
- Đặt tên biến, hàm, component: Dùng camelCase cho biến/hàm, PascalCase cho component, tên file rõ ràng theo chức năng.
- Comment cho logic phức tạp hoặc nghiệp vụ đặc thù: Đặc biệt ở các hàm xử lý nghiệp vụ, utils, hooks.
- Tối ưu hiệu năng: Sử dụng lazy load cho ảnh, chia nhỏ component, tối ưu render.
- Quản lý phân quyền, giao diện động: Hiển thị UI phù hợp cho từng loại user (khách, nhân viên, admin), kiểm tra xác thực trước các thao tác nhạy cảm.
- Quy trình phát triển: Sử dụng branch cho từng tính năng, commit message rõ ràng, review code trước khi merge, viết test cho các component/page quan trọng, dùng môi trường dev/test trước khi lên production.
- Lưu ý bảo mật: Sử dụng biến môi trường cho thông tin bảo mật, không lưu thông tin nhạy cảm ở client.

## Cấu trúc thư mục Frontend

- `src/components/`: Các UI component tái sử dụng.
- `src/pages/`: Các trang chính của ứng dụng.
- `src/services/`: Hàm gọi API backend.
- `src/store/`: Redux store và các slice.
- `src/utils/`: Hàm tiện ích, validation, format dữ liệu.
- `src/assets/`: Hình ảnh, icon, font, style.

## Lưu ý đặc biệt

- Luôn kiểm tra xác thực người dùng trước các thao tác nhạy cảm.
- Sử dụng biến môi trường cho thông tin bảo mật.
- Ưu tiên trải nghiệm người dùng mượt mà, dễ sử dụng.
- Tối ưu hiệu năng cho cả frontend và backend.

## Hướng dẫn cho Copilot

- Khi sinh code, luôn tuân thủ các quy tắc trên.
- Giải thích bằng Tiếng Việt, ưu tiên ví dụ thực tế từ dự án.
- Nếu có logic phức tạp, hãy comment rõ ràng.
- Khi được hỏi về cấu trúc, hãy trả lời dựa trên các mục ở trên.
