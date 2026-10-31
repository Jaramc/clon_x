import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import FeedPage from '../pages/FeedPage';
import ComposePage from '../pages/ComposePage';
import FollowersPage from '../pages/FollowersPage';
import FollowingPage from '../pages/FollowingPage';
import UserTweetsPage from '../pages/UserTweetsPage';

// Complete router connecting all pages with ProtectedRoute and MainLayout
const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <FeedPage />,
      },
      {
        path: 'feed',
        element: <FeedPage />,
      },
      {
        path: 'home',
        element: <HomePage />,
      },
      {
        path: 'compose',
        element: <ComposePage />,
      },
      {
        path: 'followers',
        element: <FollowersPage />,
      },
      {
        path: 'following',
        element: <FollowingPage />,
      },
      {
        path: 'users/:username',
        element: <UserTweetsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
