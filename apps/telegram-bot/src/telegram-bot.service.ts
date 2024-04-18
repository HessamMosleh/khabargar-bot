import { Inject, Injectable } from '@nestjs/common';
import { Context, Markup, Telegraf } from 'telegraf';
import * as process from 'process';
import { ClientProxy } from '@nestjs/microservices';
import { CRAWLER_SERVICE } from './constants/service';

@Injectable()
export class TelegramBotService {
  constructor(@Inject(CRAWLER_SERVICE) private crawlerClient: ClientProxy) {
    this.initBot();
  }
  initBot = async () => {
    const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    bot.start((ctx) =>
      ctx.reply(
        'سلام دوست من لطفا سایت خبری مورد نظر خودتو انتخاب کن',
        this.initNewsWebsitesKeyboard(bot),
      ),
    );
    bot.help((ctx) => ctx.reply('Send me a sticker'));

    await bot.launch();

    // Enable graceful stop
    // process.once('SIGINT', () => bot.stop('SIGINT'));
    // process.once('SIGTERM', () => bot.stop('SIGTERM'));
  };

  initNewsWebsitesKeyboard(bot: Telegraf<Context>): any {
    const keyboard = Markup.keyboard([
      ['🔍 دانشگاه قم'], // Row1 with 2 buttons
      ['ایوند'], // Row2 with 2 buttons
    ])
      .oneTime()
      .resize();

    this.handleQomUniSection(bot);
    this.handleEvandSiteSection(bot);
    return keyboard;
  }

  private handleQomUniSection(bot: Telegraf<Context>) {
    bot.hears('🔍 دانشگاه قم', (ctx) =>
      ctx.reply(
        'لطفا یک گزینه را انتخاب کنید',
        Markup.inlineKeyboard([
          Markup.button.callback('اخبار', 'qom_news'),
          Markup.button.callback('رویداد ها', 'qom_events'),
        ]),
      ),
    );

    bot.action('qom_news', (ctx) =>
      ctx.editMessageText(
        'چند خبر برگرداند',
        Markup.inlineKeyboard([
          Markup.button.callback('10', 'qom_count_10'),
          Markup.button.callback('15', 'qom_count_15'),
          Markup.button.callback('20', 'qom_count_20'),
          Markup.button.callback('30', 'qom_count_30'),
        ]),
      ),
    );

    bot.action('qom_events', async (ctx) => {
      await ctx.editMessageText('در حال استخراج لطفا یک دقیقه صبر کنید');
      this.crawlerClient.send('qom-events', {}).subscribe(async (events) => {
        if (!events.at(1))
          await ctx.editMessageText(
            'سایت با مشکل مواجه شده است لطفا دباره تلاش کنید',
          );
        else
          for (const newEl of events)
            await ctx.reply(newEl, { parse_mode: 'Markdown' });
      });
    });

    bot.action(/^qom_count_\d+$/, async (ctx) => {
      await ctx.editMessageText('در حال استخراج لطفا یک دقیقه صبر کنید');
      this.crawlerClient
        .send('qom-news', {
          count: Number(ctx.match[0].split('_')[2]),
        })
        .subscribe(async (news) => {
          if (!news.at(1))
            await ctx.editMessageText(
              'سایت با مشکل مواجه شده است لطفا دباره تلاش کنید',
            );
          else
            for (const newEl of news)
              await ctx.reply(newEl, { parse_mode: 'Markdown' });
        });
    });
  }

  private handleEvandSiteSection(bot: Telegraf<Context>) {
    bot.hears('ایوند', async (ctx) => {
      const message = await ctx.reply('در حال استخراج لطفا یک دقیقه صبر کنید');
      this.crawlerClient.send('evand', {}).subscribe(async (events) => {
        await ctx.deleteMessage(message.message_id);
        if (!events.at(1))
          await ctx.reply('سایت با مشکل مواجه شده است لطفا دباره تلاش کنید');
        else
          for (const newEl of events)
            await ctx.reply(newEl, { parse_mode: 'Markdown' });
      });
    });
  }
}
