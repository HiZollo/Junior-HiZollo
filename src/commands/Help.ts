import { ApplicationCommandOptionChoiceData, ApplicationCommandOptionType, Collection, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import config from "../config";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandOptionType, CommandType } from "../utils/enums";
import { HZCommandOptionData } from "../utils/types";

export default class Help extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Information, 
      name: 'help', 
      description: '顯示 HiZollo 的指令清單或查詢指令用法', 
      options: [{ 
        type: ApplicationCommandOptionType.String, 
        name: '指令名稱', 
        description: '要查詢的特定指令', 
        required: false
      }], 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks]
      }
    });
  }

  public async execute(source: Source, [commandName]: [string]): Promise<void> {
    // 不給參數時就顯示所有指令
    if (!commandName) {
      await source.defer();
      const helper = this.getHelperForAllCommands(source);
      await source.update({ embeds: [helper] });
      return;
    }

    // 給參數就顯示特定指令
    const command = source.client.commands.search([commandName, undefined]);
    if (!command || (command instanceof Command && command.type === CommandType.Developer && !source.channel?.isTestChannel())) {
      await source.defer({ ephemeral: true });
      await source.update(`這個指令不存在，請使用 \`${config.bot.prefix}help\` 或 \`/help\` 查看當前的指令列表`);
      return;
    }

    await source.defer();
    const helper = command instanceof Command ? this.getHelperForCommand(source, command) : this.getHelperForSubcommandGroup(source, commandName, command);
    await source.update({ embeds: [helper] });
  }


  private getHelperForAllCommands(source: Source): EmbedBuilder {
    let commands: { [key in CommandType]?: Partial<Command<unknown>>[] } = {};

    // 加入一般指令
    source.client.commands.each(command => {
      if (!commands[command.type]) commands[command.type] = [];
      commands[command.type]?.push(command);
    });

    // 加入群組指令
    source.client.commands.subcommands.each((_command, groupName) => {
      if (!commands[CommandType.SubcommandGroup]) commands[CommandType.SubcommandGroup] = [];
      commands[CommandType.SubcommandGroup]?.push({ name: groupName });
    });

    // 加入開發指令
    if (!source.channel?.isTestChannel()) {
      commands[CommandType.Developer] = [];
    }

    const helper = new EmbedBuilder()
      .setAuthor({ name: 'HiZollo 的幫助中心', iconURL: source.client.user?.displayAvatarURL() })
      .setDescription(`以下是我的指令列表，你可以使用 \`${config.bot.prefix}help 指令名稱\` 或 \`/help 指令名稱\` 來查看特定指令的使用方法`)
      .setHiZolloColor()
      .setFooter({ text: `${source.user.tag}．使用指令時不須連同 [] 或 <> 一起輸入`, iconURL: source.user.displayAvatarURL() });
    for (const [key, list] of Object.entries(commands)) {
      if (!list.length) continue;
      helper.addFields({
        name: `🔹 **${this.commandTypeTable[key]}**`, 
        value: list.map(c => `\`${c.name}\``).join(', '), 
        inline: true
      });
    }

    return helper;
  }

  private getHelperForCommand(source: Source, command: Command<unknown>): EmbedBuilder {
    return new EmbedBuilder()
      .setAuthor({ name: 'HiZollo 的幫助中心', iconURL: source.client.user?.displayAvatarURL() })
      .setDescription(this.getDescriptionForCommand(command))
      .setHiZolloColor()
      .setFooter({ text: `${source.user.tag}．使用指令時不須連同 [] 或 <> 一起輸入`, iconURL: source.user.displayAvatarURL() });
  }

  private getHelperForSubcommandGroup(source: Source, groupName: string, commands: Collection<string, Command<unknown>>): EmbedBuilder {
    const helper = new EmbedBuilder()
      .setAuthor({ name: 'HiZollo 的幫助中心', iconURL: source.client.user?.displayAvatarURL() })
      .setDescription(`這是 HiZollo 的 ${groupName} 指令清單`)
      .setHiZolloColor()
      .setFooter({ text: `${source.user.tag}．使用指令時不須連同 [] 或 <> 一起輸入`, iconURL: source.user.displayAvatarURL() });

    commands.each(command => {
      let description = `** - 指令功能：**${command.description}\n` + this.getDescriptionForCommand(command, true);
      helper.addFields({ name: `${groupName} ${command.name}`, value: description });
    });
    return helper;
  }

  private getDescriptionForCommand(command: Command<unknown>, isSubcommand?: boolean): string {
    let description = !isSubcommand ? `\`${command.name}\`\n${command.description}\n` : '';
    if (!isSubcommand && command.extraDescription) description += `${command.extraDescription}\n`;
    if (!isSubcommand) description += '\n';
    if (command.aliases) description += `** - 替代名稱：**${command.aliases.map(a => `\`${a}\``).join(', ')}\n`;
    if (!isSubcommand && command.type) description += `** - 分類位置：**${this.commandTypeTable[`${command.type}`]}\n`;
    if (command.options) description += `** - 指令參數：**${this.optionsToString(command.options)}`;
    if (command.cooldown) description += `** - 冷卻時間：**${command.cooldown} 秒\n`;
    return description;
  }
  
  private optionsToString(options: HZCommandOptionData[]): string {
    let description = '';
    description += `\`${options.map(option => this.getOptionNameString(option)).join(' ')}\`\n`;
    for (const option of options) {
      description += ` \`${this.getOptionNameString(option)}\`\n`;
      description += `　- 選項說明：${option.description}\n`
      description += `　- 規範型別：${this.getOptionTypeString(option.type, option.parseAs)}\n`;
      if ('choices' in option && option.choices) {
        description += `　- 規範選項：${option.choices.map(choice => this.getChoiceString(choice)).join('．')}\n`;
      }
    }
    return description;
  }

  private getOptionNameString(option: HZCommandOptionData): string {
    const pattern = option.required ? `[${option.name}]` : `<${option.name}>`;
    if (!option.repeat) return pattern;
    return `${pattern.replace(/\%i/g, '1')} ${pattern.replace(/\%i/g, '2')} ...`
  }

  private getOptionTypeString(type: ApplicationCommandOptionType, parseAs?: CommandOptionType): string {
    if (parseAs) {
      return this.commandOptionTypeTable[parseAs];
    }
    return this.applicationCommandOptionTypeTable[type];
  }

  private getChoiceString(choice: ApplicationCommandOptionChoiceData): string {
    return choice.name === choice.value.toString() ? `\`${choice.name}\`` : `\`${choice.name}\`/\`${choice.value}\``;
  }

  private commandTypeTable = Object.freeze({
    [`${CommandType.Contact}`]: '聯繫', 
    [`${CommandType.Developer}`]: '開發者專用', 
    [`${CommandType.Fun}`]: '娛樂', 
    [`${CommandType.SinglePlayerGame}`]: '單人遊戲', 
    [`${CommandType.MultiPlayerGame}`]: '多人遊戲', 
    [`${CommandType.Information}`]: '資訊', 
    [`${CommandType.Miscellaneous}`]: '雜項', 
    [`${CommandType.Network}`]: '聯絡網', 
    [`${CommandType.SubcommandGroup}`]: '指令群', 
    [`${CommandType.Utility}`]: '功能'
  });

  private applicationCommandOptionTypeTable: { [key in ApplicationCommandOptionType]: string } = Object.freeze({
    [ApplicationCommandOptionType.Attachment]: '檔案', 
    [ApplicationCommandOptionType.Boolean]: '布林值', 
    [ApplicationCommandOptionType.Channel]: '頻道', 
    [ApplicationCommandOptionType.Integer]: '整數', 
    [ApplicationCommandOptionType.Mentionable]: '使用者或身分組', 
    [ApplicationCommandOptionType.Number]: '數字', 
    [ApplicationCommandOptionType.Role]: '身分組', 
    [ApplicationCommandOptionType.String]: '字串', 
    [ApplicationCommandOptionType.Subcommand]: '子指令', 
    [ApplicationCommandOptionType.SubcommandGroup]: '指令群', 
    [ApplicationCommandOptionType.User]: '使用者'
  });

  private commandOptionTypeTable: { [key in CommandOptionType]: string } = Object.freeze({
    [CommandOptionType.Attachment]: '檔案', 
    [CommandOptionType.Boolean]: '布林值', 
    [CommandOptionType.Channel]: '頻道', 
    [CommandOptionType.Emoji]: '表情符號', 
    [CommandOptionType.Integer]: '整數', 
    [CommandOptionType.Member]: '伺服器成員', 
    [CommandOptionType.Mentionable]: '使用者或身分組', 
    [CommandOptionType.Number]: '數字', 
    [CommandOptionType.Role]: '身分組', 
    [CommandOptionType.String]: '字串', 
    [CommandOptionType.Subcommand]: '子指令', 
    [CommandOptionType.SubcommandGroup]: '指令群', 
    [CommandOptionType.User]: '使用者'
  });
}