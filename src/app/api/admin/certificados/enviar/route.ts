import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '../../../../../../lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY); // Crie essa variável no .env

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs inválidos.' }, { status: 400 });
    }

    const inscricoes = await prisma.inscricao.findMany({
      where: { id: { in: ids } },
    });

    for (const inscricao of inscricoes) {
      if (!inscricao.email) continue;

      await resend.emails.send({
        from: 'certificados@seu-dominio.com.br', // use domínio verificado no Resend
        to: inscricao.email,
        subject: 'Seu certificado de participação',
        html: `
          <div style="font-family: sans-serif;">
            <h2>Olá, ${inscricao.nomeCompleto}!</h2>
            <p>Obrigado por participar da 10ª Conferência Municipal.</p>
            <p>Segue seu certificado de participação.</p>
            <a href="https://seusite.com/certificados/${inscricao.id}" target="_blank" style="padding: 10px 15px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Visualizar Certificado</a>
            <p>Em caso de dúvidas, entre em contato conosco.</p>
          </div>
        `,
      });

      await prisma.inscricao.update({
        where: { id: inscricao.id },
        data: { certificadoEnviado: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar certificados:', error);
    return NextResponse.json({ error: 'Erro interno ao enviar certificados' }, { status: 500 });
  }
}
