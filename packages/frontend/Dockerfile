FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# PUBLIC_API_URL is read at runtime (dynamic public env), so it does not need to be set here
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/build ./build

ENV PORT=3000
EXPOSE 3000

CMD ["node", "build"]
