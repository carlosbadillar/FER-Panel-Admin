'use client';

import { Search, Bell, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Left */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-gray-700">
          Portal de Gestión
        </h2>
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
          Fundación Educación
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <Search className="w-5 h-5" />
        </button>
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button className="w-9 h-9 bg-fer-blue rounded-full flex items-center justify-center text-white hover:bg-fer-blue-dark transition">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
