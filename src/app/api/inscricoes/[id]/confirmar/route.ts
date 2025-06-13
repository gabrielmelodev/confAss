import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  console.log('Recebendo requisição de confirmação para ID:', id);

  try {
    const inscricao = await prisma.inscricao.findUnique({
      where: { id }
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

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const inscricao = await prisma.inscricao.findUnique({
      where: { id }
    });

    if (!inscricao) {
      return NextResponse.json({ error: 'Inscrição não encontrada' }, { status: 404 });
    }

    const inscricaoAtualizada = await prisma.inscricao.update({
      where: { id },
      data: {
        presencaConfirmada: true,
        dataPresenca: new Date().toISOString(),
      }
    });

    return NextResponse.json({ message: 'Presença confirmada com sucesso', inscricao: inscricaoAtualizada }, { status: 200 });
  } catch (error) {
    console.error('Erro ao confirmar presença:', error);
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
  }
}
