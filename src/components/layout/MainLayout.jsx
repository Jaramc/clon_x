import { Outlet } from 'react-router-dom';
import Header from './Header';

// Main layout wrapper supporting both nested Outlet and children props
export default function MainLayout({ children }) {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-column">
        {children || <Outlet />}
      </main>
      <aside className="right-column">
        <div className="side-panel">
          <h3>¿Qué está pasando?</h3>
          <p>Comparte ideas, sigue conversaciones y encuentra nuevas voces en Clon X.</p>
          <small>Proyecto académico · Milestone 3</small>
        </div>
        <div className="side-footer">
          Condiciones · Privacidad · Accesibilidad
          <br />
          © 2026 Clon X
        </div>
      </aside>
    </div>
  );
}
