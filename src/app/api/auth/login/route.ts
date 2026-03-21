import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ 
    error: 'Use client-side login',
    redirect: '/login' 
  }, { status: 400 })
}
