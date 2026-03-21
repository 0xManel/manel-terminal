'use client'

// Cliente-side storage usando localStorage

export interface UserData {
  email: string
  username: string
  password: string
  balance: number
  startingBalance: number
  riskProfile: string
  wins: number
  losses: number
  trades: TradeData[]
  createdAt: number
}

export interface TradeData {
  id: string
  title: string
  outcome: string
  status: 'open' | 'won' | 'lost'
  entryPrice: number
  userBet: number
  userShares: number
  createdAt: number
}

const USERS_KEY = 'manel_users'
const CURRENT_USER_KEY = 'manel_current_user'

export function getUsers(): Record<string, UserData> {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem(USERS_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function saveUsers(users: Record<string, UserData>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getCurrentUser(): UserData | null {
  if (typeof window === 'undefined') return null
  const email = localStorage.getItem(CURRENT_USER_KEY)
  if (!email) return null
  const users = getUsers()
  return users[email] || null
}

export function setCurrentUser(email: string | null): void {
  if (typeof window === 'undefined') return
  if (email) {
    localStorage.setItem(CURRENT_USER_KEY, email)
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}

export function registerUser(data: {
  email: string
  username: string
  password: string
  startingBalance: number
  riskProfile: string
}): { success: boolean; error?: string } {
  const users = getUsers()
  
  if (users[data.email]) {
    return { success: false, error: 'Email ja cadastrado' }
  }
  
  const user: UserData = {
    email: data.email,
    username: data.username,
    password: data.password,
    balance: data.startingBalance,
    startingBalance: data.startingBalance,
    riskProfile: data.riskProfile,
    wins: 0,
    losses: 0,
    trades: [],
    createdAt: Date.now()
  }
  
  users[data.email] = user
  saveUsers(users)
  setCurrentUser(data.email)
  
  // Iniciar con algunos trades demo
  simulateInitialTrades(data.email)
  
  return { success: true }
}

export function loginUser(email: string, password: string): { success: boolean; error?: string } {
  const users = getUsers()
  const user = users[email]
  
  if (!user || user.password !== password) {
    return { success: false, error: 'Credenciais invalidas' }
  }
  
  setCurrentUser(email)
  return { success: true }
}

export function logoutUser(): void {
  setCurrentUser(null)
}

// Configuracion de riesgo
const RISK_CONFIG = {
  safe: { minPrice: 0.70, betPct: 0.01 },
  medium: { minPrice: 0.60, betPct: 0.015 },
  aggressive: { minPrice: 0.55, betPct: 0.02 }
}

type TradeStatus = 'open' | 'won' | 'lost'

interface DemoTrade {
  title: string
  outcome: string
  status: TradeStatus
  price: number
}

// Simular trades iniciales para nuevos usuarios
function simulateInitialTrades(email: string): void {
  const users = getUsers()
  const user = users[email]
  if (!user) return
  
  const risk = RISK_CONFIG[user.riskProfile as keyof typeof RISK_CONFIG] || RISK_CONFIG.medium
  const now = Date.now()
  
  // Crear algunos trades de demo
  const demoTrades: DemoTrade[] = [
    { title: 'BTC up or down', outcome: 'UP', status: 'won', price: 0.68 },
    { title: 'ETH up or down', outcome: 'DOWN', status: 'won', price: 0.72 },
    { title: 'SOL up or down', outcome: 'UP', status: 'open', price: 0.65 },
  ]
  
  let balance = user.balance
  let wins = 0
  let losses = 0
  const trades: TradeData[] = []
  
  for (const demo of demoTrades) {
    if (demo.price < risk.minPrice) continue
    
    const userBet = Math.min(balance * risk.betPct, 2.00)
    if (userBet < 0.50) continue
    
    const trade: TradeData = {
      id: 'trade-' + Date.now() + '-' + Math.random().toString(36).slice(2),
      title: demo.title,
      outcome: demo.outcome,
      status: demo.status,
      entryPrice: demo.price,
      userBet,
      userShares: userBet / demo.price,
      createdAt: now - Math.random() * 7200000
    }
    
    trades.push(trade)
    
    if (demo.status === 'won') {
      balance += (trade.userShares - userBet) * 0.985
      wins++
    } else if (demo.status === 'lost') {
      balance -= userBet
      losses++
    } else {
      balance -= userBet
    }
  }
  
  user.trades = trades
  user.balance = balance
  user.wins = wins
  user.losses = losses
  
  users[email] = user
  saveUsers(users)
}

// Obtener leaderboard
export function getLeaderboard(): Array<UserData & { rank: number; pnl: number; winRate: number }> {
  const users = getUsers()
  
  return Object.values(users)
    .map(u => ({
      ...u,
      pnl: u.balance - u.startingBalance,
      winRate: u.wins + u.losses > 0 ? Math.round((u.wins / (u.wins + u.losses)) * 100) : 0
    }))
    .sort((a, b) => b.pnl - a.pnl)
    .map((u, i) => ({ ...u, rank: i + 1 }))
}

// Simular nuevo trade (se ejecuta cada 30 segundos)
export function simulateNewTrade(): void {
  const user = getCurrentUser()
  if (!user) return
  
  const users = getUsers()
  const userData = users[user.email]
  if (!userData) return
  
  const risk = RISK_CONFIG[userData.riskProfile as keyof typeof RISK_CONFIG] || RISK_CONFIG.medium
  
  // 30% de chance de nuevo trade
  if (Math.random() > 0.3) return
  
  const assets = ['BTC', 'ETH', 'SOL', 'XRP']
  const asset = assets[Math.floor(Math.random() * assets.length)]
  const outcome = Math.random() > 0.5 ? 'UP' : 'DOWN'
  const price = 0.55 + Math.random() * 0.25 // 0.55-0.80
  
  if (price < risk.minPrice) return
  
  const userBet = Math.min(userData.balance * risk.betPct, 2.00)
  if (userBet < 0.50 || userData.balance < userBet) return
  
  // Determinar resultado (basado en precio - mayor precio = mayor probabilidad de ganar)
  const winChance = price * 0.9 + 0.1 // 55-82% segun precio
  const won = Math.random() < winChance
  const status: TradeStatus = won ? 'won' : 'lost'
  
  const trade: TradeData = {
    id: 'trade-' + Date.now(),
    title: asset + ' up or down',
    outcome,
    status,
    entryPrice: price,
    userBet,
    userShares: userBet / price,
    createdAt: Date.now()
  }
  
  userData.trades.unshift(trade)
  
  if (won) {
    userData.balance += (trade.userShares - userBet) * 0.985
    userData.wins++
  } else {
    userData.balance -= userBet
    userData.losses++
  }
  
  users[user.email] = userData
  saveUsers(users)
}
