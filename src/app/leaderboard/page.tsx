"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import MatrixBackground from "@/components/MatrixBackground"

export default function Leaderboard() {
  const [period, setPeriod] = useState("semana")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [traders, setTraders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) setCurrentUser(JSON.parse(stored))
    
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard")
      const data = await res.json()
      if (data.success) {
        setTraders(data.leaderboard)
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex flex-col relative">
      <MatrixBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="border-b border-terminal-green/20 p-3 bg-terminal-bg/80 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-lg mx-auto">
            <Link href="/" className="font-display text-lg font-black glow">MANEL_TERMINAL</Link>
            <Link href="/dashboard" className="text-terminal-cyan hover:underline text-xs">VOLTAR</Link>
          </div>
        </header>
        <div className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-xl">RANKING</h2>
            <div className="flex gap-1">
              {["dia", "semana", "mes"].map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={period === p ? "px-2 py-1 text-xs rounded bg-terminal-green text-terminal-bg" : "px-2 py-1 text-xs rounded border border-terminal-green/30 text-terminal-green/50"}>
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-terminal-green/50">Carregando...</div>
          ) : traders.length === 0 ? (
            <div className="text-center py-8 text-terminal-green/50">Nenhum trader ainda</div>
          ) : (
            <>
              {traders.length >= 3 && (
                <div className="grid grid-cols-3 gap-2 py-4">
                  <div className="flex flex-col items-center justify-end">
                    <div className="text-2xl mb-1">🥈</div>
                    <div className="w-full p-2 bg-terminal-bg/80 border border-terminal-green/20 rounded text-center">
                      <div className="font-bold text-xs truncate">{traders[1]?.username}</div>
                      <div className="text-terminal-green text-sm">{traders[1]?.pnl >= 0 ? "+" : ""}${traders[1]?.pnl?.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-end">
                    <div className="text-3xl mb-1">🥇</div>
                    <div className="w-full p-3 bg-terminal-green/10 border-2 border-terminal-green rounded text-center">
                      <div className="font-bold text-sm truncate">{traders[0]?.username}</div>
                      <div className="text-terminal-green font-display text-xl glow">{traders[0]?.pnl >= 0 ? "+" : ""}${traders[0]?.pnl?.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-end">
                    <div className="text-2xl mb-1">🥉</div>
                    <div className="w-full p-2 bg-terminal-bg/80 border border-terminal-green/20 rounded text-center">
                      <div className="font-bold text-xs truncate">{traders[2]?.username}</div>
                      <div className="text-terminal-green text-sm">{traders[2]?.pnl >= 0 ? "+" : ""}${traders[2]?.pnl?.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-terminal-bg/80 border border-terminal-green/20 rounded overflow-hidden">
                {traders.map((t) => (
                  <div key={t.email}
                    className={"flex items-center justify-between p-3 border-b border-terminal-green/10 last:border-0 " + (currentUser?.email === t.email ? "bg-terminal-cyan/10" : "")}>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-sm w-8">
                        {t.rank <= 3 ? ["🥇", "🥈", "🥉"][t.rank - 1] : "#" + t.rank}
                      </span>
                      <span className="text-sm truncate max-w-[120px]">
                        {t.username}
                        {currentUser?.email === t.email && <span className="ml-1 text-terminal-cyan text-xs">(EU)</span>}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={t.pnl >= 0 ? "text-sm font-mono text-terminal-green" : "text-sm font-mono text-terminal-red"}>
                        {t.pnl >= 0 ? "+" : ""}${t.pnl?.toFixed(2)}
                      </div>
                      <div className="text-xs text-terminal-green/40">{t.winRate}% WR</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <footer className="border-t border-terminal-green/10 p-2 text-center text-xs text-terminal-green/30 bg-terminal-bg/80">
          Atualizado em tempo real
        </footer>
      </div>
    </main>
  )
}
