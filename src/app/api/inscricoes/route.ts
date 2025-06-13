import { NextResponse } from 'next/server';
import { isValid, parse, startOfDay } from 'date-fns';
import QRCode from 'qrcode';
import { prisma } from '../../../../lib/prisma';

const LIMITE_INSCRICOES_PADRAO = 230;

async function gerarQRCodeConfirmacao(id: string): Promise<string> {
  const baseUrl = process.env.BASE_URL || 'http://10.1.60.207:3000';
  const urlConfirmacao = `${baseUrl}/confirmar/${id}`;
  return await QRCode.toDataURL(urlConfirmacao);
}

function parseDataNascimento(dataNascimento: string): Date | null {
  let parsed = new Date(dataNascimento);
  if (isValid(parsed)) return startOfDay(parsed);
  parsed = parse(dataNascimento, 'dd/MM/yyyy', new Date());
  if (isValid(parsed)) return startOfDay(parsed);
  return null;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validação da data de nascimento
    const dataNascimentoDate = parseDataNascimento(data.dataNascimento);
    if (!dataNascimentoDate) {
      return NextResponse.json({ error: 'Data de nascimento inválida.' }, { status: 400 });
    }

    const config = await prisma.adminConfig.findUnique({ where: { id: 'config-geral' } });
    const limiteInscricoes = config?.limiteInscricoes ?? LIMITE_INSCRICOES_PADRAO;

    const totalInscritos = await prisma.inscricao.count({ where: { aListaEspera: false } });

    // Validação de campos obrigatórios
    const obrigatorios = ['nomeCompleto', 'cpf', 'email', 'enderecoRua'];
    for (const campo of obrigatorios) {
      if (!data[campo]) {
        return NextResponse.json({ error: `Campo ${campo} é obrigatório.` }, { status: 400 });
      }
    }

    const pcdRaw = data.pcd;
    const pessoaComDeficiencia = pcdRaw === 'sim' ? true : pcdRaw === 'nao' ? false : null;
    if (pessoaComDeficiencia === null) {
      return NextResponse.json({ error: 'Campo pessoaComDeficiencia (pcd) inválido.' }, { status: 400 });
    }

    const cpfLimpo = data.cpf.replace(/\D/g, '');
    const cpfExistente = await prisma.inscricao.findUnique({ where: { cpf: cpfLimpo } });
    if (cpfExistente) {
      return NextResponse.json({ error: 'CPF já cadastrado.' }, { status: 409 });
    }

    const aListaEspera = totalInscritos >= limiteInscricoes;

    const ultimaInscricao = await prisma.inscricao.findFirst({
      orderBy: { numeroInscricao: 'desc' },
    });
    const proximoNumero = (ultimaInscricao?.numeroInscricao || 0) + 1;

    const inscricao = await prisma.inscricao.create({
      data: {
        numeroInscricao: proximoNumero,
        nomeCompleto: data.nomeCompleto,
        nomeSocial: data.nomeSocial || null,
        dataNascimento: dataNascimentoDate,
        idade: Number(data.idade) || 0,
        cpf: cpfLimpo,
        telefone: data.telefone || null,
        email: data.email,
        enderecoRua: data.enderecoRua,
        enderecoBairro: data.enderecoBairro || '',
        enderecoCidadeUF: data.enderecoCidadeUF || '',
        cep: data.cep || null,
        genero: data.genero || null,
        racaCor: data.racaCor || '',
        pessoaComDeficiencia,
        tipoDeficiencia: data.tipoDeficiencia || null,
        recursoAcessibilidade: data.recursoAcessibilidade === 'true' || data.recursoAcessibilidade === true,
        qualAcessibilidade: data.qualAcessibilidade?.trim() || null,
        orientacaoSexual: data.orientacaoSexual || null,
        tipoParticipante: data.tipoParticipante || null,
        representaOrganizacao: data.representaOrganizacao === 'true' || data.representaOrganizacao === true,
        organizacaoNome: data.organizacao || null,
        jaParticipouConferencias: Boolean(data.jaParticipouConferencias),
        eixoTematico: data.eixoTematico || null,
        autorizacaoImagem: Boolean(data.autorizacaoImagem),
        aListaEspera,
      },
    });

    if (!aListaEspera) {
      const qrCodeDataUrl = await gerarQRCodeConfirmacao(inscricao.id);
      return NextResponse.json({
        id: inscricao.id,
        inscricao,
        qrCodeDataUrl,
        status: 'ativo',
      });
    } else {
      return NextResponse.json({
        id: inscricao.id,
        inscricao,
        status: 'lista_espera',
        mensagem: 'Inscrição realizada com sucesso. Você está na lista de espera.',
      });
    }

  } catch (error: any) {
    console.error('[POST] Erro:', error);
    return NextResponse.json({ error: 'Erro ao criar inscrição.' }, { status: 500 });
  }
}



export async function GET() {
  try {
    const inscricoes = await prisma.inscricao.findMany();
    return NextResponse.json(inscricoes);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar inscrições.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID da inscrição é obrigatório.' }, { status: 400 });
    }

    await prisma.inscricao.delete({ where: { id } });

    return NextResponse.json({ message: 'Inscrição deletada com sucesso.' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar inscrição.' }, { status: 500 });
  }
}
