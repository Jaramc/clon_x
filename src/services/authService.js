
import { mockUsers } from '../mocks/mockUsers';

// Validar las credenciales del usuario
export function loginUser(username, password) {
  const user = mockUsers.find(
    (user) => user.username === username
  );

  if (!user || password !== '123456') {
    throw new Error('Usuario o contraseña incorrectos');
  }

  return user;
}
