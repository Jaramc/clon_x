import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  deleteUser,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { validateRegistration, normalizeUsername } from '../lib/validators';
import { createUserProfile, getUserByUsername } from './userService';

const googleProvider = new GoogleAuthProvider();

// Retrieve current session profile from Firestore
export async function getSession() {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  try {
    const snapshot = await getDoc(doc(db, 'users', currentUser.uid));
    if (snapshot.exists()) {
      return { id: snapshot.id, uid: snapshot.id, ...snapshot.data() };
    }
  } catch (error) {
    console.warn('Failed to load session profile from Firestore:', error.message);
  }

  return {
    id: currentUser.uid,
    uid: currentUser.uid,
    email: currentUser.email,
  };
}

// Register a new user with transactional username and email uniqueness
export async function registerUser(values) {
  const errors = validateRegistration(values);
  if (Object.keys(errors).length) {
    throw new Error(Object.values(errors)[0]);
  }

  const cleanUsername = values.username.trim().replace(/^@/, '');
  const usernameLower = normalizeUsername(cleanUsername);

  // 1. Strict pre-validation: check if username is already taken
  const existingUser = await getUserByUsername(usernameLower);
  if (existingUser) {
    throw new Error('Ese nombre de usuario ya está en uso. Por favor elige otro.');
  }

  let credential;

  try {
    // 2. Create user in Firebase Authentication
    credential = await createUserWithEmailAndPassword(
      auth,
      values.email.trim().toLowerCase(),
      values.password
    );

    // 3. Create user profile and index in 'usernames' collection
    return await createUserProfile(credential.user.uid, {
      ...values,
      username: cleanUsername,
    });
  } catch (error) {
    // Rollback auth user if profile document creation failed
    if (credential?.user) {
      await deleteUser(credential.user).catch(() => {});
    }

    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Ese correo electrónico ya está registrado.');
    }

    if (error.code === 'auth/weak-password') {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }

    if (error.code === 'permission-denied') {
      throw new Error(
        'Firebase no permite guardar el perfil. Revisa las reglas de Firestore.'
      );
    }

    throw error;
  }
}

// Sign in with email or @username and password
export async function loginUser(identifier, password) {
  try {
    let email = (identifier || '').trim();

    // If identifier is an @username (does not contain @ or starts with @), resolve email
    if (!email.includes('@') || email.startsWith('@')) {
      const userProfile = await getUserByUsername(email);
      if (!userProfile || !userProfile.email) {
        throw new Error('No existe una cuenta registrada con ese nombre de usuario.');
      }
      email = userProfile.email;
    }

    const credential = await signInWithEmailAndPassword(
      auth,
      email.toLowerCase(),
      password
    );

    const snapshot = await getDoc(doc(db, 'users', credential.user.uid));

    if (!snapshot.exists()) {
      throw new Error(
        'La cuenta existe, pero no tiene un perfil registrado en Firestore.'
      );
    }

    return {
      id: snapshot.id,
      uid: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    if (
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-email'
    ) {
      throw new Error('Correo, usuario o contraseña incorrectos.');
    }

    throw error;
  }
}

// Sign in or register with Google popup and automatically create Firestore profile
export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  const firebaseUser = credential.user;

  try {
    const snapshot = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (snapshot.exists()) {
      return { id: snapshot.id, uid: snapshot.id, ...snapshot.data() };
    }
  } catch (error) {
    console.warn('Checking Google user profile:', error.message);
  }

  // Create profile for first-time Google sign-in
  const email = firebaseUser.email || '';
  const baseUsername = normalizeUsername(email.split('@')[0] || 'user');

  let username = baseUsername;
  let suffix = 1;

  while (await getUserByUsername(username)) {
    username = `${baseUsername}${suffix}`;
    suffix += 1;
  }

  return await createUserProfile(firebaseUser.uid, {
    username,
    email,
    name: firebaseUser.displayName || username,
  });
}

// Sign out current authenticated user
export async function logoutUser() {
  await signOut(auth);
}
