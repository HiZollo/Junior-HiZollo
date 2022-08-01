import { EmbedBuilder } from "discord.js"

Object.defineProperties(EmbedBuilder.prototype, {
  setHiZolloColor: {
    value: function(this: EmbedBuilder) {
      return this.setColor(0x94B4FA);
    }
  }
});