// Rota: GET /api/admin/inscricoes/fila
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';



export async function GET() {
  try {
    const fila = await prisma.inscricao.findMany({
      where: { aListaEspera: true },
      orderBy: { criadoEm: 'asc' },
      select: {
        id: true,
        nomeCompleto: true,
        cpf: true,
        email: true,
        telefone: true,
        criadoEm: true,
      },
    });

    return NextResponse.json(fila);
  } catch (error) {
    console.error('[GET] Erro ao buscar fila de espera:', error);
    return NextResponse.json({ error: 'Erro ao buscar fila de espera.' }, { status: 500 });
  }
}
