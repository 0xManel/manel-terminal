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

async function saveUsers(users: any) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
}

export async function POST(request: Request) {
  try {
    const { username, email, password, startingBalance, riskProfile } = await request.json()
    
    if (!username || !email || !password) {
      return NextResponse.json({ success: false, error: "Dados incompletos" }, { status: 400 })
    }

    const users = await getUsers()
    
    if (users[email]) {
      return NextResponse.json({ success: false, error: "Email ja registrado" }, { status: 400 })
    }

    const newUser = {
      username,
      email,
      password,
      startingBalance: startingBalance || 100,
      balance: startingBalance || 100,
      riskProfile: riskProfile || "medium",
      wins: 0,
      losses: 0,
      openPositions: 0,
      rank: Object.keys(users).length + 1,
      createdAt: new Date().toISOString(),
    }

    users[email] = newUser
    await saveUsers(users)

    const { password: _, ...safeUser } = newUser
    return NextResponse.json({ success: true, user: safeUser })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: "Erro no servidor" }, { status: 500 })
  }
}
