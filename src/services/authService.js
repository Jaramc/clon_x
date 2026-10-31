import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  deleteUser,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { validateRegistration, normalizeUsername } from '../lib/validators';
import { createUserProfile, getUserByUsername } from './userService';

const googleProvider = new GoogleAuthProvider();

// Retrieve current session profile from Firestore
export async function getSession() {
  const currentUser = auth.currentUser;

  if (!currentUser) return null;

  const snapshot = await getDoc(doc(db, 'users', currentUser.uid));

  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

// Register a new user in Firebase Auth and create Firestore profile
export async function registerUser(values) {
  const errors = validateRegistration(values);

  if (Object.keys(errors).length) {
    throw new Error(Object.values(errors)[0]);
  }

  // Check username uniqueness in Firestore before creating Auth user
  const existingUsername = await getUserByUsername(values.username);
  if (existingUsername) {
    throw new Error('Ese nombre de usuario ya está en uso.');
  }

  let credential;

  try {
    credential = await createUserWithEmailAndPassword(
      auth,
      values.email.trim().toLowerCase(),
      values.password
    );

    return await createUserProfile(credential.user.uid, values);
  } catch (error) {
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

// Sign in with email or username and password
export async function loginUser(identifier, password) {
  try {
    let email = (identifier || '').trim();

    // If identifier is a username (no @), look up the associated email
    if (!email.includes('@')) {
      const userProfile = await getUserByUsername(email);
      if (!userProfile || !userProfile.email) {
        throw new Error('No existe una cuenta con ese nombre de usuario.');
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
      ...snapshot.data(),
    };
  } catch (error) {
    if (
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-email'
    ) {
      throw new Error('Correo o contraseña incorrectos.');
    }

    throw error;
  }
}

// Sign in or register with Google popup
export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  const firebaseUser = credential.user;

  const snapshot = await getDoc(doc(db, 'users', firebaseUser.uid));

  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }

  const email = firebaseUser.email || '';
  const baseUsername = normalizeUsername(email.split('@')[0] || 'user');

  let username = baseUsername;
  let suffix = 1;

  while (await getUserByUsername(username)) {
    username = `${baseUsername}${suffix}`;
    suffix += 1;
  }

  const profile = {
    username,
    email,
    name: firebaseUser.displayName || username,
  };

  const createdProfile = {
    username,
    usernameLower: normalizeUsername(username),
    email,
    name: profile.name,
    bio: '',
    avatar: profile.name.slice(0, 2).toUpperCase(),
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), createdProfile);

  return { id: firebaseUser.uid, ...createdProfile };
}

// Sign out current authenticated user
export async function logoutUser() {
  await signOut(auth);
}
