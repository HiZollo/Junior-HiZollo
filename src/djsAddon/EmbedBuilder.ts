import { EmbedBuilder, GuildMember, User } from "discord.js"
import config from "../config";
import randomElement from "../features/utils/randomElement";

Object.defineProperties(EmbedBuilder.prototype, {
  applyHiZolloSettings: {
    value: function(this: EmbedBuilder, member: GuildMember, authorText: string, footerText?: string): EmbedBuilder {
      return this
        .setHiZolloColor()
        .setUserAuthor(member.client.user, authorText)
        .setMemberFooter(member, footerText);
    }
  }, 

  setHiZolloColor: {
    value: function(this: EmbedBuilder): EmbedBuilder {
      return this.setColor(0x94B4FA);
    }
  }, 

  setMemberAuthor: {
    value: function(this: EmbedBuilder, member: GuildMember, authorText: string): EmbedBuilder {
      return this.setAuthor({ name: authorText, iconURL: member.displayAvatarURL() });
    }
  }, 

  setMemberFooter: {
    value: function(this: EmbedBuilder, member: GuildMember, footerText?: string): EmbedBuilder {
      return this.setFooter({ text: `${member.tag}．${footerText ?? randomFooter()}`, iconURL: member.displayAvatarURL() })
    }
  }, 

  setUserAuthor: {
    value: function(this: EmbedBuilder, user: User | null, authorText: string): EmbedBuilder {
      return this.setAuthor({ name: authorText, iconURL: user?.displayAvatarURL() });
    }
  }, 

  setUserFooter: {
    value: function(this: EmbedBuilder, user: User | null, footerText?: string): EmbedBuilder {
      return this.setFooter({ text: (user?.tag ? `${user.tag}．` : '') + (footerText ?? randomFooter()), iconURL: user?.displayAvatarURL() })
    }
  }
});

function randomFooter(): string {
  const prefix = [config.bot.prefix, '/'][Date.now() & 1];
  return randomElement(footers).replaceAll('<>', prefix);
};

const footers = [
  `不知道指令的用法？請使用 <>help 查看`, 
  `想得知第一手更新資訊，你可以使用 <>ann`, 
  `指令沒有回應？你可以使用 <>bug 向我們回報`, 
  `有任何建議都歡迎使用 <>suggest 告訴我們！`, 
  `你可以使用 <>links 查看 HiZollo 的相關連結`
];