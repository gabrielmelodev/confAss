import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET() {
  try {
    // Busca todas as pessoas na fila de espera com os campos específicos
    const filaEspera = await prisma.filaEspera.findMany({
      select: {
        id: true,
        nomeCompleto: true,
        email: true,
      },
      orderBy: {
        id: 'asc', // Ordena por ordem de entrada
      },
    });

    return NextResponse.json(filaEspera);
  } catch (error) {
    console.error('[GET] Erro ao buscar fila de espera:', error);
    return NextResponse.json({ error: 'Erro ao buscar fila de espera.' }, { status: 500 });
  }
}
