'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [verificando, setVerificando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/check-token');
        if (res.ok) {
          setVerificando(false);
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    }

    checkAuth();
  }, [router]);

  if (verificando) {
    return <div>Verificando autenticação...</div>;
  }

  return <>{children}</>;
}
