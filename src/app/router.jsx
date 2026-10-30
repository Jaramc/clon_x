/* eslint-disable import/no-named-as-default, import/no-named-as-default-member */
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import FollowingPage from '../pages/FollowingPage';
import FollowersPage from '../pages/FollowersPage';

// Router configuration with real pages and protected routes
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
        element: <HomePage />,
      },
      {
        path: 'following',
        element: <FollowingPage />,
      },
      {
        path: 'followers',
        element: <FollowersPage />,
      },
    ],
  },
]);

export default router;
