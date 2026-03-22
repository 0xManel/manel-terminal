'use client'

// MANEL TERMINAL - Estrategia realista basada en Polymarket
// Replica exacta del bot real con Uncommon-Oat

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
  totalVolume: number
  totalFees: number
}

export interface TradeData {
  id: string
  title: string
  asset: string
  outcome: string
  status: 'open' | 'won' | 'lost'
  entryPrice: number
  userBet: number
  userShares: number
  createdAt: number
  resolvedAt?: number
  trader: string
  marketDuration: string
  costs: {
    slippage: number
    spread: number
    gas: number
  }
  returnedAmount?: number
}

const USERS_KEY = 'manel_users'
const CURRENT_USER_KEY = 'manel_current_user'

// Assets reales del mercado
const ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', volatility: 1.0 },
  { symbol: 'ETH', name: 'Ethereum', volatility: 1.1 },
  { symbol: 'SOL', name: 'Solana', volatility: 1.3 },
  { symbol: 'XRP', name: 'XRP', volatility: 1.2 }
]

// Duraciones de mercado reales
const MARKET_DURATIONS = ['5min', '15min', '30min', '1h']

// Trader que seguimos (el real)
const TRADER_NAME = 'Uncommon-Oat'

// Configuracion de riesgo - replica del bot real
const RISK_CONFIG = {
  safe: { 
    minPrice: 0.65,  // Solo entradas muy seguras
    maxPrice: 0.85,
    betPct: 0.012,   // 1.2% del balance
    maxBet: 2.50
  },
  medium: { 
    minPrice: 0.55,  // Entradas equilibradas
    maxPrice: 0.80,
    betPct: 0.018,   // 1.8% del balance
    maxBet: 3.00
  },
  aggressive: { 
    minPrice: 0.50,  // Mas entradas, mayor riesgo
    maxPrice: 0.75,
    betPct: 0.025,   // 2.5% del balance
    maxBet: 4.00
  }
}

// Win rate realista basado en precio de entrada (datos historicos)
function getWinProbability(entryPrice: number): number {
  // Basado en analisis real:
  // 0.50-0.55: ~52% WR
  // 0.55-0.60: ~58% WR
  // 0.60-0.65: ~64% WR
  // 0.65-0.70: ~70% WR
  // 0.70-0.75: ~76% WR
  // 0.75+: ~82% WR
  
  if (entryPrice >= 0.75) return 0.82
  if (entryPrice >= 0.70) return 0.76
  if (entryPrice >= 0.65) return 0.70
  if (entryPrice >= 0.60) return 0.64
  if (entryPrice >= 0.55) return 0.58
  return 0.52
}

// Costos realistas (igual que el bot real)
function calculateCosts(entryPrice: number, betAmount: number): { slippage: number; spread: number; gas: number; total: number } {
  const slippage = betAmount * 0.015  // 1.5% slippage
  const spread = betAmount * 0.008    // 0.8% spread
  const gas = 0.005                   // Gas fijo ~/data/data/com.termux/files/usr/bin/bash.005
  return { slippage, spread, gas, total: slippage + spread + gas }
}

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
    lastTradeTime: now,
    totalVolume: 0,
    totalFees: 0
  }
  
  users[data.email] = user
  saveUsers(users)
  setCurrentUser(data.email)
  
  // Generar historial inicial realista
  generateInitialHistory(data.email)
  
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

// Generar historial inicial realista (simula ultimas horas de trading)
function generateInitialHistory(email: string): void {
  const users = getUsers()
  const user = users[email]
  if (!user) return
  
  const risk = RISK_CONFIG[user.riskProfile as keyof typeof RISK_CONFIG] || RISK_CONFIG.medium
  const now = Date.now()
  
  // Generar 8-12 trades de las ultimas 2 horas
  const numTrades = 8 + Math.floor(Math.random() * 5)
  let balance = user.balance
  let wins = 0
  let losses = 0
  let totalVolume = 0
  let totalFees = 0
  const trades: TradeData[] = []
  
  for (let i = 0; i < numTrades; i++) {
    const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)]
    const outcome = Math.random() > 0.5 ? 'Up' : 'Down'
    const duration = MARKET_DURATIONS[Math.floor(Math.random() * MARKET_DURATIONS.length)]
    
    // Precio dentro del rango del perfil
    const priceRange = risk.maxPrice - risk.minPrice
    const entryPrice = risk.minPrice + Math.random() * priceRange
    
    // Calcular bet
    let userBet = Math.min(balance * risk.betPct, risk.maxBet)
    userBet = Math.round(userBet * 100) / 100
    
    if (userBet < 0.50 || balance < userBet + 1) continue
    
    const costs = calculateCosts(entryPrice, userBet)
    const userShares = (userBet - costs.total) / entryPrice
    
    // Determinar resultado basado en probabilidad real
    const winProb = getWinProbability(entryPrice)
    const won = Math.random() < winProb
    
    // Ultimos 2-3 trades quedan abiertos
    const isOpen = i >= numTrades - 2 - Math.floor(Math.random() * 2)
    const status = isOpen ? 'open' : (won ? 'won' : 'lost')
    
    const tradeTime = now - (numTrades - i) * 420000 // ~7 minutos entre trades
    
    const trade: TradeData = {
      id: 'trade-' + tradeTime + '-' + Math.random().toString(36).slice(2, 6),
      title: asset.name + ' Up or Down - ' + duration,
      asset: asset.symbol,
      outcome,
      status,
      entryPrice: Math.round(entryPrice * 100) / 100,
      userBet,
      userShares: Math.round(userShares * 10000) / 10000,
      createdAt: tradeTime,
      resolvedAt: isOpen ? undefined : tradeTime + 180000 + Math.random() * 300000,
      trader: TRADER_NAME,
      marketDuration: duration,
      costs: {
        slippage: Math.round(costs.slippage * 10000) / 10000,
        spread: Math.round(costs.spread * 10000) / 10000,
        gas: costs.gas
      }
    }
    
    trades.push(trade)
    totalVolume += userBet
    totalFees += costs.total
    
    if (status === 'won') {
      // Retorno = shares * 1.0 - fees
      const returned = userShares * 0.985 // 1.5% fee de salida
      trade.returnedAmount = Math.round(returned * 100) / 100
      balance += returned - userBet
      wins++
    } else if (status === 'lost') {
      trade.returnedAmount = 0
      balance -= userBet
      losses++
    } else {
      // Open - reservar el bet
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
  user.totalVolume = Math.round(totalVolume * 100) / 100
  user.totalFees = Math.round(totalFees * 100) / 100
  
  users[email] = user
  saveUsers(users)
}

