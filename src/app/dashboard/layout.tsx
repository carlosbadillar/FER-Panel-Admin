'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-fer-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Sesión válida pero no es admin (p. ej. sesión anónima de la app móvil en el mismo navegador)
  if (!user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-sm text-center bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">Acceso restringido</h1>
          <p className="mt-2 text-sm text-gray-500">
            Esta cuenta no tiene permisos de administrador para el panel FER Conecta.
          </p>
          <button
            type="button"
            onClick={signOut}
            className="mt-5 w-full bg-fer-blue hover:bg-fer-blue-dark text-white font-semibold py-2.5 rounded-lg text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[260px]">
        <Header />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
