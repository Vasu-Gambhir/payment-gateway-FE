import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    toast.warn("You need to be logged in to access this page");
    return <Navigate to="/signup" replace />; // Redirect to login if not authenticated
  }

  return <>{children}</>;
};

export default ProtectedRoute;
