'use client'

// Cliente-side storage con trades automaticos frecuentes

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
  lastTradeTime: number
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
  resolvedAt?: number
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
  
  const now = Date.now()
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
    createdAt: now,
    lastTradeTime: now
  }
  
  users[data.email] = user
  saveUsers(users)
  setCurrentUser(data.email)
  
  // Generar trades iniciales inmediatamente
  generateInitialTrades(data.email)
  
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
  safe: { minPrice: 0.70, betPct: 0.015, winBonus: 0.05 },
  medium: { minPrice: 0.60, betPct: 0.02, winBonus: 0 },
  aggressive: { minPrice: 0.55, betPct: 0.025, winBonus: -0.03 }
}

type TradeStatus = 'open' | 'won' | 'lost'

// Generar trades iniciales para nuevos usuarios (5-8 trades)
function generateInitialTrades(email: string): void {
  const users = getUsers()
  const user = users[email]
  if (!user) return
  
  const risk = RISK_CONFIG[user.riskProfile as keyof typeof RISK_CONFIG] || RISK_CONFIG.medium
  const now = Date.now()
  
  const assets = ['BTC', 'ETH', 'SOL', 'XRP']
  const numTrades = 5 + Math.floor(Math.random() * 4) // 5-8 trades
  
  let balance = user.balance
  let wins = 0
  let losses = 0
  const trades: TradeData[] = []
  
  for (let i = 0; i < numTrades; i++) {
    const asset = assets[Math.floor(Math.random() * assets.length)]
    const outcome = Math.random() > 0.5 ? 'UP' : 'DOWN'
    const price = risk.minPrice + Math.random() * 0.15 // precio dentro del rango del perfil
    
    const userBet = Math.min(balance * risk.betPct, 2.00)
    if (userBet < 0.50 || balance < userBet) continue
    
    // Determinar resultado basado en precio y perfil
    const baseWinChance = price * 0.85 + 0.10 + risk.winBonus
    const won = Math.random() < baseWinChance
    
    // Ultimos 2 trades quedan abiertos
    const isOpen = i >= numTrades - 2
    const status: TradeStatus = isOpen ? 'open' : (won ? 'won' : 'lost')
    
    const tradeTime = now - (numTrades - i) * 180000 // cada 3 minutos
    
    const trade: TradeData = {
      id: 'trade-' + tradeTime + '-' + Math.random().toString(36).slice(2, 6),
      title: asset + ' up or down',
      outcome,
      status,
      entryPrice: Math.round(price * 100) / 100,
      userBet: Math.round(userBet * 100) / 100,
      userShares: Math.round((userBet / price) * 10000) / 10000,
      createdAt: tradeTime,
      resolvedAt: isOpen ? undefined : tradeTime + 60000
    }
    
    trades.push(trade)
    
    if (status === 'won') {
      const profit = (trade.userShares - userBet) * 0.985
      balance += profit
      wins++
    } else if (status === 'lost') {
      balance -= userBet
      losses++
    } else {
      // open - reservar el bet
      balance -= userBet
    }
  }
  
  // Ordenar por fecha (mas recientes primero)
  trades.sort((a, b) => b.createdAt - a.createdAt)
  
  user.trades = trades
  user.balance = Math.round(balance * 100) / 100
  user.wins = wins
  user.losses = losses
  user.lastTradeTime = now
  
  users[email] = user
  saveUsers(users)
}

// Obtener leaderboard
export function getLeaderboard(): Array<UserData & { rank: number; pnl: number; winRate: number }> {
  const users = getUsers()
  
  return Object.values(users)
    .map(u => ({
      ...u,
      pnl: Math.round((u.balance - u.startingBalance) * 100) / 100,
      winRate: u.wins + u.losses > 0 ? Math.round((u.wins / (u.wins + u.losses)) * 100) : 0
    }))
    .sort((a, b) => b.pnl - a.pnl)
    .map((u, i) => ({ ...u, rank: i + 1 }))
}

// Resolver trades abiertos (llamar periodicamente)
export function resolveOpenTrades(): boolean {
  const user = getCurrentUser()
  if (!user) return false
  
  const users = getUsers()
  const userData = users[user.email]
  if (!userData) return false
  
  const now = Date.now()
  let changed = false
  
  for (const trade of userData.trades) {
    if (trade.status !== 'open') continue
    
    // Resolver trades que tienen mas de 2 minutos
    const age = now - trade.createdAt
    if (age < 120000) continue // minimo 2 minutos
    
    // 70% chance de resolver cada check
    if (Math.random() > 0.7) continue
    
    const risk = RISK_CONFIG[userData.riskProfile as keyof typeof RISK_CONFIG] || RISK_CONFIG.medium
    const baseWinChance = trade.entryPrice * 0.85 + 0.10 + risk.winBonus
    const won = Math.random() < baseWinChance
    
    trade.status = won ? 'won' : 'lost'
    trade.resolvedAt = now
    
    if (won) {
      const profit = trade.userShares * 0.985
      userData.balance += profit
      userData.wins++
    } else {
      userData.losses++
    }
    
    userData.balance = Math.round(userData.balance * 100) / 100
    changed = true
  }
  
  if (changed) {
    users[user.email] = userData
    saveUsers(users)
  }
  
  return changed
}

// Generar nuevo trade (llamar cada 10-15 segundos)
export function generateNewTrade(): boolean {
  const user = getCurrentUser()
  if (!user) return false
  
  const users = getUsers()
  const userData = users[user.email]
  if (!userData) return false
  
  const now = Date.now()
  const timeSinceLastTrade = now - (userData.lastTradeTime || 0)
  
  // Minimo 8 segundos entre trades
  if (timeSinceLastTrade < 8000) return false
  
  // Probabilidad basada en tiempo - mas tiempo = mas probable
  const probability = Math.min(0.9, timeSinceLastTrade / 30000)
  if (Math.random() > probability) return false
  
  // Maximo 3 trades abiertos
  const openTrades = userData.trades.filter(t => t.status === 'open')
  if (openTrades.length >= 3) return false
  
  const risk = RISK_CONFIG[userData.riskProfile as keyof typeof RISK_CONFIG] || RISK_CONFIG.medium
  
  // Verificar balance suficiente
  const userBet = Math.min(userData.balance * risk.betPct, 2.00)
  if (userBet < 0.50 || userData.balance < userBet + 1) return false
  
  const assets = ['BTC', 'ETH', 'SOL', 'XRP']
  const asset = assets[Math.floor(Math.random() * assets.length)]
  const outcome = Math.random() > 0.5 ? 'UP' : 'DOWN'
  const price = risk.minPrice + Math.random() * 0.15
  
  const trade: TradeData = {
    id: 'trade-' + now,
    title: asset + ' up or down',
    outcome,
    status: 'open',
    entryPrice: Math.round(price * 100) / 100,
    userBet: Math.round(userBet * 100) / 100,
    userShares: Math.round((userBet / price) * 10000) / 10000,
    createdAt: now
  }
  
  // Reducir balance por el bet
  userData.balance -= userBet
  userData.balance = Math.round(userData.balance * 100) / 100
  userData.trades.unshift(trade)
  userData.lastTradeTime = now
  
  // Mantener solo los ultimos 50 trades
  if (userData.trades.length > 50) {
    userData.trades = userData.trades.slice(0, 50)
  }
  
  users[user.email] = userData
  saveUsers(users)
  
  return true
}

// Funcion principal de sync - llamar cada 5 segundos
export function syncTrades(): { newTrade: boolean; resolved: boolean } {
  const resolved = resolveOpenTrades()
  const newTrade = generateNewTrade()
  return { newTrade, resolved }
}
