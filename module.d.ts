declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'production' | 'development';

    TELEGRAM_BOT_TOKEN: string;

    PORT_TELEGRAM_BOT: number;
  }
}
