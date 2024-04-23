import { Inject, Injectable, Logger } from '@nestjs/common';
import { Context, Markup, Telegraf } from 'telegraf';
import * as process from 'process';
import { ClientProxy } from '@nestjs/microservices';
import { CRAWLER_SERVICE } from './constants/service';
import { catchError, of, timeout } from 'rxjs';

@Injectable()
export class TelegramBotService {
  private readonly logger = new Logger(TelegramBotService.name);
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
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  };

  initNewsWebsitesKeyboard(bot: Telegraf<Context>): any {
    const keyboard = Markup.keyboard([
      ['🔍 دانشگاه قم', 'دانشگاه فارابی'], // Row1 with 2 buttons
      ['ایوند', 'اتاق بازرگانی قم'], // Row2 with 2 buttons
      ['پارک علم و فناوری قم', 'جهاد دانشگاهیی قم'],
    ])
      .oneTime()
      .resize();

    this.handleQomUniSection(bot);
    this.handleFarabiUniSection(bot);
    this.handleQomCcimaSection(bot);
    this.handlePlainSites(bot, 'ایوند', 'evand');
    this.handlePlainSites(bot, 'پارک علم و فناوری قم', 'qom-stp');
    this.handlePlainSites(bot, 'جهاد دانشگاهیی قم', 'jd-qom');
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

    bot.action(
      'qom_events',
      async (ctx) =>
        await this.handleSendingSitesResponses('qom-events', ctx, true),
    );
    bot.action(/^qom_count_\d+$/, async (ctx) => {
      await ctx.editMessageText('در حال استخراج لطفا یک دقیقه صبر کنید');
      this.crawlerClient
        .send('qom-news', {
          count: Number(ctx.match[0].split('_')[2]),
        })
        .pipe(
          timeout(60000),
          catchError((val) => of(`I caught: ${val}`)),
        )
        .subscribe(async (news) => {
          if (!Array.isArray(news))
            await ctx.editMessageText(
              'سایت با مشکل مواجه شده است لطفا دباره تلاش کنید',
            );
          else
            for (const newEl of news)
              await ctx.reply(newEl, { parse_mode: 'Markdown' });
        });
    });
  }

  private handleFarabiUniSection(bot: Telegraf<Context>) {
    bot.hears('دانشگاه فارابی', (ctx) =>
      ctx.reply(
        'لطفا یک گزینه را انتخاب کنید',
        Markup.inlineKeyboard([
          Markup.button.callback('اخبار', 'farabi_news'),
          Markup.button.callback('رویداد ها', 'farabi_events'),
        ]),
      ),
    );

    bot.action(
      'farabi_news',
      async (ctx) =>
        await this.handleSendingSitesResponses('farabi-news', ctx, true),
    );

    bot.action(
      'farabi_events',
      async (ctx) =>
        await this.handleSendingSitesResponses('farabi-events', ctx, true),
    );
  }

  private handleQomCcimaSection(bot: Telegraf<Context>) {
    bot.hears('اتاق بازرگانی قم', (ctx) =>
      ctx.reply(
        'لطفا یک گزینه را انتخاب کنید',
        Markup.inlineKeyboard([
          Markup.button.callback('اخبار', 'ccima_news'),
          Markup.button.callback('اطلاعیه ها', 'ccima_announcements'),
        ]),
      ),
    );

    bot.action(
      'ccima_news',
      async (ctx) =>
        await this.handleSendingSitesResponses('ccima-news', ctx, true),
    );

    bot.action(
      'ccima_announcements',
      async (ctx) =>
        await this.handleSendingSitesResponses(
          'ccima-announcements',
          ctx,
          true,
        ),
    );
  }

  private handlePlainSites(
    bot: Telegraf<Context>,
    botHears: string,
    brokerEvent: string,
  ) {
    bot.hears(
      botHears,
      async (ctx) => await this.handleSendingSitesResponses(brokerEvent, ctx),
    );
  }

  private async handleSendingSitesResponses(
    brokerEvent: string,
    ctx,
    isEditMessage = false,
  ) {
    const message = isEditMessage
      ? await ctx.editMessageText('در حال استخراج لطفا یک دقیقه صبر کنید')
      : await ctx.reply('در حال استخراج لطفا یک دقیقه صبر کنید');
    this.crawlerClient
      .send(brokerEvent, {})
      .pipe(
        timeout(60000),
        catchError((val) => of(`I caught: ${val}`)),
      )
      .subscribe(async (events) => {
        await ctx.deleteMessage(message.message_id);
        if (!Array.isArray(events)) {
          this.logger.error(events);
          await ctx.reply('سایت با مشکل مواجه شده است لطفا دباره تلاش کنید');
        } else
          for (const newEl of events)
            if (typeof newEl !== 'string')
              await ctx.replyWithPhoto(
                { url: newEl.picUrl },
                { caption: newEl.description },
              );
            else await ctx.reply(newEl, { parse_mode: 'Markdown' });
      });
  }
}
