import React from "react";
import { Outlet } from "react-router-dom";

// Pages
import Home from "../pages/Home";
import Cart from "../pages/Cart";
import Layout from "../components/NavBar/Layout";
import { LoginForm } from "../components/LoginForm";
import FoodListPage from "../pages/Foods/FoodListPage";

export const UserRoutes = [
  {
    path: "/",
    element: <Layout />,
    // errorElement: <Unauthorized />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/cart", element: <Cart /> },
      { path: "/foods", element: <FoodListPage /> },
      { path: "/login", element: <LoginForm /> },
    ],
  },
];
