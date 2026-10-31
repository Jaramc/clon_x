<<<<<<< HEAD
import { Outlet } from 'react-router-dom';
import Header from './Header';
import './MainLayout.css';

// Main layout wrapper with Header at top and page content below
function MainLayout() {
  return (
    <div className="main-layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
=======
import Header from "./Header";
export default function MainLayout({ children }) {
  return <div className="app-shell"><Header /><main className="main-column">{children}</main><aside className="right-column"><div className="side-panel"><h3>¿Qué está pasando?</h3><p>Comparte ideas, sigue conversaciones y encuentra nuevas voces en Clon X.</p><small>Proyecto académico · Milestone 2</small></div><div className="side-footer">Condiciones · Privacidad · Accesibilidad<br/>© 2026 Clon X</div></aside></div>;
}
>>>>>>> origin/feature/spa
