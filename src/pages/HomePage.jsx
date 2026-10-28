import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import FeedPage from "./FeedPage";
export default function HomePage() { const { user } = useAuth(); return user ? <FeedPage/> : <Navigate to="/login" replace/>; }
