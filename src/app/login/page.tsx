"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import MatrixBackground from "@/components/MatrixBackground"

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push("/dashboard")
      } else {
        setError(data.error || "Falha no login")
      }
    } catch {
      setError("Erro de conexao")
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex flex-col relative">
      <MatrixBackground />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center fade-in-up">
            <Link href="/" className="font-display text-2xl font-black glow">
              MANEL_TERMINAL
            </Link>
            <p className="mt-2 text-terminal-green/40 text-xs">Acesse sua conta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-5 bg-terminal-bg/90 backdrop-blur-sm border border-terminal-green/20 rounded fade-in-up delay-1">
            {error && (
              <div className="p-2 bg-terminal-red/10 border border-terminal-red/50 text-terminal-red text-sm rounded text-center">
                {error}
              </div>
            )}

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
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-terminal py-3 rounded font-bold disabled:opacity-50"
            >
              {loading ? "ENTRANDO..." : "ENTRAR"}
            </button>
          </form>

          <p className="text-center text-sm text-terminal-green/50 fade-in-up delay-2">
            Nao tem conta?{" "}
            <Link href="/register" className="text-terminal-cyan hover:underline">
              Criar agora
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
