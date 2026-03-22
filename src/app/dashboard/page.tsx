'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import MatrixBackground from '@/components/MatrixBackground'
import { 
  getCurrentUser, 
  getLeaderboard, 
  syncTrades,
  UserData 
} from '@/lib/client-storage'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [rank, setRank] = useState(0)
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState<string>('')
  const [notification, setNotification] = useState<string | null>(null)

  const loadUser = useCallback(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser({...currentUser})
    
    const leaderboard = getLeaderboard()
    const userRank = leaderboard.find(u => u.email === currentUser.email)
    setRank(userRank?.rank || 0)
    setLoading(false)
    setLastSync(new Date().toLocaleTimeString())
  }, [router])

  useEffect(() => {
    loadUser()
    
    // Sync cada 5 segundos para trades mas frecuentes
    const interval = setInterval(() => {
      const result = syncTrades()
      loadUser()
      
      if (result.newTrade) {
        setNotification('Novo trade aberto!')
        setTimeout(() => setNotification(null), 3000)
      } else if (result.resolved) {
        setNotification('Trade resolvido!')
        setTimeout(() => setNotification(null), 3000)
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [loadUser])

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
  const recentTrades = user.trades.slice(0, 15)

  return (
    <div className="min-h-screen bg-black text-green-500 p-4">
      <MatrixBackground />
      
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-900 border border-green-500 text-green-400 px-4 py-2 rounded animate-pulse">
          {notification}
        </div>
      )}
      
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
            <p className="text-green-600 text-xs">ABERTAS</p>
            <p className="text-2xl font-bold text-yellow-400">{openTrades.length}</p>
            <p className="text-xs text-green-600 animate-pulse">Ao vivo</p>
          </div>
        </div>

        {/* Open Positions */}
        {openTrades.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-yellow-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              POSICOES ABERTAS
            </h2>
            <div className="space-y-2">
              {openTrades.map(trade => (
                <div key={trade.id} className="bg-black/50 border border-yellow-600 p-3 rounded flex justify-between items-center animate-pulse">
                  <div>
                    <p className="font-bold text-yellow-400">{trade.title}</p>
                    <p className="text-sm text-green-600">{trade.outcome} @ {trade.entryPrice.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold">AGUARDANDO</p>
                    <p className="text-sm">${trade.userBet.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Trades */}
        <div>
          <h2 className="text-lg font-bold mb-3 text-green-400">HISTORICO DE TRADES</h2>
          <div className="space-y-2">
            {recentTrades.map(trade => (
              <div 
                key={trade.id} 
                className={`bg-black/50 border p-3 rounded flex justify-between items-center transition-all ${
                  trade.status === 'won' ? 'border-green-700' : 
                  trade.status === 'lost' ? 'border-red-700' : 'border-yellow-600'
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
                    {trade.status === 'won' ? 'GANHOU' : trade.status === 'lost' ? 'PERDEU' : 'ABERTO'}
                  </p>
                  <p className="text-sm">
                    {trade.status === 'won' ? '+' : '-'}${trade.userBet.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-green-800 flex justify-between text-sm text-green-600">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Sync: {lastSync}
          </span>
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
