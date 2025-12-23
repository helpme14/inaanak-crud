import { Navigate } from "react-router-dom";
import authService from "../services/auth.service";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "guardian" | "ninong";
}

export function ProtectedRoute({
  children,
  requiredRole = "admin",
}: ProtectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredRole === "admin" && !authService.isAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredRole === "guardian" && !authService.isGuardian()) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === "ninong") {
    const isNinong = localStorage.getItem("user_type") === "ninong";
    if (!isNinong) return <Navigate to="/ninong/login" replace />;
  }

  return <>{children}</>;
}
