import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET() {
  try {
    const pinEntry = await prisma.adminConfig.findFirst()
    return NextResponse.json({ exists: !!pinEntry })
  } catch {
    return NextResponse.json({ exists: false })
  }
}
export async function POST() {
  try {
    const pinEntry = await prisma.adminConfig.findFirst()
    return NextResponse.json({ exists: !!pinEntry })
  } catch {
    return NextResponse.json({ exists: false })
  }
}