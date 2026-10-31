<<<<<<< HEAD
import { Navigate, Outlet } from 'react-router-dom';

// Basic protected route component for beginner level
function ProtectedRoute({ children }) {
  // Mock authentication variable for Milestone 1 (change to false to test redirect)
  const isAuthenticated = true;

  // If the user is not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render child components or nested Outlet
  return children || <Outlet />;
}

export default ProtectedRoute;
=======
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
export default function ProtectedRoute() { const { user } = useAuth(); return user ? <Outlet/> : <Navigate to="/login" replace/>; }
>>>>>>> origin/feature/spa
