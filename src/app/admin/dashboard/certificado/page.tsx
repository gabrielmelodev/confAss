'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Send, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog'



type Inscricao = {
  id: string
  nome: string
  email: string
  enviado: boolean
}

export default function CertificadosPage() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [selecionadas, setSelecionadas] = useState<string[]>([])
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    // Buscar inscrições do banco
    const fetchInscricoes = async () => {
      const res = await fetch('/api/admin/inscricoes')
      const data = await res.json()
      setInscricoes(data)
    }

    fetchInscricoes()
  }, [])

  const toggleSelecionada = (id: string) => {
    setSelecionadas(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const enviarCertificados = async () => {
    setEnviando(true)
    try {
      await fetch('/api/admin/certificados/enviar', {
        method: 'POST',
        body: JSON.stringify({ ids: selecionadas }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      // Atualiza status
      setInscricoes(prev =>
        prev.map(i =>
          selecionadas.includes(i.id) ? { ...i, enviado: true } : i
        )
      )
      setSelecionadas([])
    } catch (e) {
      alert('Erro ao enviar certificados')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Envio de Certificados</h1>

      <div className="border rounded-lg overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Selecionar</th>
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">E-mail</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {inscricoes.map((inscricao) => (
              <tr key={inscricao.id} className="border-t">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selecionadas.includes(inscricao.id)}
                    onChange={() => toggleSelecionada(inscricao.id)}
                    disabled={inscricao.enviado}
                  />
                </td>
                <td className="p-3">{inscricao.nome}</td>
                <td className="p-3">{inscricao.email}</td>
                <td className="p-3">
                  {inscricao.enviado ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle size={16} /> Enviado
                    </span>
                  ) : (
                    'Pendente'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <button
              onClick={enviarCertificados}
              disabled={selecionadas.length === 0 || enviando}
              className={`px-4 py-2 rounded-md text-white ${
                enviando ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {enviando ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} /> Enviando...
                </>
              ) : (
                <>
                   Enviar certificados
                </>
              )}
            </button>
          </DialogTrigger>
          <DialogContent>
            <p className="text-lg font-medium">
              Certificados enviados com sucesso!
            </p>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
