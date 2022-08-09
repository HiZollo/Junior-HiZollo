import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { Translator } from "../classes/Translator";
import { CommandType } from "../utils/enums";

export default class Findguild extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Developer, 
      name: 'findguild', 
      description: '獲得指定伺服器的資訊', 
      aliases: ['fg'], 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '伺服器',
        description: '伺服器的 ID',
        required: true
      }]
    });
  }

  public async execute(source: Source, [guildId]: [string]): Promise<void> {
    const results = await source.client.shard?.broadcastEval(async (client, { guildId }) => {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return;

      const { name, id, memberCount, joinedTimestamp } = guild;
      const shardId = client.shard?.ids[0];
      const owner = await guild.fetchOwner();
      const icon = guild.iconURL({ extension: 'png', size: 4096, forceStatic: false });
      const permissions = guild.members.me?.permissions.toArray();

      return {
        id: id,
        name: name,
        icon: icon,
        shardId: shardId,
        memberCount: memberCount,
        joinedAt: joinedTimestamp,
        permissions: permissions,
        ownerId: owner.user.id
      }
    }, { context: { guildId } });

    const guild = results?.find(e => e);

    if (!guild) {
      await source.defer({ ephemeral: true });
      await source.update('我找不到這個伺服器');
      return;
    }

    await source.defer();
    const info = new EmbedBuilder()
      .applyHiZolloSettings(source.member, `伺服器 ${guild.name} 的資訊`)
      .setThumbnail(guild.icon)
      .addFields(
        { name: '伺服器 ID', value: guild.id },
        { name: '分支編號', value: guild.shardId ?`${guild.shardId}` : '查無資訊' },
        { name: '成員數量', value: `${guild.memberCount}` },
        { name: 'HiZollo 加入時間', value: `<t:${~~(guild.joinedAt/1000)}>` },
        { name: 'HiZollo 擁有權限', value: guild?.permissions ? guild?.permissions.map(p => Translator.getPermissionChinese(p)).join('．') : '查無資訊' },
        { name: '擁有者', value: `<@${guild.ownerId}>` }
      );
    await source.update({ embeds: [info] });
  }
}