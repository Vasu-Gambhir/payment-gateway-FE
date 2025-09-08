import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import Dashboard from "./components/Dashboard";
import Send from "./components/Send";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import EmailVerification from "./components/EmailVerification";
import TransactionHistory from "./components/TransactionHistory";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRoute from "./components/AuthRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { setupAxiosInterceptors } from "./utils/axiosInterceptor";

function AppContent() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    setupAxiosInterceptors(logout, navigate);
  }, [logout, navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" />} />
        <Route
          path="/signin"
          element={
            <AuthRoute>
              <SignIn />
            </AuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRoute>
              <SignUp />
            </AuthRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <AuthRoute>
              <EmailVerification />
            </AuthRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/send"
          element={
            <ProtectedRoute>
              <Send />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionHistory />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer closeOnClick={true} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
