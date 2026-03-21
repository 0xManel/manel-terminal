"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import MatrixBackground from "@/components/MatrixBackground"

export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    startingBalance: 100,
    riskProfile: "medium",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 2) {
      setStep(2)
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push("/dashboard")
      } else {
        setError(data.error || "Falha no registro")
      }
    } catch {
      setError("Erro de conexao")
    }
    setLoading(false)
  }

  const riskProfiles = [
    { id: "safe", name: "SEGURO", desc: "Menor risco, entradas conservadoras", color: "text-terminal-cyan", border: "border-terminal-cyan/50" },
    { id: "medium", name: "MODERADO", desc: "Equilibrio entre risco e retorno", color: "text-terminal-yellow", border: "border-terminal-yellow/50" },
    { id: "aggressive", name: "AGRESSIVO", desc: "Maior risco, maior potencial", color: "text-terminal-red", border: "border-terminal-red/50" },
  ]

  return (
    <main className="min-h-screen flex flex-col relative">
      <MatrixBackground />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center fade-in-up">
            <Link href="/" className="font-display text-2xl font-black glow">
              MANEL_TERMINAL
            </Link>
            <p className="mt-2 text-terminal-green/40 text-xs">Crie sua conta</p>
          </div>

          {/* Progress */}
          <div className="flex gap-2 fade-in-up delay-1">
            <div className={`flex-1 h-1 rounded transition-all ${step >= 1 ? "bg-terminal-green" : "bg-terminal-green/20"}`} />
            <div className={`flex-1 h-1 rounded transition-all ${step >= 2 ? "bg-terminal-green" : "bg-terminal-green/20"}`} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-5 bg-terminal-bg/90 backdrop-blur-sm border border-terminal-green/20 rounded fade-in-up delay-2">
            {error && (
              <div className="p-2 bg-terminal-red/10 border border-terminal-red/50 text-terminal-red text-sm rounded text-center">
                {error}
              </div>
            )}

            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs text-terminal-green/50 mb-1">NOME DE USUARIO</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full terminal-input p-3 rounded text-sm"
                    placeholder="seu_nome"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-terminal-green/50 mb-1">EMAIL</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full terminal-input p-3 rounded text-sm"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-terminal-green/50 mb-1">SENHA</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full terminal-input p-3 rounded text-sm"
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-xs text-terminal-green/50 mb-2">SALDO INICIAL (SIMULADO)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[25, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setForm({ ...form, startingBalance: amt })}
                        className={`p-3 border rounded font-display text-sm transition-all ${
                          form.startingBalance === amt
                            ? "border-terminal-green bg-terminal-green/20 text-terminal-green"
                            : "border-terminal-green/30 text-terminal-green/50 hover:border-terminal-green/60"
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-terminal-green/50 mb-2">PERFIL DE RISCO</label>
                  <div className="space-y-2">
                    {riskProfiles.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setForm({ ...form, riskProfile: p.id })}
                        className={`w-full p-3 border rounded text-left transition-all ${
                          form.riskProfile === p.id
                            ? `${p.border} bg-terminal-green/10`
                            : "border-terminal-green/20 hover:border-terminal-green/40"
                        }`}
                      >
                        <div className={`font-bold text-sm ${p.color}`}>{p.name}</div>
                        <div className="text-xs text-terminal-green/50">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-terminal-green/30 rounded text-sm hover:border-terminal-green/60 transition-all"
                >
                  VOLTAR
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-terminal py-3 rounded font-bold disabled:opacity-50"
              >
                {loading ? "..." : step < 2 ? "PROXIMO" : "COMECAR"}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-terminal-green/50 fade-in-up delay-3">
            Ja tem conta?{" "}
            <Link href="/login" className="text-terminal-cyan hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
