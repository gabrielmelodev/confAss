'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface StatusData {
  limiteVagas: number
  totalInscritos: number
  totalFila: number
  vagasDisponiveis: number
}

interface UsuarioFila {
  id: string
  nomeCompleto: string
  cpf: string
  email: string
  telefone: string
  criadoEm: string
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<StatusData | null>(null)
  const [novoLimite, setNovoLimite] = useState('')
  const [fila, setFila] = useState<UsuarioFila[]>([])
  const [mensagem, setMensagem] = useState<string | null>(null)
  const router = useRouter()
  const [loadingFila, setLoadingFila] = useState(true)

  useEffect(() => {
    async function fetchFila() {
      setLoadingFila(true)
      try {
        const res = await fetch('/api/admin/inscricoes/fila', {
          cache: 'no-store',
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Erro ao buscar dados da fila.')
        const data: UsuarioFila[] = await res.json()
        setFila(data)
      } catch (error) {
        console.error('Erro ao buscar fila:', error)
      } finally {
        setLoadingFila(false)
      }
    }

    fetchFila()
    const interval = setInterval(fetchFila, 10000)
    return () => clearInterval(interval)
  }, [])

  async function fetchStatus() {
    try {
      const res = await fetch('/api/admin/inscricoes/limite', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (err) {
      console.error('Erro ao buscar status:', err)
    }
  }

  useEffect(() => {
    let isMounted = true
    let interval: NodeJS.Timeout

    async function checkToken() {
      try {
        const res = await fetch('/api/admin/check-token', { credentials: 'include' })
        if (!res.ok) {
          router.push('/admin/login')
          return
        }
        const data = await res.json()
        if (!data?.valid) {
          router.push('/admin/login')
          return
        }
        if (!isMounted) return
        await fetchStatus()
        if (!isMounted) return
        setLoading(false)
        interval = setInterval(fetchStatus, 5000)
      } catch (error) {
        console.error('Erro ao verificar token:', error)
        if (isMounted) router.push('/admin/login')
      }
    }

    checkToken()

    return () => {
      isMounted = false
      if (interval) clearInterval(interval)
    }
  }, [router])

  async function atualizarLimite() {
    setMensagem(null)
    const valor = Number(novoLimite)
    if (isNaN(valor) || valor <= 0) {
      setMensagem('Informe um número válido para o limite.')
      return
    }

    const res = await fetch('/api/admin/inscricoes/limite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ novoLimite: valor }),
    })

    const data = await res.json()

    if (res.ok) {
      if (data.statusAtualizado) {
        setStatus(data.statusAtualizado)
      } else {
        setStatus((prev) => (prev ? { ...prev, limiteVagas: valor } : null))
      }
      setMensagem(data.mensagem || 'Limite atualizado com sucesso!')
      setNovoLimite('')
      if (data.liberados && data.liberados.length > 0) {
        setFila((oldFila) => oldFila.filter((item) => !data.liberados.includes(item.id)))
      }
    } else {
      setMensagem(data.mensagem || 'Erro ao atualizar limite.')
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-lg font-medium text-gray-700">
        Carregando credenciais do PIN...
      </div>
    )
  }

  const isError =
    mensagem &&
    (mensagem.toLowerCase().includes('erro') ||
      (status?.vagasDisponiveis === 0 && !mensagem.toLowerCase().includes('atualizado')))

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4 sm:p-6">
      {/* Status geral */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Status das Inscrições</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {[
            { label: 'Total de inscritos', value: status?.totalInscritos ?? '-' },
            { label: 'Total na fila de espera', value: status?.totalFila ?? '-' },
            { label: 'Limite atual', value: status?.limiteVagas ?? '-' },
            { label: 'Vagas disponíveis', value: status?.vagasDisponiveis ?? '-' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col bg-gray-50 rounded-md p-4 shadow-sm border border-gray-200"
            >
              <span className="text-sm text-gray-600">{label}</span>
              <span className="mt-1 text-xl font-semibold text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            min={1}
            placeholder="Novo limite"
            value={novoLimite}
            onChange={(e) => setNovoLimite(e.target.value)}
            className="flex-grow border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <button
            onClick={atualizarLimite}
            disabled={!novoLimite}
            className={`px-6 py-2 rounded-md text-white font-semibold transition
              ${!novoLimite ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'}`}
          >
            Atualizar Limite
          </button>
        </div>

        {mensagem && (
          <p
            className={`mt-4 flex items-center gap-2 text-sm font-medium ${
              isError ? 'text-red-600' : 'text-green-700'
            }`}
          >
            {isError ? (
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-green-700 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {mensagem.toLowerCase().includes('vaga') && (status?.vagasDisponiveis ?? 0) > 0
              ? `Vagas disponíveis: ${status?.vagasDisponiveis ?? 0}`
              : mensagem}
          </p>
        )}
      </section>

      {/* Fila de Espera */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Fila de Espera</h2>

        {loadingFila ? (
          <p className="text-gray-600">Carregando fila de espera...</p>
        ) : fila.length === 0 ? (
          <p className="text-gray-600">Nenhuma pessoa na fila de espera.</p>
        ) : (
          <ul className="max-h-[400px] overflow-y-auto divide-y divide-gray-200 rounded-md border border-gray-200">
            {fila.map((usuario) => (
              <li key={usuario.id} className="p-4 hover:bg-gray-50 transition cursor-default">
                <p className="text-lg font-medium text-gray-900">{usuario.nomeCompleto}</p>
                <p className="text-sm text-gray-700 select-text">
                  <strong>CPF:</strong> {usuario.cpf} &nbsp;&nbsp;
                  <strong>Email:</strong> {usuario.email}
                </p>
                <p className="text-sm text-gray-700 select-text">
                  <strong>Telefone:</strong> {usuario.telefone}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Inscrito em: {new Date(usuario.criadoEm).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
