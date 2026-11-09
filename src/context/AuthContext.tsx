'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import type { AuthUser } from '@/types';

const DEMO_SESSION_KEY = 'fer-conecta-demo-session';

const DEMO_USER: AuthUser = {
  uid: 'demo-admin',
  email: 'demo@fundacionfer.org',
  displayName: 'Admin Fundación',
  isDemo: true,
};

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInDemo: () => void;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readDemoSession(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (parsed?.isDemo !== true || typeof parsed.uid !== 'string') return null;
    return DEMO_USER;
  } catch {
    return null;
  }
}

function persistDemoSession() {
  window.sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(DEMO_USER));
}

function clearDemoSession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(DEMO_SESSION_KEY);
}

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    isDemo: false,
  };
}

function mapAuthError(err: unknown): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Correo o contraseña incorrectos.';
    case 'auth/invalid-api-key':
    case 'auth/invalid-app-credential':
    case 'auth/app-deleted':
      return 'La configuración de Firebase no es válida. Revisa .env.local o entra con Acceso Demo.';
    case 'auth/network-request-failed':
    case 'auth/too-many-requests':
      return 'No se pudo contactar a Firebase. Puedes entrar con Acceso Demo Inmediato.';
    default:
      return err instanceof Error ? err.message : 'Error de autenticación';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setUser(readDemoSession());
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          clearDemoSession();
          setUser(toAuthUser(firebaseUser));
        } else {
          setUser(readDemoSession());
        }
        setLoading(false);
      },
      (authError) => {
        console.warn('[FER Conecta] Auth no disponible:', authError);
        setUser(readDemoSession());
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    if (!auth || !isFirebaseConfigured) {
      const message =
        'Firebase no está configurado. Completa .env.local o usa Acceso Demo Inmediato.';
      setError(message);
      throw new Error(message);
    }

    try {
      clearDemoSession();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const message = mapAuthError(err);
      setError(message);
      throw err;
    }
  };

  const signInDemo = () => {
    persistDemoSession();
    setUser(DEMO_USER);
    setError(null);
    setLoading(false);
  };

  const signOut = async () => {
    clearDemoSession();
    setUser(null);
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.warn('[FER Conecta] No se pudo cerrar la sesión de Firebase:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseConfigured,
        signIn,
        signInDemo,
        signOut,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
