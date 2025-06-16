import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Exemplo: pathname = '/api/inscricoes/1234'
  const segments = pathname.split('/');
  const id = segments[segments.length - 1]; // pega o último segmento da URL

  // Agora você pode usar o id para buscar no banco
  const inscricao = await prisma.inscricao.findUnique({
    where: { id },
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
      cep: inscricao.cep,
    },
    qrCodeData: `comprovante:${inscricao.id}`,
  });
}
