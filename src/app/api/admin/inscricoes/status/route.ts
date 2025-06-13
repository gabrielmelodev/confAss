// /app/api/status-inscricoes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';


const LIMITE_PADRAO = 230;

export async function GET() {
  try {
    const config = await prisma.adminConfig.findUnique({ where: { id: 'config-geral' } });
    const limite = config?.limiteInscricoes ?? LIMITE_PADRAO;

    const totalInscritos = await prisma.inscricao.count({
      where: { aListaEspera: false },
    });

    const totalFila = await prisma.inscricao.count({
      where: { aListaEspera: true },
    });

    return NextResponse.json({
      totalInscritos,
      totalFila,
      limiteVagas: limite,
      vagasDisponiveis: Math.max(limite - totalInscritos, 0),
    });
  } catch (e) {
    console.error('Erro ao buscar status:', e);
    return NextResponse.json({ error: 'Erro ao buscar status' }, { status: 500 });
  }
}
