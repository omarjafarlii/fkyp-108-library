# ---------- 1-ci mərhələ: build ----------
FROM node:22-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# generate bazaya qoşulmur, amma prisma.config.ts DATABASE_URL tələb edir
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate
RUN npm run build

# ---------- 2-ci mərhələ: runtime ----------
FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --omit=optional

COPY --from=build /app/dist ./dist

RUN mkdir -p uploads && chown node:node uploads
USER node

EXPOSE 3000
CMD ["node", "--enable-source-maps", "dist/server.js"]
