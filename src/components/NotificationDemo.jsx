// // components/NotificationDemo.jsx - Component để test hệ thống thông báo
// import React from "react";
// import { Button, Space, Card, Typography } from "antd";
// import { CheckCircle, Truck, PartyPopper, XCircle, Bell } from "lucide-react";
// import { useUserNotifications } from "../hooks/useUserNotifications";

// const { Title, Text } = Typography;

// const NotificationDemo = () => {
//   const {
//     addOrderConfirmedNotification,
//     addOrderInDeliveryNotification,
//     addOrderCompletedNotification,
//     addOrderCancelledNotification,
//     addSystemNotification,
//     triggerShake,
//     requestNotificationPermission,
//     toggleAudio,
//     audioEnabled,
//   } = useUserNotifications();

//   // Sample order data for testing
//   const sampleOrderData = {
//     id: Math.floor(Math.random() * 10000),
//     orderCode: `DH${Math.floor(Math.random() * 100000)}`,
//     totalPrice: Math.floor(Math.random() * 500000) + 50000,
//     items: [
//       { name: "Phở Bò Tái", quantity: 1, price: 65000 },
//       { name: "Nem Rán", quantity: 2, price: 15000 },
//     ],
//     receiverName: "Nguyễn Văn A",
//     receiverPhone: "0987654321",
//     deliveryAddress: "123 Đường ABC, Quận 1, TP.HCM",
//   };

//   const handleTestOrderConfirmed = () => {
//     const orderData = {
//       ...sampleOrderData,
//       orderCode: `DH${Math.floor(Math.random() * 100000)}`,
//     };
//     addOrderConfirmedNotification(orderData);
//   };

//   const handleTestOrderInDelivery = () => {
//     const orderData = {
//       ...sampleOrderData,
//       orderCode: `DH${Math.floor(Math.random() * 100000)}`,
//     };
//     addOrderInDeliveryNotification(orderData);
//   };

//   const handleTestOrderCompleted = () => {
//     const orderData = {
//       ...sampleOrderData,
//       orderCode: `DH${Math.floor(Math.random() * 100000)}`,
//     };
//     addOrderCompletedNotification(orderData);
//   };

//   const handleTestOrderCancelled = () => {
//     const orderData = {
//       ...sampleOrderData,
//       orderCode: `DH${Math.floor(Math.random() * 100000)}`,
//     };
//     addOrderCancelledNotification(orderData);
//   };

//   const handleTestSystemNotification = () => {
//     addSystemNotification({
//       title: "Thông báo hệ thống",
//       message:
//         "Hệ thống sẽ bảo trì vào 2:00 AM ngày mai. Vui lòng hoàn tất đơn hàng trước thời gian này.",
//       priority: "medium",
//     });
//   };

//   const handleRequestPermission = async () => {
//     const granted = await requestNotificationPermission();
//     if (granted) {
//       console.log("✅ Notification permission granted");
//     } else {
//       console.log("❌ Notification permission denied");
//     }
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <Card>
//         <Title level={3} className="mb-6 flex items-center">
//           <Bell className="mr-2" />
//           Demo Hệ thống Thông báo
//         </Title>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Notification Tests */}
//           <div>
//             <Title level={4} className="mb-4">
//               Test Thông báo Đơn hàng
//             </Title>
//             <Space direction="vertical" size="middle" className="w-full">
//               <Button
//                 type="primary"
//                 icon={<CheckCircle className="w-4 h-4" />}
//                 onClick={handleTestOrderConfirmed}
//                 className="w-full flex items-center justify-center">
//                 <span className="ml-2">Đơn hàng được xác nhận</span>
//               </Button>

//               <Button
//                 type="primary"
//                 icon={<Truck className="w-4 h-4" />}
//                 onClick={handleTestOrderInDelivery}
//                 className="w-full flex items-center justify-center bg-blue-500">
//                 <span className="ml-2">Đơn hàng đang giao</span>
//               </Button>

//               <Button
//                 type="primary"
//                 icon={<PartyPopper className="w-4 h-4" />}
//                 onClick={handleTestOrderCompleted}
//                 className="w-full flex items-center justify-center bg-purple-500">
//                 <span className="ml-2">Đơn hàng hoàn thành</span>
//               </Button>

//               <Button
//                 danger
//                 icon={<XCircle className="w-4 h-4" />}
//                 onClick={handleTestOrderCancelled}
//                 className="w-full flex items-center justify-center">
//                 <span className="ml-2">Đơn hàng bị hủy</span>
//               </Button>

