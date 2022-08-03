import { GuildMember } from "discord.js"

Object.defineProperties(GuildMember.prototype, {
  tag: {
    get: function(this: GuildMember) {
      return `${this.displayName}#${this.user.discriminator}`;
    }
  }
});