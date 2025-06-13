'use client'

import { useState, useEffect, useMemo } from 'react'

// Tipos
interface Inscricao {
  id: string
  nomeCompleto: string
  numeroInscricao: number
  nomeSocial?: string | null
  dataNascimento: string
  idade: number
  cpf: string
  telefone?: string | null
  email: string
  enderecoRua: string
  enderecoBairro: string
  enderecoCidadeUF: string
  cep: string
  genero: string
  racaCor: string
  pessoaComDeficiencia: boolean
  tipoDeficiencia?: string | null
  recursoAcessibilidade: boolean
  qualAcessibilidade?: string | null
  orientacaoSexual: string
  tipoParticipante: string
  representaOrganizacao: boolean
  organizacaoNome?: string | null
  jaParticipouConferencias: boolean
  eixoTematico: string
  autorizacaoImagem: boolean
  presente: boolean
  dataPresenca?: string | null
  presencaConfirmada: boolean
  criadoEm: string
}

// Função utilitária
const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return 'Não informado'
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function InscricoesPage() {
  // Estados
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selecionado, setSelecionado] = useState<Inscricao | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [filtroNome, setFiltroNome] = useState('')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const itensPorPagina = 20

  // Requisição inicial
  useEffect(() => {
    const fetchInscricoes = async () => {
      try {
        const res = await fetch('/api/inscricoes', { cache: 'no-store' })
        if (!res.ok) throw new Error('Erro ao carregar inscrições')
        const data = await res.json()
        setInscricoes(data)
      } catch (err: any) {
        setError(err.message || 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchInscricoes()
  }, [])

  // Filtro e paginação otimizados
  const inscricoesFiltradas = useMemo(
    () =>
      inscricoes.filter((i) =>
        i.nomeCompleto.toLowerCase().includes(filtroNome.toLowerCase())
      ),
    [inscricoes, filtroNome]
  )

  const totalPaginas = useMemo(
    () => Math.ceil(inscricoesFiltradas.length / itensPorPagina),
    [inscricoesFiltradas.length]
  )

  const paginadas = useMemo(
    () =>
      inscricoesFiltradas.slice(
        (paginaAtual - 1) * itensPorPagina,
        paginaAtual * itensPorPagina
      ),
    [inscricoesFiltradas, paginaAtual]
  )

  // Atualizar localmente após confirmar presença
  const atualizarPresenca = (id: string, dados: Partial<Inscricao>) => {
    setInscricoes((prev) =>
      prev.map((insc) => (insc.id === id ? { ...insc, ...dados } : insc))
    )
    if (selecionado?.id === id) {
      setSelecionado((prev) => (prev ? { ...prev, ...dados } : prev))
    }
  }

  const handleConfirmarPresenca = async (id: string) => {
    try {
      setConfirmando(true)
      const res = await fetch(`/api/inscricoes/${id}/confirmar`, { method: 'POST' })
      if (!res.ok) throw new Error('Erro ao confirmar presença')
      const dados = await res.json()
      atualizarPresenca(id, dados)
    } catch (error) {
      alert('Erro ao confirmar presença: ' + (error instanceof Error ? error.message : ''))
    } finally {
      setConfirmando(false)
    }
  }

  const mudarPagina = (nova: number) => {
    if (nova >= 1 && nova <= totalPaginas) setPaginaAtual(nova)
  }

  // Loading e erro
  if (loading) return <p className="text-center mt-10 text-gray-600">Carregando inscrições...</p>
  if (error) return <p className="text-center text-red-600">{error}</p>

  return (
    <section className="p-6 max-w-5xl mx-auto">
      {/* Filtro e título */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Inscrições</h1>
        <input
          type="text"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          placeholder="Filtrar por nome"
          className="mt-4 w-full max-w-md p-2 border rounded shadow-sm"
        />
      </header>

      {/* Lista de inscrições */}
      <main className="bg-white rounded-md shadow divide-amber-50 divide-y">
        {paginadas.map((item) => (
          <article
            key={item.id}
            className="p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => setSelecionado(item)}
          >
            <h2 className="font-medium">{item.nomeCompleto}</h2>
            <p className="text-sm text-gray-600">{item.email}</p>
            <p className="text-xs text-gray-500">Enviado em: {formatDate(item.criadoEm)}</p>
          </article>
        ))}
      </main>

      {/* Paginação */}
      <footer className="mt-4 flex items-center justify-between">
        <button
          onClick={() => mudarPagina(paginaAtual - 1)}
          disabled={paginaAtual === 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-sm">
          Página {paginaAtual} de {totalPaginas}
        </span>
        <button
          onClick={() => mudarPagina(paginaAtual + 1)}
          disabled={paginaAtual === totalPaginas}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Próxima
        </button>
      </footer>

      {/* Modal de detalhes */}
      {selecionado && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setSelecionado(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-center">Detalhes da Inscrição</h2>
            <div className="space-y-1 text-sm">
              {[
                ['Nome Completo', selecionado.nomeCompleto],
                ['Número de Inscrição', selecionado.numeroInscricao],
                ['Nome Social', selecionado.nomeSocial ?? '—'],
                ['Data de Nascimento', formatDate(selecionado.dataNascimento)],
                ['Idade', selecionado.idade],
                ['CPF', selecionado.cpf],
                ['Telefone', selecionado.telefone ?? '—'],
                ['Email', selecionado.email],
                ['Endereço', `${selecionado.enderecoRua}, Bairro ${selecionado.enderecoBairro}`],
                ['Cidade/UF', selecionado.enderecoCidadeUF],
                ['CEP', selecionado.cep],
                ['Gênero', selecionado.genero],
                ['Raça/Cor', selecionado.racaCor],
                ['Pessoa com Deficiência', selecionado.pessoaComDeficiencia ? 'Sim' : 'Não'],
                ['Tipo de Deficiência', selecionado.tipoDeficiencia ?? '—'],
                ['Recurso de Acessibilidade', selecionado.recursoAcessibilidade ? 'Sim' : 'Não'],
                ['Qual Acessibilidade', selecionado.qualAcessibilidade ?? '—'],
                ['Orientação Sexual', selecionado.orientacaoSexual],
                ['Tipo de Participante', selecionado.tipoParticipante],
                ['Representa Organização', selecionado.representaOrganizacao ? 'Sim' : 'Não'],
                ['Organização', selecionado.organizacaoNome ?? '—'],
                ['Já participou de conferências', selecionado.jaParticipouConferencias ? 'Sim' : 'Não'],
                ['Eixo Temático', selecionado.eixoTematico],
                ['Autorização de Imagem', selecionado.autorizacaoImagem ? 'Sim' : 'Não'],
                ['Presente', selecionado.presente ? 'Sim' : 'Não'],
                ['QR Code Confirmado', selecionado.presencaConfirmada ? '✅ Sim' : '❌ Não'],
                ['Data da Confirmação', formatDate(selecionado.dataPresenca)],
                ['Enviado em', formatDate(selecionado.criadoEm)],
              ].map(([label, value]) => (
                <p key={label}>
                  <strong>{label}:</strong> {value}
                </p>
              ))}
            </div>

            {!selecionado.presencaConfirmada && (
              <button
                onClick={() => handleConfirmarPresenca(selecionado.id)}
                className="mt-6 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                disabled={confirmando}
              >
                {confirmando ? 'Confirmando...' : 'Confirmar Presença'}
              </button>
            )}

            <button
              onClick={() => setSelecionado(null)}
              className="mt-4 block w-full text-center text-gray-500 underline hover:text-gray-700 text-sm"
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      )}
    </section>
  )
}