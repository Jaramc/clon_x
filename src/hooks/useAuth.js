<<<<<<< HEAD

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider'
    );
  }

=======
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider.");
>>>>>>> origin/feature/spa
  return context;
}
