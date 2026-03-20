# Construcción (Build Stage)
FROM node:22-alpine AS build
WORKDIR /app

# Instalar package manager específico del proyeco (pnpm vs npm)
RUN npm install -g pnpm@10.28.0

# Instalar Node Modules
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Compilar proyecto Angular 18/19 SSR (genera Server.mjs en /dist)
COPY . .
RUN pnpm run build

# Producción SSR (Run Stage Node)
FROM node:22-alpine
WORKDIR /app

# Copia los archivos renderizados del compilador
COPY --from=build /app/dist /app/dist
COPY package.json ./

EXPOSE 4000

# Angular SSR expone el puerto para renderizado Server-Side automáticamente
CMD ["node", "dist/VintageVibe/server/server.mjs"]
