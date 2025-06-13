# Etapa 1 – Instala dependências e compila
FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos de configuração
COPY package.json package-lock.json ./
RUN npm install

# Copia tudo e compila o projeto (inclui Prisma)
COPY . .

# Gera Prisma Client e compila TypeScript
RUN npx prisma generate
RUN npm run build

# Etapa 2 – Imagem final para produção
FROM node:20-alpine AS runner

WORKDIR /app

# Reduz tamanho: apenas os arquivos essenciais
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Prisma Client precisa dos schemas para rodar
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 9000

CMD ["npm", "start"]
