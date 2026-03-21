import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const POLYMARKET_STATE = "/home/xmanel/.openclaw/workspace/polymarket_state.json"
const USERS_FILE = path.join(process.cwd(), "data", "users.json")

async function getPolymarketState() {
  try {
    const data = await fs.readFile(POLYMARKET_STATE, "utf-8")
    return JSON.parse(data)
  } catch {
    return null
  }
}

async function getUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return {}
  }
}

async function saveUsers(users: any) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
}

const RISK_CONFIG: Record<string, { minPrice: number; betPct: number }> = {
  safe: { minPrice: 0.70, betPct: 0.01 },
  medium: { minPrice: 0.60, betPct: 0.015 },
  aggressive: { minPrice: 0.55, betPct: 0.02 },
}

export async function GET() {
  try {
    const polyState = await getPolymarketState()
    if (!polyState) {
      return NextResponse.json({ error: "Polymarket not found" }, { status: 500 })
    }

    const users = await getUsers()
    const positions = polyState.positions || {}
    
    for (const email in users) {
      const user = users[email]
      const risk = RISK_CONFIG[user.riskProfile] || RISK_CONFIG.medium
      
      if (!user.processedTrades) user.processedTrades = []
      if (!user.userPositions) user.userPositions = {}
      
      for (const posId in positions) {
        const pos = positions[posId]
        if (user.processedTrades.includes(posId)) continue
        
        const entryPrice = pos.price || pos.entry_price || 0
        if (entryPrice < risk.minPrice) continue
        
        const userBet = Math.min(user.balance * risk.betPct, 2.00)
        if (userBet < 0.50 || user.balance < userBet) continue
        
        const userPos = {
          title: pos.title,
          outcome: pos.outcome,
          status: pos.status,
          entryPrice,
          userBet,
          userShares: userBet / entryPrice,
          openedAt: pos.opened_at,
        }
        
        user.userPositions[posId] = userPos
        user.processedTrades.push(posId)
        
        if (pos.status === "won") {
          const ret = userPos.userShares - userBet
          user.balance += ret * 0.985
          user.wins = (user.wins || 0) + 1
        } else if (pos.status === "lost") {
          user.balance -= userBet
          user.losses = (user.losses || 0) + 1
        } else {
          user.balance -= userBet
          user.openPositions = (user.openPositions || 0) + 1
        }
      }
      
      for (const posId in user.userPositions) {
        const uPos = user.userPositions[posId]
        const livePos = positions[posId]
        if (!livePos || uPos.status === livePos.status) continue
        
        if (livePos.status === "won" && uPos.status === "open") {
          user.balance += uPos.userShares * 0.985
          user.wins = (user.wins || 0) + 1
          user.openPositions = Math.max(0, (user.openPositions || 0) - 1)
          user.userPositions[posId].status = "won"
        } else if (livePos.status === "lost" && uPos.status === "open") {
          user.losses = (user.losses || 0) + 1
          user.openPositions = Math.max(0, (user.openPositions || 0) - 1)
          user.userPositions[posId].status = "lost"
        }
      }
      
      users[email] = user
    }
    
    await saveUsers(users)
    return NextResponse.json({ success: true, synced: Object.keys(users).length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
