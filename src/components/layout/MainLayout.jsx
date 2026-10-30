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
