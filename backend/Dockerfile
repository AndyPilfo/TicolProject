FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
COPY package*.json ./
RUN npm install

FROM base AS dev
ENV NODE_ENV=development
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["npm","run","dev"]

FROM base AS prod
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
EXPOSE 4000
CMD ["npm","start"]
