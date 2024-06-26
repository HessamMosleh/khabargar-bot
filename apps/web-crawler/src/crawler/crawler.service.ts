import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
@Injectable()
export class CrawlerService {
  async crawlingQomUniversityNews(lastCount: number) {
    const currentURL = 'https://qom.ac.ir/pages/Archive.aspx';

    await this.checkUrlHealth(currentURL);
    const { browser, page } = await this.initPuppeteer(currentURL);

    const newsHandles = await page.$$(
      '#ctl00_ctl53_g_4ecf688a_5d1c_4129_b0ec_ad3410b20785_csr1_groupContent > .sfg-ItemSearchResult',
    );

    let isButtonDisabled;

    const news = [];
    while (!isButtonDisabled && news.length < lastCount) {
      for (const newsHandel of newsHandles) {
        const title = await page.evaluate(
          (el) =>
            el.querySelector(
              'a > div.col-xs-9.no-padding.newsTextAbstract > h3',
            )?.textContent,
          newsHandel,
        );

        const description = await page.evaluate(
          (el) =>
            el.querySelector('a > div.col-xs-9.no-padding.newsTextAbstract > p')
              ?.textContent,
          newsHandel,
        );

        const newsLink = await page.evaluate(
          (el) =>
            el
              .querySelector(
                '#ctl00_ctl53_g_4ecf688a_5d1c_4129_b0ec_ad3410b20785_csr1_groupContent > div > a',
              )
              ?.getAttribute('href'),
          newsHandel,
        );
        if (title && newsLink)
          news.push(
            `*${title}*\n${description ? description + '\n\n' : '\n'}لینک خبر:${newsLink}`,
          );
      }

      isButtonDisabled = (await page.$('#PageLinkNext')) === null;

      if (!isButtonDisabled && news.length < lastCount) {
        await page.click('#PageLinkNext');
        await page.waitForSelector(
          '#ctl00_ctl53_g_4ecf688a_5d1c_4129_b0ec_ad3410b20785_csr1_groupContent > div:nth-child(1)',
        );
      }
    }

    await browser.close();

    return news;
  }

  async crawlingQomUniversityEvents() {
    const currentURL = 'https://qom.ac.ir';

    await this.checkUrlHealth(currentURL);
    const { browser, page } = await this.initPuppeteer(currentURL);

    const eventsHandles = await page.$$(
      '#sfg-HomePageSlider > div.owl-stage-outer > div > .owl-item:not(.cloned)',
    );

    const events = [];
    for (const event of eventsHandles) {
      const title = await page.evaluate(
        (el) => el.querySelector('div > div > a')?.textContent,
        event,
      );

      const eventLink = await page.evaluate(
        (el) => el.querySelector('div > div > a')?.getAttribute('href'),
        event,
      );
      if (title && eventLink)
        events.push(`*${title}*\n\nلینک خبر:${eventLink}`);
    }

    await browser.close();

    return events;
  }

  async crawlingEvandSite() {
    const currentURL = 'https://evand.com/events?cities=%D9%82%D9%85';
    await this.checkUrlHealth(currentURL);
    const { browser, page } = await this.initPuppeteer(currentURL);

    await page.waitForSelector(
      '#__next > div > div.ContainerWithSidebar__Wrapper-sc-m6lohv-3.diEzLd.wrapper',
    );
    const eventsHandles = await page.$$(
      '#__next > div > div.ContainerWithSidebar__Wrapper-sc-m6lohv-3.diEzLd.wrapper > div > div.all-events-cards-container > div > div > div > section',
    );

    const events = [];

    for (const event of eventsHandles) {
      const title = await page.evaluate(
        (el) => el.querySelector('div > div > a > h2')?.textContent,
        event,
      );

      const date = await page.evaluate(
        (el) => el.querySelector('div > div > div > div > span')?.textContent,
        event,
      );

      let link = await page.evaluate(
        (el) => el.querySelector('a')?.getAttribute('href'),
        event,
      );
      link = `https://evand.com${link}`;

      if (title && link && date)
        events.push(`*${title}*\n${date}\n\n[لینک خبر](${link})`);
    }

    await browser.close();
    return events;
  }

  async crawlingQomSTP() {
    const currentURL =
      'https://qomstp.ir/%D8%A2%D8%B1%D8%B4%DB%8C%D9%88-%D8%A7%D8%AE%D8%A8%D8%A7%D8%B1';

    await this.checkUrlHealth(currentURL);
    const { browser, page } = await this.initPuppeteer(currentURL);

    const eventsHandles = await page.$$('main > div > div > div');

    const events = [];
    for (const event of eventsHandles) {
      const title = await page.evaluate(
        (el) =>
          el.querySelector('div  > a > div.card-body.px-2 > h3')?.textContent,
        event,
      );

      const eventLink = await page.evaluate(
        (el) => el.querySelector('div > div > a')?.getAttribute('href'),
        event,
      );
      if (title && eventLink)
        events.push(`*${title}*\n\nلینک خبر:${eventLink}`);
    }

    await browser.close();

    return events;
  }

  async crawlingFarabiEvents() {
    const currentURL = 'https://farabi.ut.ac.ir/fa';

    await this.checkUrlHealth(currentURL);
    const { browser, page } = await this.initPuppeteer(currentURL);

    const eventsHandles = await page.$$(
      '#main-slider-album > div.owl-stage-outer > div > .owl-item:not(.cloned)',
    );

    const events = [];
    for (const event of eventsHandles) {
      let picUrl = await page.evaluate(
        (el) => el.querySelector('div  > div > a > img')?.getAttribute('src'),
        event,
      );

      if (!picUrl.startsWith('http')) picUrl = new URL(picUrl, currentURL).href;

      const eventLink = await page.evaluate(
        (el) => el.querySelector('div > div > a')?.getAttribute('href'),
        event,
      );

      const title = await page.evaluate(
        (el) =>
          el.querySelector('div > div > .carousel-caption > h2')?.textContent,
        event,
      );
      if (picUrl && eventLink)
        events.push({
          picUrl,
          description: `*${title}*\n\nلینک خبر:${eventLink}`,
        });
    }

    await browser.close();

    return events;
  }

