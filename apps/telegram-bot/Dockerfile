FROM node:lts As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN corepack enable
RUN corepack prepare pnpm@latest --activate


RUN pnpm install

COPY . .

RUN pnpm run build telegram-bot

FROM node:lts as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

RUN pnpm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/telegram-bot/main"]
