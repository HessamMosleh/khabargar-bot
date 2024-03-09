import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrawlerModule } from './crawler/crawler.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [CrawlerModule, BotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
