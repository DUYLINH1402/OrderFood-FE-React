import React from "react";
import { Outlet } from "react-router-dom";

// Pages
import Home from "../pages/Home";
import CartPage from "../pages/Cart";
import Layout from "../components/NavBar/Layout";
import LoginRegisterForm from "../components/LoginForm";
import FoodListPage from "../pages/Foods/FoodListPage";
import FoodDetailPage from "../components/FoodDetailPage";
import DongXanhIntro from "../pages/DongXanhIntro";
import RewardPointsIntro from "../pages/RewardPointsIntro";
import ProfilePage from "../pages/Profile/ProfilePage";

export const UserRoutes = [
  {
    path: "/",
    element: <Layout />,
    // errorElement: <Unauthorized />,
    children: [
      { path: "/gioi-thieu", element: <DongXanhIntro /> },
      { path: "/", element: <Home /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/thuc-don", element: <FoodListPage /> },
      { path: "/tich-diem", element: <RewardPointsIntro /> },
      { path: "/login", element: <LoginRegisterForm /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/foods/:slug", element: <FoodListPage /> },
      { path: "/foods/slug/:slug", element: <FoodDetailPage /> },
    ],
  },
];
