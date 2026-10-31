import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Hook to access authentication context
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  }

  return context;
}

export default useAuth;
