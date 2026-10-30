import { useState } from 'react';
import { Link } from 'react-router-dom';

function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // eslint-disable-next-line no-alert
    alert('Registro simulado con éxito');
  };

  return (
    <section className="register-page">
      <h1>Crear tu cuenta</h1>
      <p>Únete hoy al Clon de X</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="fullName">
            Nombre completo
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nombre completo"
              required
            />
          </label>
        </div>

        <div>
          <label htmlFor="username">
            Nombre de usuario
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nombre de usuario"
              required
            />
          </label>
        </div>

        <div>
          <label htmlFor="email">
            Correo electrónico
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              required
            />
          </label>
        </div>

        <div>
          <label htmlFor="password">
            Contraseña
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
          </label>
        </div>

        <button type="submit">Registrarse</button>
      </form>

      <p>
        ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
      </p>
    </section>
  );
}

export default RegisterPage;
