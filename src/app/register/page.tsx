'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MatrixBackground from '@/components/MatrixBackground'
import { registerUser } from '@/lib/client-storage'

export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    startingBalance: 100,
    riskProfile: 'medium'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = registerUser(formData)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Erro ao criar conta')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-500 flex items-center justify-center p-4">
      <MatrixBackground />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-black/80 border border-green-800 p-6 rounded-lg">
          <h1 className="text-2xl font-bold text-center mb-6">CRIAR CONTA</h1>
          
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-400 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm text-green-600 mb-1">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full bg-black border border-green-800 p-3 rounded text-green-500 focus:border-green-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-green-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-black border border-green-800 p-3 rounded text-green-500 focus:border-green-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-green-600 mb-1">Senha</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-black border border-green-800 p-3 rounded text-green-500 focus:border-green-400 outline-none"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-green-800 hover:bg-green-700 text-black font-bold py-3 rounded transition-colors"
                >
                  CONTINUAR
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm text-green-600 mb-2">Capital Inicial</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[25, 50, 100].map(amount => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setFormData({...formData, startingBalance: amount})}
                        className={`p-3 rounded border transition-colors ${
                          formData.startingBalance === amount
                            ? 'bg-green-800 border-green-400 text-black'
                            : 'border-green-800 hover:border-green-600'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-green-600 mb-2">Perfil de Risco</label>
                  <div className="space-y-2">
                    {[
                      { id: 'safe', label: 'SEGURO', desc: 'Entradas >= 0.70, menor risco' },
                      { id: 'medium', label: 'MEDIO', desc: 'Entradas >= 0.60, equilibrado' },
                      { id: 'aggressive', label: 'AGRESSIVO', desc: 'Entradas >= 0.55, maior retorno' }
                    ].map(profile => (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => setFormData({...formData, riskProfile: profile.id})}
                        className={`w-full p-3 rounded border text-left transition-colors ${
                          formData.riskProfile === profile.id
                            ? 'bg-green-800 border-green-400'
                            : 'border-green-800 hover:border-green-600'
                        }`}
                      >
                        <p className="font-bold">{profile.label}</p>
                        <p className="text-xs text-green-400">{profile.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded transition-colors disabled:opacity-50"
                >
                  {loading ? 'CRIANDO...' : 'CRIAR CONTA E COMECAR'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-green-600 hover:text-green-400 py-2"
                >
                  Voltar
                </button>
              </>
            )}
          </form>

          <p className="text-center text-sm text-green-600 mt-4">
            Ja tem conta?{' '}
            <button onClick={() => router.push('/login')} className="text-green-400 hover:underline">
              Entrar
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
