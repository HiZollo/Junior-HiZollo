/*************************************************************************
******************* Project     : Junior HiZollo       *******************
******************* Author      : HiZollo Organization *******************
******************* Version     : TS rewrite           *******************
******************* Release Date: ????/??/??           *******************
*************************************************************************/

/******************* 系統變數設置 *******************/
import { EmbedBuilder, GatewayIntentBits, InteractionType } from 'discord.js';
import './djsAddon';
import config from './config';
import constant from './constant.json';
import { HZClient } from './classes/HZClient';
import { CommandManagerRejectReason, CommandParserOptionResultStatus } from './utils/enums';
const client = new HZClient({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.GuildMessageReactions, 
    GatewayIntentBits.GuildVoiceStates, 
    GatewayIntentBits.MessageContent
  ], 
  devMode: process.argv[2]?.toLowerCase() === 'dev'
});

/******************* Features *******************/
import permissionTable from './features/utils/permissionTable';
/**/

/******************* 指令載入 *******************/
client.commands.once('load', () => {
  console.log('所有指令皆已載入完畢');
});
/**/


/******************* 指令失敗 *******************/
client.commands.on('reject', async (source, info) => {
  await source.defer({ ephemeral: true });
  const helper = new EmbedBuilder().applyHiZolloSettings(source.member, 'HiZollo 的幫助中心');

  switch (info.reason) {
    case CommandManagerRejectReason.Angry:
      helper.setTitle('(ﾒﾟДﾟ)ﾒ')
        .setDescription(`你就是剛剛丟我的那個人！我才不想理你勒，你 ${~~(info.args[0] / 1000)} 秒之後再來跟我談！`);
      break;
    
    case CommandManagerRejectReason.TwoFactorRequird:
      helper.setTitle('2FA 不讓我執行這個指令')
        .setDescription(`因為這個伺服器開啟了 2FA 驗證，所以我無法執行這個指令`);
      break;
    
    case CommandManagerRejectReason.UserMissingPermission:
      helper.setTitle('你被權限之神禁錮了')
        .setDescription(`以下是你缺少的權限\n\n${info.args[0].map(perm => `- ${permissionTable[perm]}`).join('\n')}`);
      break;
    
    case CommandManagerRejectReason.BotMissingPermission:
      helper.setTitle('給我這麼點權限怎麼夠我用')
        .setDescription(`我把我要的權限都列出來了，快點給我不然我沒辦法幫你執行這個指令\n\n${info.args[0].map(perm => `- ${permissionTable[perm]}`).join('\n')}`);
      break;
    
    case CommandManagerRejectReason.InCooldown:
      helper.setTitle('你太快了')
        .setDescription(`你必須在 ${~~(info.args[0] / 1000)} 秒後才能再使用此指令。`);
      break;
    
    case CommandManagerRejectReason.InNetwork:
      helper.setTitle('這個地方不適合使用指令')
        .setDescription('在 HiZollo Network 的領域裡使用指令會發生相當嚴重的時空錯亂，你不會希望這件事發生的');
      break;
    
    case CommandManagerRejectReason.IllegalArgument:
      const [_commandOptions, { index, status }] = info.args;
      switch (status) {
        case CommandParserOptionResultStatus.Required:
          helper.setTitle('必填')
            .setDescription(`第 ${index + 1} 個參數是必填的`);
          break;
        
        case CommandParserOptionResultStatus.WrongFormat:
          helper.setTitle('格式錯誤')
            .setDescription(`第 ${index + 1} 個參數的格式錯誤`);
          break;
      
        case CommandParserOptionResultStatus.NotInChoices:
          if (!('choices' in info.args[1])) break;
          const { choices } = info.args[1];
          const choicesString = choices.map(({ name: n, value: v }) => n === v.toString() ? `\`${n}\`` : `\`${n}\`/\`${v}\``).flat().join('．');
          helper.setTitle('不在選項內')
            .setDescription('選項：\n' + choicesString);
          break;
              
        case CommandParserOptionResultStatus.ValueTooSmall:
          helper.setTitle('太小了')
            .setDescription(`第 ${index + 1} 個參數太小了`);
          break;
              
        case CommandParserOptionResultStatus.ValueTooLarge:
          helper.setTitle('太大了')
            .setDescription(`第 ${index + 1} 個參數太大了`);
          break;
        
        case CommandParserOptionResultStatus.LengthTooShort:
          helper.setTitle('太短了')
            .setDescription(`第 ${index + 1} 個參數太短了`);
          break;
      
        case CommandParserOptionResultStatus.LengthTooLong:
          helper.setTitle('太長了')
            .setDescription(`第 ${index + 1} 個參數太長了`);
          break;
      }
  }

  await source.update({ embeds: [helper] });
});
/**/

