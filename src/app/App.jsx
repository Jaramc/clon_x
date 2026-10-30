// colibri-build-2026
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { AuthProvider } from "../context/AuthContext";
import "../styles/tokens.css";
export default function App() { return <AuthProvider><RouterProvider router={router}/></AuthProvider>; }
