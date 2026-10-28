import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ComposePage from "../pages/ComposePage";
import FollowersPage from "../pages/FollowersPage";
import FollowingPage from "../pages/FollowingPage";
import UserTweetsPage from "../pages/UserTweetsPage";
const router = createBrowserRouter([
  { path: "/login", element: <LoginPage/> },
  { path: "/register", element: <RegisterPage/> },
  { element: <ProtectedRoute/>, children: [{ path: "/", element: <MainLayout><HomePage/></MainLayout> }, { path: "/compose", element: <MainLayout><ComposePage/></MainLayout> }, { path: "/followers", element: <MainLayout><FollowersPage/></MainLayout> }, { path: "/following", element: <MainLayout><FollowingPage/></MainLayout> }, { path: "/users/:username", element: <MainLayout><UserTweetsPage/></MainLayout> }] },
  { path: "*", element: <LoginPage/> }
]);
export default router;