//               <Button
//                 type="default"
//                 icon={<Bell className="w-4 h-4" />}
//                 onClick={handleTestSystemNotification}
//                 className="w-full flex items-center justify-center">
//                 <span className="ml-2">Thông báo hệ thống</span>
//               </Button>
//             </Space>
//           </div>

//           {/* Settings Tests */}
//           <div>
//             <Title level={4} className="mb-4">
//               Cài đặt & Kiểm tra
//             </Title>
//             <Space direction="vertical" size="middle" className="w-full">
//               <div className="p-4 bg-gray-50 rounded-lg">
//                 <Text strong>Trạng thái âm thanh:</Text>
//                 <div className="flex items-center justify-between mt-2">
//                   <Text>{audioEnabled ? "Đã bật" : "Đã tắt"}</Text>
//                   <Button type="link" onClick={() => toggleAudio(!audioEnabled)} className="p-0">
//                     {audioEnabled ? "Tắt" : "Bật"}
//                   </Button>
//                 </div>
//               </div>

//               <div className="p-4 bg-gray-50 rounded-lg">
//                 <Text strong>Quyền thông báo:</Text>
//                 <div className="flex items-center justify-between mt-2">
//                   <Text>
//                     {Notification.permission === "granted"
//                       ? "Đã cho phép"
//                       : Notification.permission === "denied"
//                       ? "Đã từ chối"
//                       : "Chưa yêu cầu"}
//                   </Text>
//                   {Notification.permission !== "granted" && (
//                     <Button type="link" onClick={handleRequestPermission} className="p-0">
//                       Yêu cầu
//                     </Button>
//                   )}
//                 </div>
//               </div>

//               <Button type="dashed" onClick={triggerShake} className="w-full">
//                 Test Shake Animation
//               </Button>

//               <div className="p-4 bg-blue-50 rounded-lg">
//                 <Title level={5} className="mb-2">
//                   Hướng dẫn sử dụng:
//                 </Title>
//                 <ul className="text-sm space-y-1">
//                   <li>• Click các button trên để test thông báo</li>
//                   <li>• Kiểm tra chuông thông báo ở header</li>
//                   <li>• Thử các tính năng đánh dấu đã đọc</li>
//                   <li>• Test responsive trên mobile</li>
//                   <li>• Kiểm tra browser notification</li>
//                 </ul>
//               </div>
//             </Space>
//           </div>
//         </div>

//         {/* Sample Order Data Display */}
//         <div className="mt-8 p-4 bg-gray-50 rounded-lg">
//           <Title level={5} className="mb-3">
//             Dữ liệu đơn hàng mẫu:
//           </Title>
//           <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
//             {JSON.stringify(sampleOrderData, null, 2)}
//           </pre>
//         </div>

//         {/* Instructions */}
//         <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//           <Title level={5} className="text-yellow-800 mb-2">
//             🚀 Hướng dẫn triển khai:
//           </Title>
//           <div className="text-sm text-yellow-700 space-y-2">
//             <p>
//               <strong>1. Backend Integration:</strong>
//             </p>
//             <ul className="ml-4 space-y-1">
//               <li>
//                 • Khi staff xác nhận đơn hàng, gửi WebSocket event: <code>orderConfirmed</code>
//               </li>
//               <li>
//                 • Khi bắt đầu giao hàng, gửi: <code>orderInDelivery</code>
//               </li>
//               <li>
//                 • Khi hoàn thành, gửi: <code>orderCompleted</code>
//               </li>
//               <li>
//                 • Khi hủy đơn, gửi: <code>orderCancelled</code>
//               </li>
//             </ul>

//             <p>
//               <strong>2. WebSocket Event Format:</strong>
//             </p>
//             <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
//               {`// Example event structure
// {
//   "eventType": "orderConfirmed",
//   "orderData": {
//     "id": 12345,
//     "orderCode": "DH67890",
//     "userId": 456,
//     "totalPrice": 150000,
//     "receiverName": "Nguyễn Văn A",
//     "receiverPhone": "0987654321"
//   },
//   "timestamp": "2025-01-01T10:00:00Z",
//   "message": "Đơn hàng đã được xác nhận"
// }`}
//             </pre>

//             <p>
//               <strong>3. Room Management:</strong>
//             </p>
//             <ul className="ml-4 space-y-1">
//               <li>
//                 • User join room: <code>user_ </code>
//               </li>
//               <li>
//                 • Staff join room: <code>staff_ </code>
//               </li>
//               <li>• Emit events to specific user rooms</li>
//             </ul>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default NotificationDemo;
