// app/api/admin/config/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
// ou ajuste o caminho conforme sua estrutura

export async function GET() {
  const config = await prisma.adminConfig.findUnique({
    where: { id: 'admin' },
  })

  return NextResponse.json({ exists: !!config })
}
