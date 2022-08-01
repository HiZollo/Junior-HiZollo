import { Command } from "../../classes/Command";
import { Source } from "../../classes/Source";
import tanks from "../../features/json/diepTanks.json";
import { CommandType } from "../../utils/enums";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

export default class DiepTank extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Information, 
      name: 'tank', 
      description: '查看一台 Diep.io 的坦克資訊',
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '坦克',
        description: '坦克的英文全名',
        required: true,
        autocomplete: true
      }]
    });
  }

  public async execute(source: Source, [tankName]: [string]): Promise<void> {
    const tank = this.tankMap.get(tankName);
    if (!tank) {
      await source.defer({ ephemeral: true });
      await source.update('我找不到這台坦克，請檢查你有沒有拼錯字');
      return;
    }

    await source.defer();
    const info = new EmbedBuilder()
      .setTitle(`${tank.name}（${tank.nameChinese}）的基本資料`)
      .setThumbnail(tank.image)
      .setHiZolloColor()
      .setDescription(tank.description)
      .addFields(
        { name: '坦克類型', value: tank.type, inline: true },
        { name: '階層', value: tank.tier, inline: true },
        { name: '從何升級', value: tank.upgradeFrom, inline: true },
        { name: '坦克 ID', value: tank.id, inline: true },
        { name: '使用武器', value: tank.weapons, inline: true },
        { name: '傷害係數', value: tank.damage, inline: true },
        { name: '更多資訊', value: `點擊[此處](${tank.link})以獲得更多資訊`},
      )
      .setFooter({ text: '資料來源：Diep.io 繁中維基' });

    await source.update({ embeds: [info] });
  }

  private tankMap = new Map(Object.entries(tanks));
}