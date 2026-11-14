'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  Megaphone,
  LogOut,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/anuncios', label: 'Gestión de Anuncios', icon: Megaphone },
];

function iniciales(nombre: string) {
  return (
    nombre
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'A'
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const nombre = user?.displayName || user?.email?.split('@')[0] || 'Administrador';

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-sidebar flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-fer-blue rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <div>
          <h1 className="text-white font-bold text-base leading-tight">FER Conecta</h1>
          <p className="text-gray-400 text-xs">Panel Administrador</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'nav-item',
                isActive ? 'nav-item-active' : 'nav-item-inactive'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin Profile */}
      <div className="px-4 pb-4 border-t border-slate-700/50 pt-4 mt-auto">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {iniciales(nombre)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium leading-tight truncate" title={user?.email ?? ''}>
              {nombre}
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Admin activo
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-1.5 hover:text-white transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
}
