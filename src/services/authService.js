/* eslint-disable import/prefer-default-export */
import { mockUsers } from '../mocks/mockUsers';

// Validate user credentials
export function loginUser(username, password) {
  const user = mockUsers.find((mockUser) => mockUser.username === username);

  if (!user || password !== '123456') {
    throw new Error('Usuario o contraseña incorrectos');
  }

  return user;
}
