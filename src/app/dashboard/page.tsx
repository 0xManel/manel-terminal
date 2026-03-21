'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MatrixBackground from '@/components/MatrixBackground'
import { 
  getCurrentUser, 
  getLeaderboard, 
  simulateNewTrade,
  UserData 
} from '@/lib/client-storage'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [rank, setRank] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = () => {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
      
      const leaderboard = getLeaderboard()
      const userRank = leaderboard.find(u => u.email === currentUser.email)
      setRank(userRank?.rank || 0)
      setLoading(false)
    }
    
    loadUser()
    
    // Sync cada 30 segundos
    const interval = setInterval(() => {
      simulateNewTrade()
      loadUser()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <MatrixBackground />
        <div className="text-green-500 text-xl animate-pulse">Carregando...</div>
      </div>
    )
  }

  if (!user) return null

  const pnl = user.balance - user.startingBalance
  const pnlPct = (pnl / user.startingBalance) * 100
  const winRate = user.wins + user.losses > 0 
    ? Math.round((user.wins / (user.wins + user.losses)) * 100) 
    : 0

  const openTrades = user.trades.filter(t => t.status === 'open')

  return (
    <div className="min-h-screen bg-black text-green-500 p-4">
      <MatrixBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-green-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">MANEL TERMINAL</h1>
            <p className="text-green-400 text-sm">@{user.username}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-600">Perfil: {user.riskProfile.toUpperCase()}</p>
            <button 
              onClick={() => router.push('/leaderboard')}
              className="text-sm text-cyan-400 hover:text-cyan-300"
            >
              Ranking #{rank}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/50 border border-green-800 p-4 rounded">
            <p className="text-green-600 text-xs">BALANCE</p>
            <p className="text-2xl font-bold">${user.balance.toFixed(2)}</p>
          </div>
          <div className="bg-black/50 border border-green-800 p-4 rounded">
            <p className="text-green-600 text-xs">P&L</p>
            <p className={`text-2xl font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%)
            </p>
          </div>
          <div className="bg-black/50 border border-green-800 p-4 rounded">
            <p className="text-green-600 text-xs">WIN RATE</p>
            <p className="text-2xl font-bold">{winRate}%</p>
            <p className="text-xs text-green-600">{user.wins}W / {user.losses}L</p>
          </div>
          <div className="bg-black/50 border border-green-800 p-4 rounded">
            <p className="text-green-600 text-xs">POSICOES ABERTAS</p>
            <p className="text-2xl font-bold">{openTrades.length}</p>
          </div>
        </div>

        {/* Open Positions */}
        {openTrades.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-green-400">POSICOES ABERTAS</h2>
            <div className="space-y-2">
              {openTrades.map(trade => (
                <div key={trade.id} className="bg-black/50 border border-yellow-800 p-3 rounded flex justify-between items-center">
                  <div>
                    <p className="font-bold">{trade.title}</p>
                    <p className="text-sm text-green-600">{trade.outcome} @ {trade.entryPrice.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400">OPEN</p>
                    <p className="text-sm">${trade.userBet.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Trades */}
        <div>
          <h2 className="text-lg font-bold mb-3 text-green-400">TRADES RECENTES</h2>
          <div className="space-y-2">
            {user.trades.slice(0, 10).map(trade => (
              <div 
                key={trade.id} 
                className={`bg-black/50 border p-3 rounded flex justify-between items-center ${
                  trade.status === 'won' ? 'border-green-800' : 
                  trade.status === 'lost' ? 'border-red-800' : 'border-yellow-800'
                }`}
              >
                <div>
                  <p className="font-bold">{trade.title}</p>
                  <p className="text-sm text-green-600">{trade.outcome} @ {trade.entryPrice.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    trade.status === 'won' ? 'text-green-400' : 
                    trade.status === 'lost' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {trade.status.toUpperCase()}
                  </p>
                  <p className="text-sm">
                    {trade.status === 'won' ? '+' : trade.status === 'lost' ? '-' : ''}${trade.userBet.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-green-800 flex justify-between text-sm text-green-600">
          <span>Sync: Auto (30s)</span>
          <button 
            onClick={() => { localStorage.removeItem('manel_current_user'); router.push('/') }}
            className="text-red-400 hover:text-red-300"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}
