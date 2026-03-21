"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import MatrixBackground from "@/components/MatrixBackground"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)

  const fetchUser = async (email: string) => {
    try {
      const res = await fetch("/api/user?email=" + encodeURIComponent(email))
      const data = await res.json()
      if (data.success) {
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const syncTrades = async () => {
    setSyncing(true)
    try {
      await fetch("/api/trades/sync")
      const stored = localStorage.getItem("user")
      if (stored) {
        const u = JSON.parse(stored)
        await fetchUser(u.email)
      }
      setLastSync(new Date().toLocaleTimeString())
    } catch (e) {
      console.error(e)
    }
    setSyncing(false)
  }

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) {
      router.push("/login")
      return
    }
    const u = JSON.parse(stored)
    setUser(u)
    syncTrades()
    const interval = setInterval(syncTrades, 30000)
    return () => clearInterval(interval)
  }, [router])

  if (!user) return null

  const balance = user.balance || user.startingBalance || 100
  const startingBalance = user.startingBalance || 100
  const pnl = balance - startingBalance
  const pnlPct = (pnl / startingBalance) * 100
  const wins = user.wins || 0
  const losses = user.losses || 0
  const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <main className="min-h-screen flex flex-col relative">
      <MatrixBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="border-b border-terminal-green/20 p-3 bg-terminal-bg/80 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-lg mx-auto">
            <Link href="/" className="font-display text-lg font-black glow">MANEL_TERMINAL</Link>
            <div className="flex items-center gap-3 text-sm">
              <Link href="/leaderboard" className="text-terminal-cyan hover:underline text-xs">RANKING</Link>
              <button onClick={handleLogout} className="text-terminal-green/50 hover:text-terminal-red text-xs">SAIR</button>
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full">
          <div className="text-center py-2">
            <div className="text-terminal-cyan font-display">{user.username}</div>
            <div className="text-xs text-terminal-green/40">Perfil: {user.riskProfile?.toUpperCase()}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-terminal-bg/80 border border-terminal-green/20 rounded text-center pulse-border">
              <div className="text-xs text-terminal-green/50">PORTFOLIO</div>
              <div className="font-display text-2xl">${balance.toFixed(2)}</div>
              <div className={pnl >= 0 ? "text-sm text-terminal-green" : "text-sm text-terminal-red"}>
                {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)} ({pnlPct.toFixed(1)}%)
              </div>
            </div>
            <div className="p-4 bg-terminal-bg/80 border border-terminal-green/20 rounded text-center">
              <div className="text-xs text-terminal-green/50">WIN RATE</div>
              <div className="font-display text-2xl">{winRate.toFixed(0)}%</div>
              <div className="text-sm text-terminal-green/50">{wins}V / {losses}D</div>
            </div>
          </div>
          <div className="p-4 bg-terminal-bg/80 border border-terminal-green/20 rounded">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-terminal-green/50">SISTEMA</span>
              <span className="flex items-center gap-2 text-xs">
                <span className={syncing ? "w-2 h-2 rounded-full bg-terminal-yellow animate-pulse" : "w-2 h-2 rounded-full bg-terminal-green animate-pulse"}></span>
                {syncing ? "SYNC..." : "ATIVO"}
              </span>
            </div>
            <div className="text-center py-4 text-terminal-green/60 text-sm">
              Polymarket Copy Trading
              {lastSync && <div className="text-xs text-terminal-green/30 mt-1">Sync: {lastSync}</div>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-terminal-bg/60 border border-terminal-green/10 rounded">
              <div className="text-terminal-green/50">ABERTOS</div>
              <div className="font-display text-lg text-terminal-cyan">{user.openPositions || 0}</div>
            </div>
            <div className="p-3 bg-terminal-bg/60 border border-terminal-green/10 rounded">
              <div className="text-terminal-green/50">RANK</div>
              <div className="font-display text-lg text-terminal-yellow">#{user.rank || "-"}</div>
            </div>
            <div className="p-3 bg-terminal-bg/60 border border-terminal-green/10 rounded">
              <div className="text-terminal-green/50">TRADES</div>
              <div className="font-display text-lg">{wins + losses}</div>
            </div>
          </div>
        </div>
        <footer className="border-t border-terminal-green/10 p-2 text-center text-xs text-terminal-green/30 bg-terminal-bg/80">
          Auto-sync 30s
        </footer>
      </div>
    </main>
  )
}
