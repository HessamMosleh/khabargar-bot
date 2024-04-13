import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrawlerModule } from './crawler/crawler.module';
import { CommonModule, RmqModule } from '@app/common';

@Module({
  imports: [CrawlerModule, CommonModule, RmqModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
