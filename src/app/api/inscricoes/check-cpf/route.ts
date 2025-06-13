import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cpfRaw = searchParams.get('cpf')
    console.log('CPF recebido (raw):', cpfRaw)

    const cpf = cpfRaw?.replace(/\D/g, '')
    console.log('CPF formatado:', cpf)

    if (!cpf) {
      console.warn('CPF não fornecido ou inválido')
      return NextResponse.json({ error: 'CPF é obrigatório.' }, { status: 400 })
    }

    const existe = await prisma.inscricao.findFirst({
      where: { cpf },
      select: { id: true },
    })

    console.log('Resultado da consulta:', existe)

    return NextResponse.json({ exists: Boolean(existe) }, { status: 200 })

  } catch (error) {
    console.error('Erro no endpoint /check-cpf:', error)

    // Loga a stack trace para facilitar debug
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack)
    }

    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    )
  }
}
