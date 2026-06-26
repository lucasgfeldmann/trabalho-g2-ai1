# ─── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (aproveita cache do Docker)
COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

# Copia o restante do código-fonte
COPY . .

# Gera o bundle de produção
RUN npm run build

# ─── Stage 2: servidor estático (nginx) ───────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove a config padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia nossa config customizada para SPA
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copia os arquivos buildados do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
