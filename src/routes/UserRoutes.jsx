import React from "react";
import { Outlet } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Pages
import Home from "../pages/Home";
import CartPage from "../pages/Cart/CartPage";
import Layout from "../components/NavBar/Layout";
import LoginRegisterForm from "../components/LoginForm";
import FoodListPage from "../pages/Foods/FoodListPage";
import DongXanhIntro from "../pages/DongXanhIntro";
import RewardPointsIntro from "../pages/RewardPointsIntro";
import ProfilePage from "../pages/Profile/ProfilePage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import FoodDetailPage from "../pages/Foods/FoodDetailPage/FoodDetailPage";
import FavoriteDishes from "../pages/FavoriteDishes/FavoriteDishesPage";
import CheckoutPage from "../pages/Order/CheckoutPage";
import PaymentResultPage from "../pages/Order/PaymentResultPage";
import CustomerFeedbacksPage from "../pages/CustomerFeedbacks/CustomerFeedbacksPage";
import Error404Page from "../pages/Error404Page";

export const UserRoutes = [
  {
    path: "/",
    element: <Layout />,
    // errorElement: <Unauthorized />,
    children: [
      { path: "/gioi-thieu", element: <DongXanhIntro /> },
      { path: "/", element: <Home /> },
      { path: "/gio-hang", element: <CartPage /> },
      { path: "/mon-an", element: <FoodListPage /> },
      { path: "/tich-diem", element: <RewardPointsIntro /> },
      { path: "/dang-nhap", element: <LoginRegisterForm /> },
      {
        path: "/ho-so",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/yeu-thich",
        element: (
          <ProtectedRoute>
            <FavoriteDishes />
          </ProtectedRoute>
        ),
      },
      { path: "/mon-an/:slug", element: <FoodListPage /> },
      { path: "/mon-an/chi-tiet/:slug", element: <FoodDetailPage /> },
      { path: "/thanh-toan", element: <CheckoutPage /> },
      { path: "/thanh-toan/ket-qua", element: <PaymentResultPage /> },
      { path: "/danh-gia-khach-hang", element: <CustomerFeedbacksPage /> },
      { path: "*", element: <Error404Page /> },
    ],
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
];
