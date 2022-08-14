import { EmbedBuilder, GuildMember, User } from "discord.js"
import config from "@root/config";
import randomInt from "../features/utils/randomInt";

Object.defineProperties(EmbedBuilder.prototype, {
  applyHiZolloSettings: {
    value: function(this: EmbedBuilder, member: GuildMember | null, authorText: string, footerText?: string): EmbedBuilder {
      return this
        .setHiZolloColor()
        .setUserAuthor(member?.client.user ?? null, authorText)
        .setMemberFooter(member, footerText);
    }
  }, 

  setHiZolloColor: {
    value: function(this: EmbedBuilder): EmbedBuilder {
      return this.setColor(0x94B4FA);
    }
  }, 

  setMemberAuthor: {
    value: function(this: EmbedBuilder, member: GuildMember | null, authorText: string): EmbedBuilder {
      return this.setAuthor({ name: authorText, iconURL: member?.displayAvatarURL() });
    }
  }, 

  setMemberFooter: {
    value: function(this: EmbedBuilder, member: GuildMember | null, footerText?: string): EmbedBuilder {
      return this.setFooter({ text: (member?.tag ? `${member.tag}．` : '') + (footerText ?? randomFooter()), iconURL: member?.displayAvatarURL() })
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

const randomFooter = getRandomFooterFunction();

function getRandomFooterFunction(): () => string {
  const footers = new Map([
    [`不知道指令的用法？請使用 <>help 查看`, 20], 
    [`想得知第一手更新資訊，你可以使用 <>ann`, 20], 
    [`指令沒有回應？你可以使用 <>bug 向我們回報`, 20], 
    [`有任何建議都歡迎使用 <>suggest 告訴我們！`, 20], 
    [`你可以使用 <>links 查看 HiZollo 的相關連結`, 20], 
    [`覺得自己很沒用嗎？試試看 <>useless！`, 1]
  ]);

  const weightSum = [...footers.values()].reduce((acc, cur) => acc + cur, 0);

  function getText(ran: number): string {
    return [...footers.entries()].find(([_text, weight]) => {
      ran -= weight;
      return ran < 0;
    })![0];
  }

  function randomFooter(): string {
    const prefix = [config.bot.prefix, '/'][Date.now() & 1];
    let random = randomInt(0, weightSum - 1);
    return getText(random).replaceAll('<>', prefix);
  }
  return randomFooter;
};