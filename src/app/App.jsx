import { RouterProvider } from 'react-router-dom';
import router from './router';
import { AuthProvider } from '../context/AuthContext';
import '../styles/tokens.css';

// Root application component providing Auth and Router context
export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
