'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [pin, setPin] = useState('')
  const [exists, setExists] = useState<boolean | null>(null)
  const [erro, setErro] = useState('')
  const router = useRouter()
  const inputsRef = useRef<HTMLInputElement[]>([])

  useEffect(() => {
    // Verifica se PIN existe ao carregar a página
    async function checkPin() {
      try {
        const res = await fetch('/api/admin/pin-exists')
        const data = await res.json()
        setExists(data.exists)
      } catch {
        setErro('Erro ao verificar status do PIN')
      }
    }
    checkPin()
  }, [])

  const handleChange = (value: string, index: number) => {
    const newPin = pin.padEnd(4, ' ').split('')
    newPin[index] = value.slice(-1)
    const joined = newPin.join('').trim()
    setPin(joined)

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus()
    }

    if (!value && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  async function handleLogin() {
    if (pin.length < 4) {
      setErro('PIN incompleto')
      return
    }

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ pin }),
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await res.json()

    if (res.ok && data.success) {
      router.push('/admin/dashboard')
    } else {
      setErro(data.error || 'Erro ao fazer login')
    }
  }

  if (exists === null) {
    return <p>Carregando...</p>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 flex items-center justify-center p-4">
      <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-900 mb-6 text-center tracking-tight">
          {exists ? 'Digite seu PIN de acesso' : 'Definir PIN do Administrador'}
        </h1>

        <div className="flex justify-between gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              ref={(el) => {
                if (el) inputsRef.current[i] = el
              }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={pin[i] || ''}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="w-14 h-16 text-black text-2xl text-center font-medium tracking-widest bg-white/60 backdrop-blur-md rounded-xl border border-white/50 shadow-inner transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white hover:bg-gray-900 font-semibold py-2.5 rounded-xl transition duration-200 shadow-md"
        >
          {exists ? 'Entrar' : 'Definir PIN'}
        </button>

        {erro && (
          <p className="text-red-600 mt-4 text-center text-sm font-medium">{erro}</p>
        )}
      </div>
    </div>
  )
}
