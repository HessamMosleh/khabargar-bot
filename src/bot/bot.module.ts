import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { CrawlerModule } from '../crawler/crawler.module';

@Module({
  imports: [CrawlerModule],
  providers: [BotService],
})
export class BotModule {}
