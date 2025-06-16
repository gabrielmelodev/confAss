# COMAS-2025

> Projeto Next.js com Prisma para gerenciamento de inscrições e administração.

---

## 🚀 Sobre o Projeto

Este projeto é uma aplicação web construída com Next.js e Prisma, voltada para controle e gestão de inscrições, com funcionalidades como:

- Cadastro e gerenciamento de inscrições
- Controle de presença
- Integração com banco PostgreSQL via Prisma
- Interface moderna e responsiva
- Autenticação e configurações administrativas

---

## 📦 Tecnologias Utilizadas

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/) (se estiver usando)
- Outras libs: Formik, Yup, Radix UI, etc.

---

## ⚙️ Como Rodar o Projeto Localmente

### Pré-requisitos

- Node.js (v20+ recomendado)
- Docker (opcional, para banco e ambiente)

### Passos para executar

```bash
# Clone o repositório
git clone https://github.com/seuusuario/comas-2025.git
cd comas-2025

# Instale as dependências
npm install

# Configure a variável de ambiente DATABASE_URL no arquivo .env
# Exemplo:
# DATABASE_URL="postgres://usuario:senha@localhost:5432/banco"

# Gere o cliente Prisma e rode as migrations (se houver)
npx prisma generate
npx prisma migrate deploy

# Rode o projeto em modo desenvolvimento
npm run dev

# Ou rode o build para produção
npm run build
npm start
