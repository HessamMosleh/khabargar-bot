import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CrawlerService } from './crawler.service';
import { RmqService } from '@app/common';

@Controller('crawler')
export class CrawlerController {
  constructor(
    private readonly service: CrawlerService,
    private readonly rmqService: RmqService,
  ) {}
  @MessagePattern('qom-events')
  getQomEvents(@Payload() data: any[], @Ctx() context: RmqContext) {
    const results = this.service.crawlingQomUniversityEvents();
    this.rmqService.ack(context);
    return results;
  }

  @MessagePattern('qom-news')
  getQomNews(@Payload() data: Record<string, any>, @Ctx() context: RmqContext) {
    const results = this.service.crawlingQomUniversityNews(data.count);
    this.rmqService.ack(context);
    return results;
  }

  @MessagePattern('evand')
  getEvandEvents(@Ctx() context: RmqContext) {
    const results = this.service.crawlingEvandSite();
    this.rmqService.ack(context);
    return results;
  }

  @MessagePattern('qom-stp')
  getQomSTPNews(
    @Payload() data: Record<string, any>,
    @Ctx() context: RmqContext,
  ) {
    const results = this.service.crawlingQomSTP();
    this.rmqService.ack(context);
    return results;
  }

  @MessagePattern('farabi-events')
  getFarabiEvents(@Payload() data: any[], @Ctx() context: RmqContext) {
    const results = this.service.crawlingFarabiEvents();
    this.rmqService.ack(context);
    return results;
  }

  @MessagePattern('farabi-news')
  getFarabiNews(@Payload() data: any[], @Ctx() context: RmqContext) {
    const results = this.service.crawlingFarabiNews();
    this.rmqService.ack(context);
    return results;
  }

  @MessagePattern('ccima-news')
  getQomCcimaNews(@Payload() data: any[], @Ctx() context: RmqContext) {
    const results = this.service.crawlingQomCcimaNews();
    this.rmqService.ack(context);
    return results;
  }

  @MessagePattern('ccima-announcements')
  getQomCcimaAnnouncement(@Payload() data: any[], @Ctx() context: RmqContext) {
    const results = this.service.crawlingQomCcimaAnnouncements();
    this.rmqService.ack(context);
    return results;
  }

  @MessagePattern('jd-qom')
  getJDQomNews(@Payload() data: any[], @Ctx() context: RmqContext) {
    const results = this.service.crawlingJDQomNews();
    this.rmqService.ack(context);
    return results;
  }
}
