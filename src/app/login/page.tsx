'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInDemo, error, isFirebaseConfigured } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch {
      // error is set in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = () => {
    signInDemo();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-fer-blue rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">FER</h1>
          <p className="text-gray-400 mt-1">Panel Administrador</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Iniciar Sesión
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Acceso restringido a administradores autorizados
          </p>

          {!isFirebaseConfigured && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              Firebase aún no está configurado en este entorno. El acceso demo abre el panel con los datos del prototipo.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fundacionfer.org"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fer-blue focus:border-fer-blue outline-none transition"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fer-blue focus:border-fer-blue outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-fer-blue hover:bg-fer-blue-dark text-white font-semibold py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verificando...' : 'Acceder al Panel'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">o</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemo}
            className="w-full border border-fer-blue text-fer-blue hover:bg-blue-50 font-semibold py-2.5 px-4 rounded-lg transition"
          >
            Acceso Demo
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">
            aca para presentar el dashboard a directivos, sin Firebase
          </p>

          <p className="mt-6 text-center text-xs text-gray-400">
            Fundación Esposos Rodríguez © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
