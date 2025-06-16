'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import { LayoutDashboard, Menu, Users, X, LogOut, Mail } from 'lucide-react';
import { AdminGuard } from '@/app/components/AdminGuard';
import { motion } from 'framer-motion'
import Image from 'next/image';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);


  useEffect(() => {
    function handleResize() {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);

      // Se mudar para desktop, fecha menu móvel
      if (desktop) {
        setMenuAberto(false);
      }
    }
    handleResize(); // roda na montagem para setar o estado inicial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/admin/login');
    } catch (error) {
      console.error('Erro ao realizar logout:', error);
    }
  };

  // Função para saber se o link está ativo
  const isActive = (href: string) => pathname === href;

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
        {/* Backdrop mobile */}
        {menuAberto && (
          <div
            onClick={() => setMenuAberto(false)}
            className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
            aria-hidden="true"
          />
        )}

        {/* Menu lateral */}
        <motion.aside
          initial={{ x: '-100%', opacity: 0 }}
          animate={
            isDesktop
              ? { x: 0, opacity: 1 }          // desktop: sempre visível
              : menuAberto
                ? { x: 0, opacity: 1 }          // mobile: aberto
                : { x: '-100%', opacity: 0 }    // mobile: fechado
          }
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className={`
    fixed top-0 left-0 z-40 h-auto w-72 bg-white shadow-md rounded-r-2xl
    md:static md:translate-x-0 md:opacity-100
    flex flex-col
  `}
          aria-label="Menu lateral do painel administrativo"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 md:sticky md:top-0 md:z-10 bg-white rounded-r-2xl">
            <motion.div
              className="flex items-center gap-3 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Image
                width={40}
                height={40} // ajuste conforme necessári
                src="/logo.png" // ajuste conforme necessário
                alt="COMAS"
                className="h-10 w-auto object-contain select-none"
              />
            </motion.div>

            <button
              onClick={() => setMenuAberto(false)}
              aria-label="Fechar menu"
              className="text-gray-700 hover:text-blue-700 transition-colors duration-150 md:hidden"
            >
              <X size={28} />
            </button>
          </div>

          <nav className="flex flex-col flex-1 p-6 space-y-3 overflow-y-auto">
            <Link
              href="/admin/dashboard"
              onClick={() => setMenuAberto(false)}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-lg font-medium
                transition-colors duration-200
                ${isActive('/admin/dashboard')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
              `}
            >
              <LayoutDashboard size={22} className={isActive('/admin/dashboard') ? 'text-white' : 'text-blue-600'} />
              Dashboard
            </Link>

            <Link
              href="/admin/dashboard/incricoes"
              onClick={() => setMenuAberto(false)}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-lg font-medium
                transition-colors duration-200
                ${isActive('/admin/dashboard/incricoes')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
              `}
            >
              <Users size={22} className={isActive('/admin/dashboard/incricoes') ? 'text-white' : 'text-blue-600'} />
              Ver Inscrições
            </Link>
            <Link
              href="/admin/dashboard/certificado"
              onClick={() => setMenuAberto(false)}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-lg font-medium
                transition-colors duration-200
                ${isActive('/admin/dashboard/certificado')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
              `}
            >
              <Mail size={22} className={isActive('/admin/dashboard/certificado') ? 'text-white' : 'text-blue-600'} />
              Enviar Certificados
            </Link>
            <button
              onClick={handleLogout}
              className="mt-auto flex items-center gap-4 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors duration-200"
            >
              <LogOut size={22} />
              Sair
            </button>
          </nav>
        </motion.aside>

        {/* Conteúdo principal */}
        <div className="flex flex-col flex-1 min-h-screen  bg-gray-50">
          {/* Header mobile fixo no topo */}
          <header className="md:hidden sticky top-0 z-20 flex items-center justify-between bg-white p-4 shadow-md border-b border-gray-200">
            <button
              onClick={() => setMenuAberto(true)}
              aria-label="Abrir menu"
              aria-expanded={menuAberto}
              aria-controls="menu-lateral"
              className="text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors duration-200"
            >
              <Menu size={28} />
            </button>
            <h1 className="text-xl font-semibold text-blue-700 select-none"></h1>
            <div className="w-8" /> {/* Espaço para balancear */}
          </header>

          {/* Área do conteúdo principal com padding e transição */}
          <main className="flex-1 p-6 transition-all duration-300 ease-in-out">
            {children}
          </main>
        </div>

      </div>
    </AdminGuard >
  );
}
