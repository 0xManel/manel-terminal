import { NextResponse } from 'next/server'

// This endpoint is now handled client-side
// Keeping for backwards compatibility

export async function POST() {
  return NextResponse.json({ 
    error: 'Use client-side registration',
    redirect: '/register' 
  }, { status: 400 })
}
