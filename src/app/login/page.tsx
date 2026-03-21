'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MatrixBackground from '@/components/MatrixBackground'
import { loginUser } from '@/lib/client-storage'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = loginUser(email, password)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Erro ao entrar')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-500 flex items-center justify-center p-4">
      <MatrixBackground />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-black/80 border border-green-800 p-6 rounded-lg">
          <h1 className="text-2xl font-bold text-center mb-6">ENTRAR</h1>
          
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-400 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-green-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-black border border-green-800 p-3 rounded text-green-500 focus:border-green-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-green-600 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black border border-green-800 p-3 rounded text-green-500 focus:border-green-400 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>
          </form>

          <p className="text-center text-sm text-green-600 mt-4">
            Nao tem conta?{' '}
            <button onClick={() => router.push('/register')} className="text-green-400 hover:underline">
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
