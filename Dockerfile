FROM node:lts as node
ENV APP_ROOT /src

WORKDIR ${APP_ROOT}
COPY package*.json ./

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

RUN pnpm install

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY . ${APP_ROOT}
RUN pnpm run build

ENV HOST 0.0.0.0
EXPOSE 8085

CMD [ "pnpm", "run","start:prod" ]
