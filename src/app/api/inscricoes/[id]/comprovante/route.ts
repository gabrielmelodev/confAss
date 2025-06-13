import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('inscricaoId');

  console.log('ID recebido via query string:', id);

  if (!id) {
    return NextResponse.json({ error: 'ID não informado' }, { status: 400 });
  }

  try {
    const inscricao = await prisma.inscricao.findUnique({
      where: { id },
    });

    if (!inscricao) {
      return NextResponse.json({ error: 'Inscrição não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ inscricao }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar inscrição:', error);
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
  }
}
