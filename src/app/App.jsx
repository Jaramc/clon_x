<<<<<<< HEAD
import { RouterProvider } from 'react-router-dom';
import router from './router';

// Root component that provides the router to the whole application
function App() {
  return <RouterProvider router={router} />;
}

export default App;
=======

import { RouterProvider } from "react-router-dom";
import router from "./router";
import { AuthProvider } from "../context/AuthContext";
import "../styles/tokens.css";


export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
>>>>>>> origin/feature/spa
