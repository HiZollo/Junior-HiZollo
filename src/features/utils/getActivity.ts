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

import { Client } from 'discord.js';
import config from '@root/config';
import { websiteLinks } from '../../constant.json';
import randomElement from './randomElement';

/**
 * 取得機器人的隨機動態
 * @param client 機器人的 client
 * @returns 隨機動態
 */
export default async function getActivity(client: Client): Promise<string> {
  const guildCounts = await client.shard?.fetchClientValues('guilds.cache.size').catch(() => {}) as (number[] | undefined);
  if (guildCounts) {
    const guildCount = guildCounts.reduce((acc, guildsize) => acc + guildsize, 0);
    activities.push(`在 ${guildCount} 個伺服器中提供服務`);
  }
  const activity = randomElement(activities);
  if (guildCounts) activities.pop();

  return activity;
}

/**
 * 伺服器數量以外的所有可能動態
 */
const activities = [
  websiteLinks.main,
  websiteLinks.main,
  'https://diepio.fandom.com/zh',
  'https://diepio.fandom.com/zh',
  '你好，我是 Junior HiZollo',
  'diep.io',
  'diep.io',
  'music',
  'osu!',
  'Sparebeat',
  'discord.js',
  '@everyone',
  '沒有玩遊戲',
  '不知名的神奇遊戲',
  `${config.bot.prefix}help`,
  `/help`,
  `試試看 ${config.bot.prefix}help`,
  `試試看 /help`,
  `Junior HiZollo 在此｜使用 ${config.bot.prefix}help`,
  `Junior HiZollo 在此｜使用 /help`,
  `最新更新！請參見 ${config.bot.prefix}ann`,
  `最新更新！請參見 /announcement`
];