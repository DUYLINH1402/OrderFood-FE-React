import React from "react";
import { Outlet } from "react-router-dom";

// Pages
import Home from "../pages/Home";
import CartPage from "../pages/Cart";
import Layout from "../components/NavBar/Layout";
import LoginRegisterForm from "../components/LoginForm";
import FoodListPage from "../pages/Foods/FoodListPage";
import DongXanhIntro from "../pages/DongXanhIntro";
import RewardPointsIntro from "../pages/RewardPointsIntro";
import ProfilePage from "../pages/Profile/ProfilePage";
import ResetPasswordPage from "../components/ResetPasswordPage";
import FoodDetailPage from "../pages/Foods/FoodDetailPage/FoodDetailPage";
import FavoriteDishes from "../pages/FavoriteDishes";
import CheckoutPage from "../pages/CheckoutPage";

export const UserRoutes = [
  {
    path: "/",
    element: <Layout />,
    // errorElement: <Unauthorized />,
    children: [
      { path: "/gioi-thieu", element: <DongXanhIntro /> },
      { path: "/", element: <Home /> },
      { path: "/gio-hang", element: <CartPage /> },
      { path: "/thuc-don", element: <FoodListPage /> },
      { path: "/tich-diem", element: <RewardPointsIntro /> },
      { path: "/dang-nhap", element: <LoginRegisterForm /> },
      { path: "/ho-so", element: <ProfilePage /> },
      { path: "/yeu-thich", element: <FavoriteDishes /> },
      { path: "/mon-an/:slug", element: <FoodListPage /> },
      { path: "/mon-an/chi-tiet/:slug", element: <FoodDetailPage /> },
      { path: "/thanh-toan", element: <CheckoutPage /> },
    ],
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
];
