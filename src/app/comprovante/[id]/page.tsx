'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Download,
  Shield,
  CheckCircle,
  CalendarDays,
  MapPin,
  Clock,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Inscricao {
  inscricaoId: string;
  dataInscricao: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  cidade: string;
  eixoTexto: string;
  qrCodeData: string;
}

export default function ComprovantePage() {
  const searchParams = useSearchParams();
  const inscricaoId = searchParams.get('inscricaoId') || '';

  const [inscricaoData, setInscricaoData] = useState<Inscricao | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const comprovantePrintRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  if (!inscricaoId) return;

  setLoading(true);
  setError('');
  setInscricaoData(null);

  fetch(`/api/inscricoes/${inscricaoId}/comprovante`, )
    .then((res) => {
      if (!res.ok) throw new Error('Erro ao buscar inscrição');
      return res.json();
    })
    .then((data: Inscricao) => {
      setInscricaoData(data);
      setLoading(false);
    })
    .catch(() => {
      setError('Falha ao carregar dados da inscrição. Por favor, tente novamente.');
      setLoading(false);
    });
}, [inscricaoId]);

  function handlePrint() {
    if (comprovantePrintRef.current) {
      window.print();
    }
  }

  const dataFormatada = inscricaoData?.dataInscricao
    ? new Date(inscricaoData.dataInscricao).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Carregando comprovante...</p>
      </div>
    );
  }

  if (!inscricaoId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-4">
        <p className="mb-4 text-lg font-semibold">ID da inscrição não informado.</p>
        <Link
          href="/"
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
        >
          Voltar
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-4">
        <p className="mb-4 text-lg font-semibold text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#2E8B57] text-white rounded hover:bg-[#276a45] transition"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
        >
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans">
    
      <main className="py-8 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="mb-6 flex flex-wrap gap-4 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-[#333] hover:bg-[#444] text-white rounded-lg transition-transform duration-200 transform hover:scale-105"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o formulário
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#2E8B57] to-[#32CD32] hover:from-[#228B22] hover:to-[#2E8B57] text-white rounded-lg transition-transform duration-200 transform hover:scale-105"
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir comprovante
          </button>

          <button
            onClick={() => alert('Função de download de PDF ainda não implementada')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-transform duration-200 transform hover:scale-105"
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </button>

          <Link
            href="/admin/scanner"
            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-transform duration-200 transform hover:scale-105"
          >
            <Shield className="mr-2 h-4 w-4" />
            Verificar QR Code
          </Link>
        </div>

        <section
          ref={comprovantePrintRef}
          className="bg-white rounded-2xl overflow-hidden shadow-2xl print:shadow-none p-6 md:p-8"
        >
          <article className="text-gray-800">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="font-semibold text-green-800">Inscrição Confirmada</p>
                <p className="text-sm text-green-600">Sua inscrição foi processada com sucesso</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-sm mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#2E8B57]" />
                <div>
                  <p className="font-semibold text-gray-800">Data</p>
                  <p className="text-gray-600">{dataFormatada}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#2E8B57]" />
                <div>
                  <p className="font-semibold text-gray-800">Local</p>
                  <p className="text-gray-600">Universidade Estadual de Goiás – Unidade Formosa</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#2E8B57]" />
                <div>
                  <p className="font-semibold text-gray-800">Horários</p>
                  <p className="text-gray-600">08h às 19h</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <section className="space-y-4">
                <h3 className="text-xl font-bold mb-4 text-[#2E8B57] border-b border-gray-200 pb-2">
                  Dados da Inscrição
                </h3>

                <div className="space-y-3">
                  <p>
                    <strong>Nome:</strong> {inscricaoData?.nome ?? '—'}
                  </p>
                  <p>
                    <strong>CPF:</strong> {inscricaoData?.cpf ?? '—'}
                  </p>
                  <p>
                    <strong>Telefone:</strong> {inscricaoData?.telefone ?? '—'}
                  </p>
                  <p>
                    <strong>E-mail:</strong> {inscricaoData?.email ?? '—'}
                  </p>
                  <p>
                    <strong>Cidade:</strong> {inscricaoData?.cidade ?? '—'}
                  </p>
                  <p>
                    <strong>Eixo Temático:</strong> {inscricaoData?.eixoTexto ?? '—'}
                  </p>
                </div>
              </section>

              <section className="flex flex-col items-center justify-center gap-4 p-4 bg-[#f9fafb] rounded-xl border border-[#e5e7eb]">
                {inscricaoData && inscricaoData.qrCodeData ? (
                  <QRCodeSVG
                    value={inscricaoData.qrCodeData}
                    size={200}
                    bgColor="#FFFFFF"
                    fgColor="#2E8B57"
                    level="H"
                  />
                ) : (
                  <p className="text-red-600 font-semibold">QR Code não disponível.</p>
                )}
                <p className="text-center text-xs text-gray-500">
                  Apresente este QR Code na entrada para validação da inscrição.
                </p>
              </section>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