  async crawlingFarabiNews() {
    const currentURL =
      'https://farabi.ut.ac.ir/fa/news/category/258/%D8%A7%D8%AE%D8%A8%D8%A7%D8%B1';

    await this.checkUrlHealth(currentURL);
    const { browser, page } = await this.initPuppeteer(currentURL);

    const eventsHandles = await page.$$(
      'body > div.container.main-content > div > div > div.news-index.blog-view > div > div > div > div.col-md-4 > article > div.item-content',
    );

    const events = [];
    for (const event of eventsHandles) {
      const eventLink = await page.evaluate(
        (el) => el.querySelector('div > h3 > a')?.getAttribute('href'),
        event,
      );

      const title = await page.evaluate(
        (el) => el.querySelector('div > h3 > a')?.textContent,
        event,
      );
      if (title && eventLink)
        events.push(`*${title}*\n\nلینک خبر:${eventLink}`);
    }

    await browser.close();

    return events;
  }

  async crawlingQomCcimaNews() {
    const currentURL = 'https://qomccima.ir/latest-news/';

    await this.checkUrlHealth(currentURL);
    const { browser, page } = await this.initPuppeteer(currentURL);

    const eventsHandles = await page.$$(
      'body > main > div > section.elementor-element-01401ea > div > div.elementor-column.elementor-col-50.elementor-top-column.elementor-element.elementor-element-4990b0e.animated.fadeInUp > div > div.elementor-element-b7fdff1 > div > div.elementor-posts-container > article',
    );

    const events = [];
    for (const event of eventsHandles) {
      const eventLink = await page.evaluate(
        (el) =>
          el.querySelector('article > div > h3 > a')?.getAttribute('href'),
        event,
      );

      const title = await page.evaluate(
        (el) => el.querySelector('article > div > h3 > a')?.textContent,
        event,
      );

      const description = await page.evaluate(
        (el) =>
          el.querySelector('article > div > div.elementor-post__excerpt > p')
            ?.textContent,
        event,
      );

      if (title && eventLink)
        events.push(
          `*${title}*\n${description || ''}\n\nلینک خبر:${eventLink}`,
        );
    }

    await browser.close();

    return events;
  }

  async crawlingQomCcimaAnnouncements() {
    const currentURL = 'https://qomccima.ir/announcements/';

    await this.checkUrlHealth(currentURL);
    const { browser, page } = await this.initPuppeteer(currentURL);

    const eventsHandles = await page.$$(
      'body > main > div > section.elementor-element-afebd4b > div > div > div > section > div > div.elementor-element-370d5de > div > div > div > div.elementor-posts-container > article',
    );

    const events = [];
    for (const event of eventsHandles) {
      const eventLink = await page.evaluate(
        (el) =>
          el
            .querySelector('article > div > div > h3 > a')
            ?.getAttribute('href'),
        event,
      );

      const title = await page.evaluate(
        (el) => el.querySelector('article > div > div > h3 > a')?.textContent,
        event,
      );

      if (title && eventLink)
        events.push(`*${title}*\n\nلینک خبر:${eventLink}`);
    }

    await browser.close();

    return events;
  }

  async crawlingJDQomNews() {
    const currentURL = 'https://jd-qom.ac.ir/fa/news';

    await this.checkUrlHealth(currentURL);
    const { browser, page } = await this.initPuppeteer(currentURL);

    let isButtonDisabled;

    const news = [];
    while (!isButtonDisabled && news.length < 20) {
      const newsHandles = await page.$$(
        'div.container.main-content > div > div > div.news-index.list-view > div > div > div',
      );

      for (const newsHandel of newsHandles) {
        const title = await page.evaluate(
          (el) => el.querySelector('div > article > div > h3')?.textContent,
          newsHandel,
        );

        const description = await page.evaluate(
          (el) => el.querySelector('div > article > div > p')?.textContent,
          newsHandel,
        );

        const newsLink = await page.evaluate(
          (el) =>
            el
              .querySelector('div > article > div > h3 > a')
              ?.getAttribute('href'),
          newsHandel,
        );
        if (title && newsLink)
          news.push(
            `*${title}*\n${description ? description + '\n\n' : '\n'}لینک خبر:${newsLink}`,
          );
      }

      isButtonDisabled =
        (await page.$(
          'div.container.main-content > div > div > div.news-index.list-view > div > ul',
        )) === null;

      if (!isButtonDisabled && news.length < 20) {
        await page.click(
          'div.container.main-content > div > div > div.news-index.list-view > div > ul > li.next > a',
        );
        await page.waitForSelector(
          'div.container.main-content > div > div > div.news-index.list-view > div > div > div:nth-child(1)',
        );
      }
    }

    await browser.close();

    return news;
  }

  private async checkUrlHealth(url) {
    const resp = await fetch(url);
    if (resp.status > 399) {
      console.log(
        `Error in fetch with status code: ${resp.status} , on page ${url}`,
      );
      return;
    }

    const contentType = resp.headers.get('content-Type');
    if (!contentType.includes('text/html')) {
      console.log(
        `non html response, content type: ${contentType} , on page ${url}`,
      );
      return;
    }
  }

  private async initPuppeteer(url) {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'load', timeout: 0 });

    return { browser, page };
  }
}
