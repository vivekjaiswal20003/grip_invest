# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./ 

RUN npm install --production


COPY . .

# Stage 2: Run the application
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/seed.js ./seed.js
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
