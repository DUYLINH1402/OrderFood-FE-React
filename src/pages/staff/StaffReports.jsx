import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Clock,
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Calendar,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  AlertCircle,
  Coffee,
  Moon,
  Sun,
  BarChart3,
} from "lucide-react";

const StaffReports = () => {
  // States for shift management
  const [currentShift, setCurrentShift] = useState(null);
  const [shiftStartTime, setShiftStartTime] = useState(null);
  const [workingHours, setWorkingHours] = useState("00:00:00");
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [totalBreakTime, setTotalBreakTime] = useState(0);

  // States for reports
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [reportData, setReportData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    topDishes: [],
    hourlyStats: [],
  });
  const [loading, setLoading] = useState(false);

  // Timer effect for working hours
  useEffect(() => {
    let interval;
    if (currentShift && shiftStartTime && !isOnBreak) {
      interval = setInterval(() => {
        const now = new Date();
        const start = new Date(shiftStartTime);
        const diff = Math.floor((now - start) / 1000) - totalBreakTime;
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setWorkingHours(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentShift, shiftStartTime, isOnBreak, totalBreakTime]);

  // Load initial data
  useEffect(() => {
    fetchReportData();
    // Check if there's an ongoing shift
    const savedShift = localStorage.getItem("currentShift");
    if (savedShift) {
      const shift = JSON.parse(savedShift);
      setCurrentShift(shift);
      setShiftStartTime(shift.startTime);
      setTotalBreakTime(shift.totalBreakTime || 0);
    }
  }, [selectedDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      setReportData({
        totalOrders: 47,
        totalRevenue: 2850000,
        avgOrderValue: 60600,
        completedOrders: 42,
        pendingOrders: 3,
        cancelledOrders: 2,
        topDishes: [
          { name: "Phở Bò Đặc Biệt", quantity: 15, revenue: 450000 },
          { name: "Cơm Tấm Sườn", quantity: 12, revenue: 360000 },
          { name: "Bánh Mì Thịt Nướng", quantity: 10, revenue: 200000 },
          { name: "Bún Bò Huế", quantity: 8, revenue: 240000 },
          { name: "Chả Cá Lã Vọng", quantity: 6, revenue: 300000 },
        ],
        hourlyStats: [
          { hour: "07:00", orders: 5, revenue: 150000 },
          { hour: "08:00", orders: 8, revenue: 240000 },
          { hour: "09:00", orders: 12, revenue: 360000 },
          { hour: "10:00", orders: 15, revenue: 450000 },
          { hour: "11:00", orders: 18, revenue: 540000 },
          { hour: "12:00", orders: 22, revenue: 660000 },
          { hour: "13:00", orders: 16, revenue: 480000 },
          { hour: "14:00", orders: 10, revenue: 300000 },
        ],
      });
    } catch (error) {
      toast.error("Có lỗi khi tải báo cáo");
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartShift = (shiftType) => {
    const now = new Date();
    const shift = {
      type: shiftType,
      startTime: now.toISOString(),
      totalBreakTime: 0,
    };
    setCurrentShift(shift);
    setShiftStartTime(shift.startTime);
    setTotalBreakTime(0);
    localStorage.setItem("currentShift", JSON.stringify(shift));
    toast.success(`Đã bắt đầu ca ${shiftType}`);
  };

  const handleEndShift = () => {
    if (currentShift && shiftStartTime) {
      const endTime = new Date();
      const startTime = new Date(shiftStartTime);
      const totalHours = ((endTime - startTime) / 1000 / 3600 - totalBreakTime / 3600).toFixed(2);

      // Save shift record - replace with actual API
      toast.success(`Đã kết thúc ca làm việc. Tổng thời gian: ${totalHours} giờ`);

      setCurrentShift(null);
      setShiftStartTime(null);
      setWorkingHours("00:00:00");
      setTotalBreakTime(0);
      setIsOnBreak(false);
      localStorage.removeItem("currentShift");
    }
  };

  const handleToggleBreak = () => {
    if (isOnBreak) {
      // End break
      const breakEnd = new Date();
      const breakDuration = Math.floor((breakEnd - new Date(breakStartTime)) / 1000);
      setTotalBreakTime((prev) => prev + breakDuration);
      setIsOnBreak(false);
      setBreakStartTime(null);
      toast.info("Đã kết thúc giờ nghỉ");
    } else {
      // Start break
      setIsOnBreak(true);
      setBreakStartTime(new Date().toISOString());
      toast.info("Đã bắt đầu giờ nghỉ");
    }
  };

  const getShiftIcon = (shiftType) => {
    switch (shiftType) {
      case "Sáng":
        return <Sun className="w-5 h-5" />;
      case "Chiều":
        return <Coffee className="w-5 h-5" />;
      case "Tối":
        return <Moon className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const StatCard = ({ title, value, icon, color = "blue", change = null }) => (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={`text-sm flex items-center mt-1 ${
                change.positive ? "text-green-600" : "text-red-600"
              }`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <div className={`text-${color}-600`}>{icon}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xxl font-bold text-gray-900 mb-2">Báo cáo & Quản lý ca</h1>
          <p className="text-base text-gray-600">
            Theo dõi hiệu suất và quản lý thời gian làm việc
          </p>
        </div>

        {/* Shift Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Current Shift Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Quản lý ca làm việc
            </h3>

            {currentShift ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    {getShiftIcon(currentShift.type)}
                    <div className="ml-3">
                      <p className="font-semibold text-green-800">{currentShift.type}</p>
                      <p className="text-sm text-green-600">
                        Bắt đầu: {new Date(shiftStartTime).toLocaleTimeString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-800">{workingHours}</p>
                    <p className="text-sm text-green-600">Thời gian làm việc</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleToggleBreak}
                    className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center ${
                      isOnBreak
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "bg-yellow-600 hover:bg-yellow-700 text-white"
                    }`}>
                    {isOnBreak ? (
                      <PlayCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <PauseCircle className="w-4 h-4 mr-2" />
                    )}
                    {isOnBreak ? "Kết thúc nghỉ" : "Nghỉ giải lao"}
                  </button>
                  <button
                    onClick={handleEndShift}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Kết thúc ca
                  </button>
                </div>

                {isOnBreak && (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center text-orange-800">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span className="font-medium">Đang trong giờ nghỉ</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-base text-gray-600 mb-4">Chọn ca làm việc để bắt đầu:</p>
                <div className="grid grid-cols-3 gap-3">
                  {["Sáng", "Chiều", "Tối"].map((shift) => (
                    <button
                      key={shift}
                      onClick={() => handleStartShift(shift)}
                      className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center">
                      {getShiftIcon(shift)}
                      <span className="mt-2 text-sm font-medium">{shift}</span>
                      <span className="text-sm text-gray-500">
                        {shift === "Sáng"
                          ? "6:00-14:00"
                          : shift === "Chiều"
                          ? "14:00-22:00"
                          : "22:00-6:00"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Thống kê nhanh
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-base font-medium text-gray-700">Đơn hàng hôm nay</span>
                <span className="text-lg font-bold text-blue-600">{reportData.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-base font-medium text-gray-700">Doanh thu ca</span>
                <span className="text-lg font-bold text-green-600">
                  {reportData.totalRevenue.toLocaleString()} VNĐ
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-base font-medium text-gray-700">Đơn hoàn thành</span>
                <span className="text-lg font-bold text-purple-600">
                  {reportData.completedOrders}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Report Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Báo cáo chi tiết</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={fetchReportData}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Đang tải..." : "Tải báo cáo"}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Tổng đơn hàng"
                value={reportData.totalOrders}
                icon={<ShoppingBag className="w-6 h-6" />}
                color="blue"
                change={{ positive: true, value: "+12%" }}
              />
              <StatCard
                title="Doanh thu"
                value={`${(reportData.totalRevenue / 1000000).toFixed(1)}M VNĐ`}
                icon={<DollarSign className="w-6 h-6" />}
                color="green"
                change={{ positive: true, value: "+8%" }}
              />
              <StatCard
                title="Giá trị TB/đơn"
                value={`${Math.round(reportData.avgOrderValue / 1000)}K VNĐ`}
                icon={<TrendingUp className="w-6 h-6" />}
                color="purple"
                change={{ positive: false, value: "-3%" }}
              />
              <StatCard
                title="Hoàn thành"
                value={`${Math.round(
                  (reportData.completedOrders / reportData.totalOrders) * 100
                )}%`}
                icon={<CheckCircle className="w-6 h-6" />}
                color="green"
                change={{ positive: true, value: "+5%" }}
              />
            </div>

            {/* Top Dishes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Món bán chạy nhất</h4>
                <div className="space-y-3">
                  {reportData.topDishes.map((dish, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{dish.name}</p>
                          <p className="text-sm text-gray-500">{dish.quantity} phần</p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {dish.revenue.toLocaleString()} VNĐ
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hourly Stats */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Thống kê theo giờ</h4>
                <div className="space-y-2">
                  {reportData.hourlyStats.map((stat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{stat.hour}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-base text-gray-600">{stat.orders} đơn</span>
                        <span className="font-semibold text-gray-900">
                          {(stat.revenue / 1000).toFixed(0)}K VNĐ
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffReports;
