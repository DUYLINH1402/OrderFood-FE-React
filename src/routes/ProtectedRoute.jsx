import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles, redirectPath = "/unauthorized" }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user || !user.role) return <Navigate to={redirectPath} replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to={redirectPath} replace />;

  return children;
};

export default ProtectedRoute;