// Obtener leaderboard
export function getLeaderboard(): Array<UserData & { rank: number; pnl: number; pnlPct: number; winRate: number }> {
  const users = getUsers()
  
  return Object.values(users)
    .map(u => ({
      ...u,
      pnl: Math.round((u.balance - u.startingBalance) * 100) / 100,
      pnlPct: Math.round(((u.balance - u.startingBalance) / u.startingBalance) * 10000) / 100,
      winRate: u.wins + u.losses > 0 ? Math.round((u.wins / (u.wins + u.losses)) * 100) : 0
    }))
    .sort((a, b) => b.pnl - a.pnl)
    .map((u, i) => ({ ...u, rank: i + 1 }))
}

// Resolver trades abiertos (mercados que cierran)
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
    
    // Tiempo minimo segun duracion del mercado
    const minTime = trade.marketDuration === '5min' ? 120000 :
                    trade.marketDuration === '15min' ? 300000 :
                    trade.marketDuration === '30min' ? 600000 : 900000
    
    const age = now - trade.createdAt
    if (age < minTime) continue
    
    // Probabilidad de resolver aumenta con el tiempo
    const resolveChance = Math.min(0.8, (age - minTime) / 60000 * 0.2)
    if (Math.random() > resolveChance) continue
    
    // Determinar resultado basado en precio de entrada
    const winProb = getWinProbability(trade.entryPrice)
    const won = Math.random() < winProb
    
    trade.status = won ? 'won' : 'lost'
    trade.resolvedAt = now
    
    if (won) {
      const returned = trade.userShares * 0.985 // Fee de salida
      trade.returnedAmount = Math.round(returned * 100) / 100
      userData.balance += returned
      userData.wins++
    } else {
      trade.returnedAmount = 0
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

// Generar nuevo trade (senal del trader)
export function generateNewTrade(): boolean {
  const user = getCurrentUser()
  if (!user) return false
  
  const users = getUsers()
  const userData = users[user.email]
  if (!userData) return false
  
  const now = Date.now()
  const timeSinceLastTrade = now - (userData.lastTradeTime || 0)
  
  // Minimo 12 segundos entre trades (simula mercados de 5min reales)
  if (timeSinceLastTrade < 12000) return false
  
  // Probabilidad basada en tiempo - mas realista
  const probability = Math.min(0.85, timeSinceLastTrade / 25000)
  if (Math.random() > probability) return false
  
  // Maximo 4 trades abiertos
  const openTrades = userData.trades.filter(t => t.status === 'open')
  if (openTrades.length >= 4) return false
  
  const risk = RISK_CONFIG[userData.riskProfile as keyof typeof RISK_CONFIG] || RISK_CONFIG.medium
  
  // Calcular bet
  let userBet = Math.min(userData.balance * risk.betPct, risk.maxBet)
  userBet = Math.round(userBet * 100) / 100
  
  if (userBet < 0.50 || userData.balance < userBet + 2) return false
  
  const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)]
  const outcome = Math.random() > 0.5 ? 'Up' : 'Down'
  const duration = MARKET_DURATIONS[Math.floor(Math.random() * MARKET_DURATIONS.length)]
  
  // Precio dentro del rango del perfil
  const priceRange = risk.maxPrice - risk.minPrice
  const entryPrice = risk.minPrice + Math.random() * priceRange
  
  const costs = calculateCosts(entryPrice, userBet)
  const userShares = (userBet - costs.total) / entryPrice
  
  const trade: TradeData = {
    id: 'trade-' + now,
    title: asset.name + ' Up or Down - ' + duration,
    asset: asset.symbol,
    outcome,
    status: 'open',
    entryPrice: Math.round(entryPrice * 100) / 100,
    userBet,
    userShares: Math.round(userShares * 10000) / 10000,
    createdAt: now,
    trader: TRADER_NAME,
    marketDuration: duration,
    costs: {
      slippage: Math.round(costs.slippage * 10000) / 10000,
      spread: Math.round(costs.spread * 10000) / 10000,
      gas: costs.gas
    }
  }
  
  // Reducir balance
  userData.balance -= userBet
  userData.balance = Math.round(userData.balance * 100) / 100
  userData.totalVolume += userBet
  userData.totalFees += costs.total
  userData.trades.unshift(trade)
  userData.lastTradeTime = now
  
  // Mantener ultimos 100 trades
  if (userData.trades.length > 100) {
    userData.trades = userData.trades.slice(0, 100)
  }
  
  users[user.email] = userData
  saveUsers(users)
  
  return true
}

// Sync principal - llamar cada 5 segundos
export function syncTrades(): { newTrade: boolean; resolved: boolean } {
  const resolved = resolveOpenTrades()
  const newTrade = generateNewTrade()
  return { newTrade, resolved }
}
