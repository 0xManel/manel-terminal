import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const USERS_FILE = path.join(process.cwd(), "data", "users.json")

async function getUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return {}
  }
}

export async function GET() {
  try {
    const users = await getUsers()
    
    const leaderboard = Object.values(users).map((u: any) => ({
      username: u.username,
      email: u.email,
      balance: u.balance || u.startingBalance || 100,
      startingBalance: u.startingBalance || 100,
      pnl: (u.balance || u.startingBalance || 100) - (u.startingBalance || 100),
      wins: u.wins || 0,
      losses: u.losses || 0,
      winRate: u.wins + u.losses > 0 ? Math.round((u.wins / (u.wins + u.losses)) * 100) : 0,
      trades: (u.wins || 0) + (u.losses || 0),
      riskProfile: u.riskProfile || "medium",
      rank: 0,
    }))
    
    // Sort by P&L descending
    leaderboard.sort((a, b) => b.pnl - a.pnl)
    
    // Add ranks
    leaderboard.forEach((u, i) => {
      u.rank = i + 1
    })
    
    return NextResponse.json({ success: true, leaderboard })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
