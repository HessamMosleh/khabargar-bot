import { Test, TestingModule } from '@nestjs/testing';
import { CrawlerService } from './crawler.service';

describe('CrawlerService', () => {
  let service: CrawlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrawlerService],
    }).compile();

    service = module.get<CrawlerService>(CrawlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('do crawling as expected', async () => {
    await service.crawlingQomUniversityNews(30);
  }, 50000);

  it('do crawling events as expected', async () => {
    await service.crawlingQomUniversityEvents();
  }, 50000);

  it('do crawling evandSite', async () => {
    await service.crawlingEvandSite();
  }, 50000);

  it('do crawling QomSTP', async () => {
    await service.crawlingQomSTP();
  }, 50000);

  it('do crawling farabi events', async () => {
    await service.crawlingFarabiEvents();
  }, 50000);

  it('do crawling farabi news', async () => {
    await service.crawlingFarabiNews();
  }, 50000);

  it('do crawling ccima news', async () => {
    await service.crawlingQomCcimaNews();
  }, 50000);

  it('do crawling ccima announcements', async () => {
    await service.crawlingQomCcimaAnnouncements();
  }, 50000);

  it('do crawling JD Qom News', async () => {
    await service.crawlingJDQomNews();
  }, 50000);
});
