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

import { GuildMember } from "discord.js"

Object.defineProperties(GuildMember.prototype, {
  tag: {
    get: function(this: GuildMember) {
      return typeof this.displayName === 'string'
        ? this.user.discriminator === '0' || this.user.discriminator === null
          ? this.displayName
          : `${this.displayName}#${this.user.discriminator}`
        : null;
    }
  }
});
