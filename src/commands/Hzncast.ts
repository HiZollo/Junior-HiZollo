import { ApplicationCommandOptionType, Message } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Hzncast extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Developer, 
      name: 'hzncast', 
      description: '對 HiZollo Network 某個特定的埠號廣播訊息', 
      aliases: ['cast'], 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '埠號',
        description: '已開放的埠號',
        required: true,
        choices: [
          { name: '1', value: '1' },
          { name: '8', value: '8' },
          { name: '9', value: '9' },
          { name: '27', value: '27' }
        ]
      }]
    });
  }

  public async execute(source: Source, [portNo]: [string]): Promise<void> {
    await source.defer();

    const reply = await source.update('請輸入你的訊息（限時 60 秒）：');

    const messages = await source.channel.awaitMessages({ 
      filter: m => m.author.id === source.user.id, 
      max: 1, 
      time: 60e3
    }).catch(() => {});

    if (!messages || !messages.size) {
      await reply.edit('你打字怎麼那麼慢啊，我不想再等下去了，下次先把你要傳的訊息打好好嗎？');
      return;
    }

    const message = messages.first() as Message;
    const content = message.cleanContent
      .replace(/@everyone/g, `@\u200beveryone`)
      .replace(/@here/g, `@\u200bhere`);
    
    const attachments: ({ attachment: string, name: string })[] = [];
    let totalSize = 0;
    message.attachments.each(a => {
      attachments.push({
        attachment: a.url,
        name: a.spoiler ? `SPOILER_${a.name ?? 'attachment'}` : a.name ?? 'attachment'
      });
      totalSize += a.size;
    });
    
    if (!content && !attachments.length) {
      await reply.edit('你的訊息需要有內容或檔案，什麼都沒有我是要傳給誰看？');
      return;
    }

    if (totalSize > 512 * 1024) {
      await reply.edit('你給的檔案也太大了吧，我不想浪費效能傳這些檔案');
      return;
    }

    await reply.edit('正在傳送你的訊息……');
    await source.client.network.crosspost(portNo, {
      avatarURL: source.client.user?.displayAvatarURL(),
      content: content,
      files: attachments, 
      username: '[ HiZollo 全頻廣播 ]',
    }, true);
    await reply.edit('你的訊息已成功傳送');
  }
}