import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useContext(AuthContext);

  // Si el usuario aún no carga, mostramos un mensaje básico
  if (!user) {
    return <div style={{ padding: '20px' }}>Cargando inicio...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Inicio</h1>

      {/* Contadores de seguidores y seguidos */}
      <div style={{ display: 'flex', gap: '20px', margin: '20px 0', padding: '15px', border: '1px solid #ccc', borderRadius: '10px' }}>
        <div>
          <Link to="/following" style={{ textDecoration: 'none', color: '#333' }}>
            <strong>{user.followingCount || 85}</strong> Siguiendo
          </Link>
        </div>
        <div>
          <Link to="/followers" style={{ textDecoration: 'none', color: '#333' }}>
            <strong>{user.followersCount || 150}</strong> Seguidores
          </Link>
        </div>
      </div>

      {/* Enlace Tweet */}
      <div style={{ marginTop: '30px' }}>
        <Link
          to="/compose"
          style={{ padding: '10px 20px', backgroundColor: '#1DA1F2', color: 'white', textDecoration: 'none', borderRadius: '20px', fontWeight: 'bold' }}
        >
          Tweet
        </Link>
      </div>
    </div>
  );
}