// Pages
import Landing from "../pages/public/Landing";
import VerifyEmail from "../pages/public/VerifyEmail";
import CheckStatus from "../pages/CheckStatus";
import GuardianInfo from "../pages/register/GuardianInfo";
import InaanakInfo from "../pages/register/InaanakInfo";
import ReviewSubmit from "../pages/register/ReviewSubmit";
import Success from "../pages/register/Success";
import AdminLogin from "../pages/admin/Login";
import AdminDashboard from "../pages/admin/Dashboard";
import InaanakDetails from "../pages/admin/InaanakDetails";
import { ProtectedRoute } from "./ProtectedRoute";
import NotFound from "../pages/public/NotFound";
import NinongLogin from "../pages/ninong/Login";
import NinongRegister from "../pages/ninong/Register";
import NinongDashboard from "../pages/ninong/Dashboard";
import NinongInvites from "../pages/ninong/Invites";
import NinongRegistrations from "../pages/ninong/Registrations";
import NinongVerified from "../pages/ninong/Verified";
import NinongVerifyCode from "../pages/ninong/VerifyCode";

const routes = [
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/check-status",
    element: <CheckStatus />,
  },
  {
    path: "/register/guardian-info",
    element: <GuardianInfo />,
  },
  {
    path: "/register/inaanak-info",
    element: <InaanakInfo />,
  },
  {
    path: "/register/review-submit",
    element: <ReviewSubmit />,
  },
  {
    path: "/register/success",
    element: <Success />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/ninong/login",
    element: <NinongLogin />,
  },
  {
    path: "/ninong/register",
    element: <NinongRegister />,
  },
  {
    path: "/ninong/verified",
    element: <NinongVerified />,
  },
  {
    path: "/ninong/verify",
    element: (
      <ProtectedRoute requiredRole="ninong">
        <NinongVerifyCode />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ninong/dashboard",
    element: (
      <ProtectedRoute requiredRole="ninong">
        <NinongDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ninong/invites",
    element: (
      <ProtectedRoute requiredRole="ninong">
        <NinongInvites />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ninong/registrations",
    element: (
      <ProtectedRoute requiredRole="ninong">
        <NinongRegistrations />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/details/:id",
    element: (
      <ProtectedRoute requiredRole="admin">
        <InaanakDetails />
      </ProtectedRoute>
    ),
  },
  // Catch-all 404 route
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
