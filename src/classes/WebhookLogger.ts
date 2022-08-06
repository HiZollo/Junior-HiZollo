import { EmbedBuilder, Guild, TextChannel, User, WebhookClient } from "discord.js";
import config from "../config";
import constant from "../constant.json";
import { HZClient } from "./HZClient";
import { Source } from "./Source";


export class WebhookLogger {
  public client: HZClient;

  public mainLogger: WebhookClient;
  public networkLogger: WebhookClient;
  public errorLogger: WebhookClient;

  constructor(client: HZClient) {
    this.client = client;

    this.mainLogger = new WebhookClient({ id: config.webhooks.main.id, token: config.webhooks.main.token });
    this.networkLogger = new WebhookClient({ id: config.webhooks.network.id, token: config.webhooks.network.token });
    this.errorLogger = new WebhookClient({ id: config.webhooks.error.id, token: config.webhooks.error.token });
  }

  public ready(): void {
    const description = 
`成功登入 ${this.client.user?.tag}
版本：${constant.bot.version}
本分支目前服務 ${this.client.guilds.cache.size} 個伺服器`;

    this.send('Log', description, this.client.devMode ? 0xD70000 : 0xFF7D7D);
  }

  public joinGuild(guild: Guild):void {
    const description = 
`加入伺服器：${guild.name}
ID：${guild.id}
目前服務 ${guild.memberCount} 個伺服器`;

    this.send('Log', description, 0x7DFF7D);
  }

  public leaveGuild(guild: Guild):void {
    const description = 
`離開伺服器：${guild.name}
ID：${guild.id}
目前服務 ${guild.memberCount} 個伺服器`;

    this.send('Log', description, 0x00D700);
  }

  public error(error: Error): void {
    const elines = error.stack?.split('\n');
    const ename = elines?.shift() ?? 'No Error Name Specified.';
    const estacks = elines?.map(eline => `\`${eline.trim()}\``) ?? [];
  
    const log = new EmbedBuilder()
      .setAuthor({ name: `Error - ${Date.now()}`, iconURL: this.client.user?.displayAvatarURL() })
      .setColor(0x000000)
      .setDescription(`**${ename}**`);
    this.mainLogger.send({ embeds: [log] });
  
    log.setDescription(`**${ename}**\n${estacks.join('\n')}`)
      .setFooter({ text: `分支編號：${this.client.shard?.ids[0]}` });
    this.errorLogger.send({ embeds: [log] });
  
    console.log(error);
  }

  public commandExecuted(source: Source, commandName: [string, string | undefined], ...args: unknown[]): void {
    const description = 
`${source.isChatInput() ? `斜線指令：\`/` : `訊息指令：\`${config.bot.prefix}`}${commandName[0]}${commandName[1] ? ` ${commandName[1]}` : ``}\`
執行者：${source.user}
參數：${args.join(' ')}
伺服器：${source.guild.id}`;

    this.send('Log', description, source.isChatInput() ? 0x7DFFFF : 0x7D7DFF);
  }



  public networkCrossPost(portNo: string, guild: Guild, author: User): void {
    const description = 
`在 ${portNo} 號埠上發布訊息
伺服器：${guild.id}
使用者：${author.tag}（${author.id}）`;

    this.send('Network Log', description, 0x7D7DFF);
  }

  public networkJoined(portNo: string, channel: TextChannel): void {
    const description = 
`在 ${portNo} 號埠上建立連線
伺服器：${channel.guild.id}
頻道：${channel.id}`;

    this.send('Network Log', description, 0x7DFF7D);
  }

  public networkLeft(portNo: string, channel: TextChannel): void {
    const description = 
`在 ${portNo} 號埠上刪除連線
伺服器：${channel.guild.id}
頻道：${channel.id}`;

    this.send('Network Log', description, 0xFF7D7D);
  }

  public networkBroadcast(portNo: string, content: string): void {
    const description = 
`在 ${portNo} 號埠上全頻廣播
廣播內容：${content}`;
    
    this.send('Network Log', description, 0xFFFF7D);
  }

  private baseEmbed(title: string): EmbedBuilder {
    return new EmbedBuilder()
      .setAuthor({ name: `${title} - ${Date.now()}`, iconURL: this.client.user?.displayAvatarURL() })
      .setFooter({ text: `分支編號：${this.client.shard?.ids[0]}` });
  }

  private send(target: 'Log' | 'Network Log' | 'Error Log', description: string, color: number): void {
    const logger = 
      target === 'Log' ? this.mainLogger :
      target === 'Network Log' ? this.networkLogger :
      this.errorLogger;
    logger.send({ embeds: [this.baseEmbed(target).setColor(color).setDescription(description)] });
    console.log(description);
  }
}