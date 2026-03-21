import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    error: 'Use client-side user data',
  }, { status: 400 })
}
