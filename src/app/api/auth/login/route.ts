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

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Dados incompletos" }, { status: 400 })
    }

    const users = await getUsers()
    const user = users[email]

    if (!user || user.password !== password) {
      return NextResponse.json({ success: false, error: "Email ou senha incorretos" }, { status: 401 })
    }

    const { password: _, ...safeUser } = user
    return NextResponse.json({ success: true, user: safeUser })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: "Erro no servidor" }, { status: 500 })
  }
}
