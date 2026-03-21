'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MatrixBackground from '@/components/MatrixBackground'
import { getLeaderboard, getCurrentUser, UserData } from '@/lib/client-storage'

interface LeaderboardEntry extends UserData {
  rank: number
  pnl: number
  winRate: number
}

export default function Leaderboard() {
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      const data = getLeaderboard()
      setLeaderboard(data)
      
      const user = getCurrentUser()
      setCurrentUserEmail(user?.email || null)
      
      setLoading(false)
    }
    
    loadData()
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <MatrixBackground />
        <div className="text-green-500 text-xl animate-pulse">Carregando ranking...</div>
      </div>
    )
  }

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <div className="min-h-screen bg-black text-green-500 p-4">
      <MatrixBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-green-800 pb-4">
          <h1 className="text-2xl font-bold">RANKING</h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-green-600 hover:text-green-400"
          >
            Voltar ao Dashboard
          </button>
        </div>

        {/* Podium */}
        {top3.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="mt-8">
              {top3[1] && (
                <div className={`bg-black/50 border p-4 rounded text-center ${
                  top3[1].email === currentUserEmail ? 'border-cyan-400' : 'border-gray-600'
                }`}>
                  <div className="text-4xl mb-2">🥈</div>
                  <p className="font-bold">{top3[1].username}</p>
                  <p className={`text-lg ${top3[1].pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {top3[1].pnl >= 0 ? '+' : ''}${top3[1].pnl.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600">{top3[1].winRate}% WR</p>
                </div>
              )}
            </div>
            
            {/* 1st Place */}
            <div>
              {top3[0] && (
                <div className={`bg-black/50 border p-4 rounded text-center ${
                  top3[0].email === currentUserEmail ? 'border-cyan-400' : 'border-yellow-500'
                }`}>
                  <div className="text-5xl mb-2">🏆</div>
                  <p className="font-bold text-lg">{top3[0].username}</p>
                  <p className={`text-xl ${top3[0].pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {top3[0].pnl >= 0 ? '+' : ''}${top3[0].pnl.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600">{top3[0].winRate}% WR</p>
                </div>
              )}
            </div>
            
            {/* 3rd Place */}
            <div className="mt-12">
              {top3[2] && (
                <div className={`bg-black/50 border p-4 rounded text-center ${
                  top3[2].email === currentUserEmail ? 'border-cyan-400' : 'border-orange-700'
                }`}>
                  <div className="text-4xl mb-2">🥉</div>
                  <p className="font-bold">{top3[2].username}</p>
                  <p className={`text-lg ${top3[2].pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {top3[2].pnl >= 0 ? '+' : ''}${top3[2].pnl.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600">{top3[2].winRate}% WR</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rest of leaderboard */}
        {rest.length > 0 && (
          <div className="space-y-2">
            {rest.map(user => (
              <div 
                key={user.email}
                className={`bg-black/50 border p-3 rounded flex justify-between items-center ${
                  user.email === currentUserEmail ? 'border-cyan-400' : 'border-green-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-green-600 font-mono w-8">#{user.rank}</span>
                  <div>
                    <p className="font-bold">{user.username}</p>
                    <p className="text-sm text-green-600">{user.riskProfile.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${user.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {user.pnl >= 0 ? '+' : ''}${user.pnl.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600">
                    {user.winRate}% WR | {user.wins}W/{user.losses}L
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {leaderboard.length === 0 && (
          <div className="text-center py-12 text-green-600">
            <p className="text-xl mb-4">Nenhum trader ainda!</p>
            <button 
              onClick={() => router.push('/register')}
              className="bg-green-800 hover:bg-green-700 text-black px-6 py-2 rounded"
            >
              Seja o primeiro!
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
