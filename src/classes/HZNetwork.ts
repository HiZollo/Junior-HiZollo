import { Channel, ChannelType, GuildMFALevel, PermissionFlagsBits, TextChannel, Webhook } from "discord.js";
import { EventEmitter } from "events";
import { HZClient } from "./HZClient";
import config from "../config";

export class HZNetwork extends EventEmitter {
  public client: HZClient;

  private hookPrefix: string;
  private portPrefix: string;
  private ports: Map<string, Map<string, Webhook>>;
  private loaded: boolean;

  constructor(client: HZClient) {
    super();

    this.client = client;
    this.hookPrefix = config.bot.network.namePrefix;
    this.portPrefix = config.bot.network.portPrefix;
    this.ports = new Map();
    this.loaded = false;
  }

  public async load(): Promise<void> {
    if (this.client.devMode) return;
    if (this.loaded) throw new Error('HiZollo Network has already been loaded');

    for (const portNo of this.registeredPorts) {
      this.ports.set(portNo, new Map());
    }
  
    const promises = this.client.channels.cache
      .filter((channel): channel is TextChannel => {
        if (channel.type !== ChannelType.GuildText) return false;
        if (!channel.name.startsWith(this.portPrefix)) return false;
        return this.registeredPorts.has(channel.name.slice(config.bot.network.portPrefix.length));
      })
      .map(async channel => {
        if (!(channel.guild.members.me?.permissions.has(PermissionFlagsBits.ManageWebhooks) && channel.guild.mfaLevel === GuildMFALevel.None)) return;

        const portNo = this.getPortNo(channel);
        if (!portNo) return;

        const webhooks = await channel.guild.fetchWebhooks().catch(() => {});
        if (!webhooks) return;

        const hznHooks = webhooks.filter(hook => hook.name === this.webhookFormat(portNo));
        if (!hznHooks.size) {
          await this.createWebhook(portNo, channel);
        }
        else {
          const port = this.ports.get(portNo) as Map<string, Webhook>;
          const hook = hznHooks.first() as Webhook;
          if (!port.has(channel.id)) port.set(channel.id, hook);
        }
      });
    await Promise.all(promises);
    
    this.loaded = true;
    this.emit('loaded');
  }


  private async createWebhook(portNo: string, channel: TextChannel): Promise<Webhook> {
    const hook = await channel.createWebhook({
      name: this.webhookFormat(portNo), 
      avatar: this.client.user?.displayAvatarURL(),
      reason: '建立 HiZollo 聯絡網'
    });
    this.ports.get(portNo)?.set(channel.id, hook);
    return hook;
  }

  private getPortNo(channel: Channel): string | void {
    if (channel.type !== ChannelType.GuildText) return;
    if (!channel.name.startsWith(this.portPrefix)) return;
    if (!this.registeredPorts.has(channel.name.slice(this.portPrefix.length))) return;
    return channel.name.slice(this.portPrefix.length);
  }

  private webhookFormat(portNo: string) {
    return `${this.hookPrefix}_NETWORK_PORT_${portNo}`;
  }


}