/******************* 指令無效 *******************/
client.commands.on('unavailable', async source => {
  await source.defer({ ephemeral: true });
  await source.temp('這個指令目前無法使用，這通常是因為這個指令正在更新，稍待片刻後就能正常使用了');
});
/**/

/******************* Network 載入 *******************/
client.network.on('loaded', () => {
  console.log('HiZollo Network 載入完畢');
});
/**/

/******************* Network 載入 *******************/
client.network.on('crosspost', (portNo, options) => {
  console.log(portNo, options);
});
/**/

/******************* Network 載入 *******************/
client.network.on('joined', (portNo, channel) => {
  console.log(portNo, channel.name);
});
/**/

/******************* Network 載入 *******************/
client.network.on('left', (portNo, channel) => {
  console.log(portNo, channel.name);
});
/**/

/******************* 上線確認 *******************/
client.on('ready', async () => {
  console.log('Ready');
  await client.initialize();
});
/**/

/******************* 如果出錯 *******************/
client.on('error', console.error);
client.commands.on('error', console.error);
process.on('uncaughtException', console.error);
/**/

/******************* 訊息創建 *******************/
client.on('messageCreate', async message => {
  client.commands.messageRun(message);
  client.network.onMessageCreate(message);
});
/**/

/******************* 指令互動 *******************/
client.on('interactionCreate', async interaction => {
  client.commands.interactionRun(interaction);
  /********* 篩選 *********/
  if (![InteractionType.ApplicationCommand, InteractionType.ApplicationCommandAutocomplete, InteractionType.MessageComponent].includes(interaction.type)) return;
  if (!interaction.inCachedGuild() || !interaction.channel) return;
  if (interaction.user.blocked) return;
  if (client.devMode && interaction.guild.id !== constant.mainGuild.id) return;
  /**/


  /********* 自動匹配 *********/
  if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
    let commandName = interaction.commandName;
    if (interaction.options.getSubcommand(false)) commandName += '_' + interaction.options.getSubcommand(false)

    const option = interaction.options.getFocused(true);
    const regExp = new RegExp(option.value.toLowerCase().split('').join('.*?'));

    const result = interaction.client.autocomplete.get(commandName)?.[option.name]?.filter(({ name, devOnly }) => {
      if (!regExp.test(name.toLowerCase())) return false;
      if (devOnly && interaction.guild.id !== constant.devGuild.id) return false;
      return true;
    });
    if (!result) return interaction.respond([]);

    result.sort((a, b) => {
      const aMatch = regExp.exec(a.name.toLowerCase());
      const bMatch = regExp.exec(b.name.toLowerCase());

      if (!aMatch && !bMatch) return 0;
      if (!aMatch) return 1;
      if (!bMatch) return -1;
  
      // 符合 regExp 的字串長度越長，代表越不符合
      if (aMatch[0].length > bMatch[0].length) return 1;
      if (aMatch[0].length < bMatch[0].length) return -1;
  
      // 如果都一樣長就比誰最前面
      if (aMatch.index > bMatch.index) return 1;
      if (aMatch.index < bMatch.index) return -1;
      return 0;
    });
  
    return interaction.respond(result.slice(0, 10).map(({ name: n }) => ({ name: n, value: n })));
  }

  /********* 訊息配件 *********/
  if (interaction.type === InteractionType.MessageComponent) {
    /***** 按鈕互動 *****/
    if (interaction.isButton()) {
      const [commandName] = interaction.customId.split('_');
      const action = client.buttons.get(commandName);
      action?.(interaction);
      return;
    }
    /**/

    /***** 按鈕互動 *****/
    if (interaction.isSelectMenu()) {
      const [commandName] = interaction.customId.split('_');
      const action = client.selectmenus.get(commandName);
      action?.(interaction);
      return;
    }
    /**/
    return;
  }
  /**/
});
/**/

/******************* 建立頻道 *******************/
client.on('channelCreate', channel => {
  client.network.onChannelCreate(channel);
});
/**/

/******************* 更新頻道 *******************/
client.on('channelUpdate', (oldChannel, newChannel) => {
  client.network.onChannelUpdate(oldChannel, newChannel);
});
/**/

/******************* 刪除頻道 *******************/
client.on('channelDelete', channel => {
  client.network.onChannelDelete(channel);
});
/**/

/******************* 加入伺服器 *******************/
client.on('guildCreate', guild => {
  client.network.onGuildCreate(guild);
});
/**/

/******************* 刪除伺服器 *******************/
client.on('guildDelete', guild => {
  client.network.onGuildDelete(guild);
});
/**/

/******************* 登入機器人 *******************/
client.login(config.bot.token);
/**/