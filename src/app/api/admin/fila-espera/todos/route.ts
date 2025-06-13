import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

export async function POST() {
  console.log('🔄 Rota POST /api/admin/fila-espera/todos chamada');

  try {
    const inscritosNaFila = await prisma.inscricao.findMany({
      where: { aListaEspera: true },
    });

    console.log('🔍 Inscritos encontrados na fila de espera:', inscritosNaFila);

    const ids = inscritosNaFila.map((i) => i.id);

    if (ids.length === 0) {
      console.log('⚠️ Nenhum inscrito na fila de espera.');
      return NextResponse.json({ liberados: [], falhas: [] });
    }

    // Exclui os registros da fila de espera
    const excluidos = await prisma.inscricao.deleteMany({
      where: { id: { in: ids } },
    });

    console.log('✅ Registros excluídos:', excluidos);

    if (excluidos.count !== ids.length) {
      console.log('⚠️ Nem todos os inscritos foram excluídos com sucesso');
    }

    return NextResponse.json({
      liberados: ids,
      falhas: excluidos.count === ids.length ? [] : ['parciais'],
    });

  } catch (error) {
    console.error('❌ Erro ao excluir inscrições em massa:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
