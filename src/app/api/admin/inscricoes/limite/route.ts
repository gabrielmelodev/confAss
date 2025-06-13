import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function POST(req: Request) {
  const { novoLimite } = await req.json();

  const config = await prisma.adminConfig.upsert({
    where: { id: 'config-geral' },
    update: { limiteInscricoes: novoLimite },
    create: { id: 'config-geral', pin: '', pinHash: '', limiteInscricoes: novoLimite },
  });

  const totalInscritos = await prisma.inscricao.count({
    where: { aListaEspera: false },
  });

  const vagasDisponiveis = Math.max(novoLimite - totalInscritos, 0);

  let liberados: string[] = [];

  if (vagasDisponiveis > 0) {
    const fila = await prisma.inscricao.findMany({
      where: { aListaEspera: true },
      orderBy: { criadoEm: 'asc' },
      take: vagasDisponiveis,
    });

    const idsParaLiberar = fila.map((p) => p.id);

    if (idsParaLiberar.length > 0) {
      await prisma.inscricao.updateMany({
        where: { id: { in: idsParaLiberar } },
        data: { aListaEspera: false },
      });
      liberados = idsParaLiberar;
    }
  }

  // Recalcula status após liberar vagas da fila
  const totalInscritosAtualizado = await prisma.inscricao.count({
    where: { aListaEspera: false },
  });

  const totalFilaAtualizado = await prisma.inscricao.count({
    where: { aListaEspera: true },
  });

  const vagasDisponiveisAtualizado = Math.max(novoLimite - totalInscritosAtualizado, 0);

 return NextResponse.json({
  mensagem:
    liberados.length > 0
      ? `${liberados.length} usuário(s) liberado(s) da fila.`
      : vagasDisponiveisAtualizado > 0
        ? `${vagasDisponiveisAtualizado} vaga(s) disponível(is).`
        : 'Nenhuma vaga disponível.',
  liberados,
  statusAtualizado: {
    limiteVagas: novoLimite,
    totalInscritos: totalInscritosAtualizado,
    totalFila: totalFilaAtualizado,
    vagasDisponiveis: vagasDisponiveisAtualizado,
  },
});
    
}


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