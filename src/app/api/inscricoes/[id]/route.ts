import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const inscricao = await prisma.inscricao.findUnique({
    where: { id }
  });

  if (!inscricao) {
    return NextResponse.json({ error: 'Inscrição não encontrada' }, { status: 404 });
  }

  return NextResponse.json({
    inscricaoId: inscricao.id,
    dataInscricao: inscricao.dataNascimento?.toISOString() ?? null,
    nome: inscricao.nomeCompleto,
    cpf: inscricao.cpf,
    telefone: inscricao.telefone,
    email: inscricao.email,
    endereco: {
      rua: inscricao.enderecoRua,
      bairro: inscricao.enderecoBairro,
      cidadeUF: inscricao.enderecoCidadeUF,
      cep: inscricao.cep
    },
    qrCodeData: `comprovante:${inscricao.id}`,
  });
}