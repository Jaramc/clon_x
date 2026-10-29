
import { BrowserRouter, Routes, Route, Navigate,} from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import FollowDemo from '../components/common/FollowDemo';
import FollowingPage from '../pages/FollowingPage';
import FollowersPage from '../pages/FollowersPage';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            {/* Página principal */}
            <Route
              path="/"
              element={
                <>
                  <h1>Clon de X</h1>
                  <p>Proyecto React - Integrante 3</p>
                  <p>Sistema de seguidores y seguidos</p>
                  <FollowDemo />
                </>
              }
            />

            {/* Usuarios que sigo */}
            <Route
              path="/following"
              element={<FollowingPage />}
            />

            {/* Usuarios que me siguen */}
            <Route
              path="/followers"
              element={<FollowersPage />}
            />

          </Route>
        </Route>

        {/* Ruta no encontrada */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
