/*
 * 
 * Copyright 2022 HiZollo Dev Team <https://github.com/hizollo>
 * 
 * This file is a part of Junior HiZollo.
 * 
 * Junior HiZollo is free software: you can redistribute it and/or 
 * modify it under the terms of the GNU General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Junior HiZollo is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Junior HiZollo. If not, see <https://www.gnu.org/licenses/>.
 */

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