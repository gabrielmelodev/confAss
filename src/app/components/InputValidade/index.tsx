'use client'

import { useState, useEffect, useRef } from 'react'
import { useField, useFormikContext } from 'formik'
import * as Dialog from '@radix-ui/react-dialog'

interface EnderecoViaCEP {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  tipo?: 'texto' | 'cpf' | 'cep' | 'email' | 'dataNascimento' | 'data' | 'telefone'
  onCEP?: (endereco: EnderecoViaCEP) => void
  verificarDuplicado?: boolean
  name: string
}

const SUGESTOES_EMAIL = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com.br']

function formatarTelefone(telefone: string): string {
  telefone = telefone.replace(/\D/g, '').slice(0, 11)

  if (telefone.length <= 10) {
    return telefone.replace(/(\d{2})(\d{4})(\d{0,4})/, (match, ddd, parte1, parte2) =>
      `(${ddd}) ${parte1}${parte2 ? `-${parte2}` : ''}`
    )
  } else {
    return telefone.replace(/(\d{2})(\d{5})(\d{0,4})/, (match, ddd, parte1, parte2) =>
      `(${ddd}) ${parte1}${parte2 ? `-${parte2}` : ''}`
    )
  }
}

function formatarCEP(cep: string): string {
  cep = cep.replace(/\D/g, '').slice(0, 8)
  return cep.replace(/(\d{5})(\d{0,3})/, (match, p1, p2) => `${p1}${p2 ? `-${p2}` : ''}`)
}

function formatarCPF(cpf: string): string {
  cpf = cpf.replace(/\D/g, '').slice(0, 11)
  return cpf.replace(/(\d{3})(\d{0,3})(\d{0,3})(\d{0,2})/, (match, p1, p2, p3, p4) =>
    [p1, p2, p3].filter(Boolean).join('.') + (p4 ? `-${p4}` : '')
  )
}




function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i)
  let resto = 11 - (soma % 11)
  if (resto >= 10) resto = 0
  if (resto !== parseInt(cpf[9])) return false

  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i)
  resto = 11 - (soma % 11)
  if (resto >= 10) resto = 0

  return resto === parseInt(cpf[10])
}

function ModalAviso({ aberto, onFechar, mensagem }: { aberto: boolean; onFechar: () => void; mensagem: string }) {
  return (
    <Dialog.Root open={aberto} onOpenChange={onFechar}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/40 fixed inset-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
          <Dialog.Title className="text-lg font-semibold text-black mb-2">Atenção</Dialog.Title>
          <Dialog.Description className="text-sm text-gray-700 mb-4">{mensagem}</Dialog.Description>
          <div className="flex justify-end">
            <button
              onClick={onFechar}
              className="px-4 py-1.5 text-sm font-medium bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Fechar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}



export function InputValido({ label, tipo = 'texto', onCEP, verificarDuplicado, ...props }: InputProps) {
  const [field, meta] = useField(props.name)
  const { setFieldValue } = useFormikContext<any>()

  const [modalAberto, setModalAberto] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [sugestoes, setSugestoes] = useState<string[]>([])

  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const ultimoValorRef = useRef<string>('')

  const valor = field.value || ''

  // Consulta ViaCEP
  useEffect(() => {
    if (tipo === 'cep' && onCEP && valor?.length === 9) {
      const numero = valor.replace(/\D/g, '')
      if (numero.length !== 8) return

      fetch(`https://viacep.com.br/ws/${numero}/json/`)
        .then(res => res.json())
        .then((data: EnderecoViaCEP) => {
          if (!data.erro) onCEP(data)
        })
        .catch(() => {
          setMensagem('Erro ao buscar o CEP. Verifique a conexão.')
          setModalAberto(true)
        })
    }
  }, [valor, tipo, onCEP])

  // Verificação de CPF duplicado
  useEffect(() => {
    if (!verificarDuplicado || tipo !== 'cpf' || !valor) return

    const numero = valor.replace(/\D/g, '')
    if (numero.length !== 11 || !validarCPF(numero)) return
    if (numero === ultimoValorRef.current) return

    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    debounceTimer.current = setTimeout(() => {
      ultimoValorRef.current = numero
      setVerificando(true)

    fetch(`/api/inscricoes/check-cpf?cpf=${numero}`)
  .then(async res => {
    const contentType = res.headers.get('content-type') || ''

    // Verifica se a resposta é JSON e tem conteúdo
    if (contentType.includes('application/json')) {
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro desconhecido na verificação do CPF.')
      }

      if (data.exists) {
        setMensagem('CPF já cadastrado. Deseja atualizar os dados?')
        setModalAberto(true)
      }
    } else {
      // Se não for JSON, lança erro para tratar no catch
      throw new Error('Resposta inesperada do servidor.')
    }
  })
  .catch(err => {
    // Aqui você pode ignorar erros específicos, se quiser
    if (err.message && err.message.includes('undefined is not valid JSON')) {
      console.warn('Erro de JSON ignorado:', err.message)
      return
    }
    setMensagem(err.message || 'Erro inesperado ao verificar CPF.')
    setModalAberto(true)
  })
}, 500)
  }, [verificarDuplicado, tipo, valor])

  // Sugestões de e-mail
  useEffect(() => {
    if (tipo !== 'email') return

    if (!valor.includes('@')) {
      setSugestoes([])
      return
    }

    const [prefixo, dominio] = valor.split('@')
    if (!dominio) {
      setSugestoes(SUGESTOES_EMAIL.map(s => prefixo + s))
    } else {
      const filtro = SUGESTOES_EMAIL.filter(s => s.startsWith('@' + dominio))
      setSugestoes(filtro.map(s => prefixo + s))
    }
  }, [valor, tipo])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let novoValor = e.target.value
    if (tipo === 'cpf') novoValor = formatarCPF(novoValor)
    setFieldValue(props.name, novoValor)
  }

  return (
    <div className="mb-4 relative">
      <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={props.id || props.name}
        {...field}
        {...props}
        onChange={handleChange}
        type={tipo === 'dataNascimento' || tipo === 'data' ? 'date' : 'text'}
        className={`w-full border px-3 text-black py-2 rounded ${meta.touched && meta.error ? 'border-red-500' : 'border-gray-300'}`}
        disabled={props.disabled}
        placeholder={verificando ? 'Verificando...' : props.placeholder}
        autoComplete={tipo === 'email' ? 'off' : 'on'}
      />

      {tipo === 'email' && sugestoes.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded shadow mt-1 w-full">
          {sugestoes.map((s, i) => (
            <li
              key={i}
              className="px-3 py-1 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => setFieldValue(props.name, s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}

      {meta.touched && meta.error && (
        <div className="text-red-600 text-sm mt-1">{meta.error}</div>
      )}

      <ModalAviso aberto={modalAberto} onFechar={() => setModalAberto(false)} mensagem={mensagem} />
    </div>
  )
}
