import { NestFactory } from '@nestjs/core';
import { TelegramBotModule } from './telegram-bot.module';
import * as process from 'process';

async function bootstrap() {
  const app = await NestFactory.create(TelegramBotModule);
  await app.listen(process.env.PORT_TELEGRAM_BOT);
}
bootstrap();
