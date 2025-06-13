'use client'

import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Printer, Download, Shield, CheckCircle, CalendarDays, MapPin, Clock, Check, Calendar } from 'lucide-react';
import * as Yup from 'yup'
import { InputValido } from './components/InputValidade' // seu componente customizado
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';



const etapas = ['dados', 'socio', 'participacao', 'eixo', 'imagem', 'revisao', 'comprovante']

const gerarPDF = async () => {
  const html2pdf = (await import('html2pdf.js')).default;

  const elemento = document.getElementById('comprovante');
  if (!elemento) return;

  html2pdf()
    .set({
      margin: 10,
      filename: 'comprovante.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    })
    .from(elemento)
    .save();
};


interface ModalEtqProps {
  open: boolean
  onClose: () => void
  qrCode?: string | null
  inscricao?: any | null
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  tipo?: 'texto' | 'cpf' | 'cep' | 'email' | 'dataNascimento' | 'data' | 'telefone'
  onCEP?: (endereco: EnderecoViaCEP) => void
  verificarDuplicado?: boolean
  name: string
}

type EnderecoViaCEP = {
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  [key: string]: any
}

export default function FormularioInscricaoCompleto() {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [inscricao, setInscricao] = useState<any>(null)
  const [inscricaoFinalizada, setInscricaoFinalizada] = useState(false);
  const [dadosInscricao, setDadosInscricao] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [inscricaoEncerrada, setInscricaoEncerrada] = useState(false);


  const initialValues = {
    // etapa dados
    nomeCompleto: '',
    nomeSocial: '',
    dataNascimento: '',
    idade: '',
    cpf: '',
    telefone: '',
    email: '',
    cep: '',
    enderecoRua: '',
    enderecoBairro: '',
    enderecoCidadeUF: '',
    // etapa socio
    genero: '',
    generoOutro: '',
    racaCor: '',
    pcd: '',
    tipoDeficiencia: '',
    recursoAcessibilidade: '',
    acessibilidade: '',
    orientacaoSexual: '',
    orientacaoOutro: '',
    // etapa participacao
    tipoParticipante: '',
    tipoParticipanteOutro: '',
    representaOrganizacao: '',
    nomeOrganizacao: '',
    jaParticipou: '',
    // etapa eixo
    eixoTematico: '',
    // etapa imagem
    autorizacaoImagem: false,
  }


  // Função para validar CPF (mesma lógica que você já tem)
  function validarCPF(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '')
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

    let soma = 0
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i)
    let resto = 11 - (soma % 11)
    if (resto >= 10) resto = 0
    if (resto !== parseInt(cpf[9])) return false

    soma = 0
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i)
    resto = 11 - (soma % 11)
    if (resto >= 10) resto = 0

    return resto === parseInt(cpf[10])
  }

  const comprovanteRef = useRef<HTMLDivElement>(null);


  const validationSchemas = [
    // dados
    Yup.object().shape({
      nomeCompleto: Yup.string().required('Nome completo é obrigatório'),
      cpf: Yup.string()
        .required('CPF é obrigatório')
        .test('cpf-valido', 'CPF inválido', value => (value ? validarCPF(value) : false)),
      email: Yup.string()
        .email('Email inválido')
        .required('Email é obrigatório'),
      cep: Yup.string()
        .required('CEP é obrigatório')
        .length(8, 'CEP deve ter 8 dígitos'),
      dataNascimento: Yup.string().required('Data de nascimento é obrigatória'),
    }),
    // socio
    Yup.object().shape({
      genero: Yup.string().required('Gênero é obrigatório'),
      // outros podem ser opcionais
    }),
    // participacao
    Yup.object().shape({
      tipoParticipante: Yup.string().required('Tipo de participante é obrigatório'),
      representaOrganizacao: Yup.string().required('Resposta obrigatória'),
      jaParticipou: Yup.string().required('Resposta obrigatória'),
    }),
    // eixo
    Yup.object().shape({
      eixoTematico: Yup.string().required('Eixo temático é obrigatório'),
    }),
    // imagem
    Yup.object().shape({
      autorizacaoImagem: Yup.boolean().oneOf([true], 'Autorização é obrigatória'),
    }),
    // revisão: sem validação extra, só revisão
    Yup.object(),
  ]

  function formatarTelefone(telefone: string): string {
    telefone = telefone.replace(/\D/g, '').slice(0, 11)

    if (telefone.length <= 10) {
      return telefone.replace(/(\d{2})(\d{4})(\d{0,4})/, (match, ddd, parte1, parte2) =>
        `(${ddd}) ${parte1}${parte2 ? `-${parte2}` : ''}`
      )
    } else {
      return telefone.replace(/(\d{2})(\d{5})(\d{0,4})/, (match, ddd, parte1, parte2) =>
        `(${ddd}) ${parte1}${parte2 ? `-${parte2}` : ''}`
      )
    }
  }

  function formatarCEP(cep: string): string {
    cep = cep.replace(/\D/g, '').slice(0, 8)
    return cep.replace(/(\d{5})(\d{0,3})/, (match, p1, p2) => `${p1}${p2 ? `-${p2}` : ''}`)
  }





  function handleEnderecoViaCEP(endereco: EnderecoViaCEP) {

    setFieldValue('enderecoRua', endereco.logradouro || '')
    setFieldValue('enderecoBairro', endereco.bairro || '')
    setFieldValue('enderecoCidadeUF', `${endereco.localidade || ''}/${endereco.uf || ''}`)
  }


  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Dados Pessoais"
      case 2:
        return "Endereço"
      case 3:
        return "Informações Sociodemográficas"
      case 4:
        return "Participação Social"
      case 5:
        return "Eixo Temático e Documentos"
      case 6:
        return "Processamento"
      default:
        return "Comprovante"
    }
  }

  // Retorna o nome do campo justificativa com base no tipo
  function campoJustificativa(tipo: string) {
    switch (tipo) {
      case 'pcd': return 'justificativaPCD'
      case 'acessibilidade': return 'justificativaAcessibilidade'
      case 'orientacaoSexual': return 'justificativaOrientacao'
      default: return ''
    }
  }

  async function handleSubmit(values: typeof initialValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    setInscricaoEncerrada(false);

    try {
      const response = await fetch('/api/inscricoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      let data: any = {};
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn("Resposta inesperada do servidor:", text);
        throw new Error('Resposta inválida do servidor');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao enviar inscrição');
      }

      // Se o backend avisar que a inscrição está na fila por limite atingido
      if (data.status === 'fila') {
        setInscricaoEncerrada(true);
        setSubmitSuccess(false);
        setSubmitError(null);
        setInscricao(data.fila); // opcional: dados da fila de espera
        setQrCode(null);
        return;
      }

      const { inscricao } = data;

      console.log("Dados da inscrição recebida:", inscricao);

      if (!inscricao?.id) {
        throw new Error("ID da inscrição não retornado");
      }

      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const qrCodeUrl = `${baseUrl}/confirmar/${inscricao.id}`;

      setQrCode(qrCodeUrl);
      setInscricao(inscricao);
      setSubmitSuccess(true);
      setStep(etapas.length - 1);

    } catch (error: any) {
      setSubmitError(error.message);
      setSubmitSuccess(false);
      setInscricaoEncerrada(false);
      setQrCode(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderStepContent(step: number, values: typeof initialValues, setFieldValue: any) {
    switch (etapas[step]) {
      case 'dados':
        return (
          <>
            <InputValido name="nomeCompleto" label="Nome completo" tipo="texto" />
            <InputValido name="nomeSocial" label="Nome social" tipo="texto" />
            <InputValido name="dataNascimento" label="Data de nascimento" tipo="dataNascimento" />
            <InputValido name="idade" label="Idade" tipo="texto" />

            <InputValido name="cpf" label="CPF" tipo="cpf" verificarDuplicado />
            <InputValido name="telefone" label="Telefone" tipo="telefone" />
            <InputValido name="email" label="Email" tipo="email" />

            <InputValido name="cep" label="CEP" tipo="cep" onCEP={handleEnderecoViaCEP} />
            <InputValido name="enderecoRua" label="Rua/Avenida" tipo="texto" />
            <InputValido name="enderecoBairro" label="Bairro" tipo="texto" />
            <InputValido name="enderecoCidadeUF" label="Cidade/UF" tipo="texto" />
          </>

        )
      case 'socio':
        return (
          <>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              2. Informações Sociodemográficas
            </h3>

            <Field as="select" name="genero" className="w-full text-black border px-3 py-2 rounded mb-2">
              <option value="">Gênero</option>
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
              <option value="nao-binario">Não-binário</option>
              <option value="outro">Outro</option>
              <option value="prefiro-nao-informar">Prefiro não informar</option>
            </Field>
            <ErrorMessage name="genero" component="div" className="text-red-600 text-sm mb-2" />

            {/* Campo que só aparece se 'genero' for 'outro' */}
            {values.genero === "outro" && (
              <Field
                name="generoOutro"
                placeholder="Outro gênero (se aplicável)"
                className="w-full text-black border px-3 py-2 rounded mb-4"
              />
            )}

            <Field as="select" name="racaCor" className="w-full text-black border px-3 py-2 rounded mb-2">
              <option value="">Raça/Cor</option>
              <option value="branca">Branca</option>
              <option value="preta">Preta</option>
              <option value="parda">Parda</option>
              <option value="amarela">Amarela</option>
              <option value="indigena">Indígena</option>
              <option value="nao-informar">Prefiro não informar</option>
            </Field>

            <Field as="select" name="pcd" className="w-full text-black border px-3 py-2 rounded mb-2">
              <option value="">Pessoa com deficiência?</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Field>

            {/* Renderiza o campo 'tipoDeficiencia' somente se pcd for 'sim' */}
            {values.pcd === "sim" && (
              <Field
                name="tipoDeficiencia"
                placeholder="Tipo de deficiência (se aplicável)"
                className="w-full text-black border px-3 py-2 rounded mb-4"
              />
            )}

            <Field
              as="select"
              name="recursoAcessibilidade"
              className="w-full text-black border px-3 py-2 rounded mb-2"
            >
              <option value="">Recurso de acessibilidade usado</option>
              <option value="libras">Libras</option>
              <option value="leitorTela">Leitor de Tela</option>
              <option value="legenda">Legenda</option>
              <option value="outro">Outro</option>
              <option value="nenhum">Nenhum</option>
            </Field>

            <Field
              as="select"
              name="acessibilidade"
              className="w-full text-black border px-3 py-2 rounded mb-2"
            >
              <option value="">Necessidade de acessibilidade</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Field>

            <Field
              as="select"
              name="orientacaoSexual"
              className="w-full text-black border px-3 py-2 rounded mb-2"
            >
              <option value="">Orientação Sexual</option>
              <option value="hetero">Heterossexual</option>
              <option value="homo">Homossexual</option>
              <option value="bi">Bissexual</option>
              <option value="asexo">Assexual</option>
              <option value="outro">Outro</option>
              <option value="prefiro-nao-informar">Prefiro não informar</option>
            </Field>

            {/* Outro campo condicional para orientação sexual "Outro" */}
            {values.orientacaoSexual === "outro" && (
              <Field
                name="orientacaoOutro"
                placeholder="Outra orientação (se aplicável)"
                className="w-full text-black border px-3 py-2 rounded"
              />
            )}
          </>
        )
      case 'participacao':
        return (
          <>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              3. Participação Social
            </h3>
            <Field
              as="select"
              name="tipoParticipante"
              className="w-full text-black  border px-3 py-2 rounded mb-2"
            >
              <option value="">Tipo de participante</option>
              <option value="comunidade">Comunidade</option>
              <option value="gestor">Gestor</option>
              <option value="profissional">Profissional</option>
              <option value="outro">Outro</option>
            </Field>
            <Field
              name="tipoParticipanteOutro"
              placeholder="Outro tipo (se aplicável)"
              className="w-full text-black  border px-3 py-2 rounded mb-4"
            />
            <Field
              as="select"
              name="representaOrganizacao"
              className="w-full text-black  border px-3 py-2 rounded mb-2"
            >
              <option value="">Representa alguma organização?</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Field>
            <InputValido
              name="nomeOrganizacao"
              label="Nome da organização (se aplicável)"
              tipo="texto"
            />
            <Field
              as="select"
              name="jaParticipou"
              className="w-full text-black  border px-3 py-2 rounded"
            >
              <option value="">Já participou de outras conferências?</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Field>
          </>
        )
      case 'eixo':
        return (
          <>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              4. Escolha do Eixo Temático
            </h3>

            <div role="radiogroup" aria-labelledby="eixoTematicoLabel" className="space-y-3">
              <span id="eixoTematicoLabel" className="sr-only">Eixo Temático</span>

              {[
                { value: "Eixo 1", label: "UNIVERSALIZAÇÃO DO SUAS: Acesso integral com Equidade e Respeito às diversidades." },
                { value: "Eixo 2", label: "APERFEIÇOAMENTO CONTÍNUO DO SUAS: Inovação, Gestão Descentralizada e valorização profissional. " },
                { value: "Eixo 3", label: "INTEGRAÇÃO DE BENEFÍCIOS E SERVIÇOS SOCIOASSISTENCIAIS: Fortalecendo a Proteção Social, Segurança de Renda e a Inclusão Social no SUAS. " },
                { value: "Eixo 4", label: "GESTÃO DEMOCRÁTICA, INFORMAÇÃO NO SUAS E COMUNICAÇÃO TRANSPARENTE: Fortalecendo a participação social no SUAS. " },
                { value: "Eixo 5", label: "SUSTENTABILIDADE FINANCEIRA E EQUIDADE NO COFINANCIAMENTO DO SUAS." },

              ].map((option) => (
                <label
                  key={option.value}
                  htmlFor={`eixoTematico-${option.value}`}
                  className="flex items-center cursor-pointer rounded p-3 border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  <Field
                    type="radio"
                    id={`eixoTematico-${option.value}`}
                    name="eixoTematico"
                    value={option.value}
                    className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>

            <ErrorMessage
              name="eixoTematico"
              component="div"
              className="text-red-600 text-sm mt-1"
            />
          </>

        )
      case 'imagem':
        return (
          <>
            <h3 className="text-lg font-semibold mb-4 text-black ">
              5. Autorização de Uso de Imagem
            </h3>
            <label className="flex text-black items-center gap-2">
              <Field type="checkbox" name="autorizacaoImagem" />
              Autorizo o uso da minha imagem para divulgação
            </label>
            <ErrorMessage
              name="autorizacaoImagem"
              component="div"
              className="text-red-600 text-sm"
            />
          </>
        )
      case 'revisao':
        return (
          <>
            {inscricaoEncerrada ? (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded font-semibold mt-2">
                O limite de inscrições foi atingido. Sua inscrição foi registrada na fila de espera.
              </div>
            ) : submitError ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded font-semibold mt-2">
                {submitError}
              </div>
            ) : submitSuccess ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded font-semibold mt-2">
                Inscrição enviada com sucesso!
              </div>
            ) : null}
          </>

        )


      case 'comprovante':
        return (
          <>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Comprovante de Inscrição
            </h3>

            {inscricao && (
              <>
                {/* Área do comprovante que será convertida em PDF */}
                <div ref={comprovanteRef} className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 space-y-4 max-w-md mx-auto text-black">
                  {inscricao.numeroInscricao && (
                    <div className="bg-[#d4d4d4] text-white p-3 rounded-lg">
                      <p className="text-sm text-black font-medium opacity-90">Número de Inscrição</p>
                      <p className="text-2xl text-black font-bold">{inscricao.numeroInscricao}</p>
                    </div>
                  )}

                  <div className="space-y-2 text-gray-700 text-base">
                    <p>
                      <span className="font-medium">Nome:</span> {inscricao.nomeCompleto}
                    </p>
                    <p>
                      <span className="font-medium">CPF:</span> {inscricao.cpf}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {inscricao.email}
                    </p>
                    <p>
                      <span className="font-medium">Eixo Temático:</span> {inscricao.eixoTematico}
                    </p>
                  </div>

                  {inscricao.aListaEspera ? (
                    <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-lg text-sm">
                      Sua inscrição foi recebida e está <strong>na fila de espera</strong>. Assim que houver vagas disponíveis, ela será efetivada automaticamente.
                    </div>
                  ) : (
                    qrCode && typeof qrCode === 'string' && (
                      <div className="flex justify-center pt-4">
                        <div className="p-2 bg-gray-100 rounded-xl border border-gray-300">
                          <QRCodeSVG value={qrCode} size={128} />
                        </div>
                      </div>
                    )
                  )}
                </div>


              </>
            )}
          </>


        )
      default:
        return null
    }
  }

  // Variáveis para progresso
  const currentStep = step + 1
  const totalSteps = etapas.length

  return (
    <>


      <div className="min-h-screen bg-white text-black">


        <div className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-[#99cc33] bg-clip-text text-transparent mb-2">
              10ª Conferência Municipal de Assistência Social
            </h2>
            <p className="text-xl text-gray-400">Formosa/GO - 2025</p>
            <p className="text-lg text-[#99cc33]  font-semibold mt-2">
              20 anos do SUAS: Construção, Proteção Social e Resistência
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#fefefe] to-[#fefefe] rounded-2xl overflow-hidden shadow-2xl border border-[#fefefe]">
            <div className="grid md:grid-cols-2">
              {/* Coluna do formulário */}
              <div className="p-6 md:p-8">
                {step < etapas.length - 1 && (
                  <button className="flex items-center text-sm text-gray-400 mb-6 hover:text-[#2E8B57] transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </button>
                )}

                {/* Indicador de progresso melhorado */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">
                      Etapa {currentStep} de {totalSteps}
                    </span>
                    <span className="text-sm font-semibold text-[#99cc33]">
                      {Math.round((currentStep / totalSteps) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#fefefe] rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#d4d4d4] to-[#dedede] h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
                      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-3">
                    {Array.from({ length: totalSteps }, (_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${i + 1 < currentStep
                          ? "bg-gradient-to-r from-[#dedede] to-[#d4d4d4] text-black shadow-lg scale-110"
                          : i + 1 === currentStep
                            ? "bg-gradient-to-r from-[#fefefe] to-[#d4d4d4] text-black shadow-lg scale-110 animate-pulse"
                            : "bg-[#d4d4d4] text-black"
                          }`}
                      >
                        {i + 1 < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-2 text-[##99cc33]">{getStepTitle()}</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Preencha os dados abaixo para participar da 10ª Conferência Municipal de Assistência Social de
                  Formosa/GO.
                </p>

                {inscricaoFinalizada ? (
                  <></>
                ) : (
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchemas[step]}
                    onSubmit={handleSubmit}
                  >
                    {({ values, setFieldValue, validateForm }) => (
                      <Form>
                        {renderStepContent(step, values, setFieldValue)}

                        <div className="mt-6 flex justify-between">
                          {step > 2 && (
                            <button
                              type="button"
                              onClick={() => setStep(step - 1)}
                              className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded"
                            >
                              Voltar
                            </button>
                          )}

                          {step < etapas.length - 2 && (
                            <button
                              type="button"
                              onClick={async () => {
                                const errors = await validateForm()
                                if (Object.keys(errors).length === 0) {
                                  setStep(step + 1)
                                } else {
                                  alert(
                                    'Existem campos inválidos ou obrigatórios. Por favor, corrija antes de avançar.'
                                  )
                                }
                              }}
                              className="bg-[#99cc33] hover:bg-[#99cc33] text-white font-semibold py-2 px-4 rounded ml-auto"
                            >
                              Próximo
                            </button>
                          )}

                          {step === etapas.length - 2 && (
                            <button
                              type="submit"

                              disabled={submitSuccess}
                              className="bg-[#99cc33] hover:bg-green-400 text-white font-semibold py-2 px-6 rounded ml-auto"
                            >
                              {isSubmitting ? 'Enviando...' : 'Enviar Inscrição'}
                            </button>
                          )}
                        </div>


                      </Form>


                    )}
                  </Formik>

                )}

              </div>

              {/* Coluna de informações melhorada */}
              <div className="relative overflow-hidden bg-[#99cc33] p-6 md:p-8 rounded-2xl shadow-xl">
                {/* Círculos animados no fundo */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                  className="absolute inset-0 z-0"
                >
                  <motion.div
                    animate={{ x: [-50, 0, -50], y: [-50, 0, -50] }}
                    transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                    className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-2xl"
                  />
                  <motion.div
                    animate={{ x: [30, 0, 30], y: [30, 0, 30] }}
                    transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
                    className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl"
                  />
                </motion.div>

                {/* Conteúdo */}
                <div className="relative z-10 space-y-6">
                  {/* Logo e Título */}
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <img
                      src="/branco.png"
                      alt="COMAS"
                      className="h-15 w-auto object-contain select-none"
                    />
                  </motion.div>

                  <motion.h3
                    className="text-3xl font-bold text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    Porque cada momento de <span className="text-black">participação</span> conta
                  </motion.h3>

                  <motion.p
                    className="text-white/90 text-sm leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    Inscreva-se na 10ª Conferência Municipal e veja-a florescer em um ambiente acolhedor, seguro e
                    estimulante. Sua voz é fundamental para o fortalecimento do SUAS.
                  </motion.p>

                  {/* Cards de informações */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.6 }}
                  >
                    <InfoCard
                      icon={<Calendar className="h-6 w-6 text-white" />}
                      title="03 de julho de 2025"
                      subtitle="Data da conferência"
                    />

                    <InfoCard
                      icon={<MapPin className="h-6 w-6 text-white" />}
                      title="Universidade Estadual de Goiás"
                      subtitle="Unidade Formosa"
                    />

                    <InfoCard
                      icon={<Clock className="h-6 w-6 text-white" />}
                      title="Manhã (08h às 12h), Tarde (13h30 às 16h), Noite (17h às 19h)"
                      subtitle=""
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >






    </>
  )
}


function InfoCard({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="flex items-start gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-md shadow-sm"
    >
      {icon}
      <div className="flex flex-col text-white">
        <p className="font-bold">{title}</p>
        {subtitle && <p className="text-sm">{subtitle}</p>}
      </div>
    </motion.div>
  );
}


function setFieldValue(name: any, novoValor: string) {
  throw new Error('Function not implemented.');
}

// @ts-ignore
import html2pdf from 'html2pdf.js';

