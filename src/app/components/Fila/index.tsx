'use client';

import { useEffect, useState } from 'react';

interface UsuarioFila {
  id: string;
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
  criadoEm: string;
}

const ITENS_POR_PAGINA = 5;

export default function FilaDeEsperaAdmin() {
  const [fila, setFila] = useState<UsuarioFila[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const totalPaginas = Math.ceil(fila.length / ITENS_POR_PAGINA);

  useEffect(() => {
    async function fetchFila() {
      try {
        const res = await fetch('/api/admin/inscricoes/fila', {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Erro ao buscar dados da fila.');
        const data: UsuarioFila[] = await res.json();
        setFila(data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar fila:', error);
        setLoading(false);
      }
    }

    fetchFila();
    const interval = setInterval(fetchFila, 10000);
    return () => clearInterval(interval);
  }, []);

  const usuariosPagina = fila.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded shadow-md space-y-4 max-w-4xl mx-auto w-full">
      <h2 className="text-lg sm:text-xl font-bold text-center">Fila de Espera</h2>

      {loading ? (
        <p className="text-center">Carregando fila de espera...</p>
      ) : fila.length === 0 ? (
        <p className="text-center">Nenhuma pessoa na fila de espera.</p>
      ) : (
        <>
          <ul className="space-y-3 max-h-[75vh] overflow-auto">
            {usuariosPagina.map((usuario) => (
              <li key={usuario.id} className="border p-4 sm:p-5 rounded shadow-sm bg-gray-50">
                <div className="space-y-1 text-sm sm:text-base">
                  <p><strong>Nome:</strong> {usuario.nomeCompleto}</p>
                  <p><strong>CPF:</strong> {usuario.cpf}</p>
                  <p><strong>Email:</strong> {usuario.email}</p>
                  <p><strong>Telefone:</strong> {usuario.telefone}</p>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Inscrito em: {new Date(usuario.criadoEm).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))}
              disabled={paginaAtual === 1}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="self-center text-sm">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              onClick={() => setPaginaAtual((p) => Math.min(p + 1, totalPaginas))}
              disabled={paginaAtual === totalPaginas}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </>
      )}
    </div>
  );
}
