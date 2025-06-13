// app/confirmacao/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'

export default function ConfirmacaoPage() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [inscricao, setInscricao] = useState<any | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInscricao() {
      try {
        const res = await fetch(`/api/inscricoes/${id}/confirmar`)
        if (!res.ok) throw new Error('Erro ao confirmar presença')
        const data = await res.json()
        setInscricao(data.inscricao)
      } catch (err: any) {
        setErro(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInscricao()
  }, [id])

  if (loading) return <p className="p-4">Carregando...</p>
  if (erro) return <p className="p-4 text-red-500">Erro: {erro}</p>
  if (!inscricao) return <p className="p-4">Inscrição não encontrada.</p>

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-xl p-6 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-green-700 mb-2">🎉 Presença Confirmada</h1>
        <p className="text-gray-700 mb-4">Seja muito bem-vindo(a) à conferência!</p>

     
        <div className="text-sm text-gray-800 text-left space-y-1">
          <p><strong>Nome:</strong> {inscricao.nomeCompleto}</p>
          <p><strong>CPF:</strong> {inscricao.cpf}</p>
          <p><strong>Email:</strong> {inscricao.email}</p>
          <p><strong>Eixo:</strong> {inscricao.eixoTematico}</p>
        </div>

        <button
          onClick={() => window.print()}
          className="mt-5 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Salvar Comprovante
        </button>
      </div>
    </div>
  )
}
