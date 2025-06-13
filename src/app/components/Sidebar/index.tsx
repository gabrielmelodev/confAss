import Link from 'next/link'
import { ReactNode } from 'react'
import { LayoutDashboard, Users } from 'lucide-react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <aside className="w-64 bg-white shadow-md p-4 space-y-4">
        <h2 className="text-xl font-bold mb-4">Painel Admin</h2>
        <nav className="space-y-2">
          <Link href="/admin/dashboard" className="flex items-center gap-2 hover:text-blue-600">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/admin/dashboard/incricoes" className="flex items-center gap-2 hover:text-blue-600">
            <Users size={18} /> Ver Inscrições
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
