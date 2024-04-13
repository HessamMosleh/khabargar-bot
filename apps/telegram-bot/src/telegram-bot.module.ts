import { Module } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';
import { CommonModule, RmqModule } from '@app/common';
import { CRAWLER_SERVICE } from './constants/service';

@Module({
  imports: [
    CommonModule,
    RmqModule.register({
      name: CRAWLER_SERVICE,
    }),
  ],
  providers: [TelegramBotService],
})
export class TelegramBotModule {}
