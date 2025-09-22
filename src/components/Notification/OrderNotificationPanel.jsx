// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";

// const OrderNotificationPanel = ({
//   newOrdersCount = 0,
//   onViewNewOrders,
//   pendingUpdatesCount = 0,
//   onClearNotifications,
// }) => {
//   const [showPanel, setShowPanel] = useState(false);

//   useEffect(() => {
//     if (newOrdersCount > 0 || pendingUpdatesCount > 0) {
//       setShowPanel(true);
//     }
//   }, [newOrdersCount, pendingUpdatesCount]);

//   const totalNotifications = newOrdersCount + pendingUpdatesCount;

//   if (!showPanel || totalNotifications === 0) {
//     return null;
//   }

//   return (
//     <div className="fixed bottom-4 right-4 z-50">
//       <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4 max-w-sm">
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="font-semibold text-sm">🔔 Thông báo mới</h3>
//             {newOrdersCount > 0 && <p className="text-xs mt-1">📦 {newOrdersCount} đơn hàng mới</p>}
//             {pendingUpdatesCount > 0 && (
//               <p className="text-xs mt-1">📋 {pendingUpdatesCount} cập nhật trạng thái</p>
//             )}
//           </div>
//           <div className="flex space-x-2">
//             {newOrdersCount > 0 && (
//               <button
//                 onClick={onViewNewOrders}
//                 className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100">
//                 Xem
//               </button>
//             )}
//             <button
//               onClick={() => {
//                 setShowPanel(false);
//                 onClearNotifications?.();
//               }}
//               className="text-white hover:text-gray-200">
//               ✕
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderNotificationPanel;
