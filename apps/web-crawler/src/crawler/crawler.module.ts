import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { RmqModule } from '@app/common';
import { CrawlerController } from './crawler.controller';

@Module({
  imports: [RmqModule],
  providers: [CrawlerService],
  exports: [CrawlerService],
  controllers: [CrawlerController],
})
export class CrawlerModule {}
