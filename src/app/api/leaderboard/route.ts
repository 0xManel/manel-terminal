import { NextResponse } from 'next/server'

export async function GET() {
  // Leaderboard is now handled client-side
  return NextResponse.json({ 
    success: true, 
    leaderboard: [],
    message: 'Use client-side leaderboard'
  })
}
