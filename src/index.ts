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

import { ShardingManager } from 'discord.js';
import config from '@root/config';
const shardArgs = process.argv.slice(2);

const manager = new ShardingManager('./dist/src/app.js', {
  token: config.bot.token,
  shardArgs: shardArgs
});

manager.on('shardCreate', shard => console.log(`編號 ${shard.id} 的分支已開始運作`));

manager.spawn({ timeout: -1 }).then(() => {
  console.log('分支已全數上線');
});

// 當主程式結束時，必須確實的結束每一個 shard，不然會有很麻煩的問題
// 這些 Listener 會聆聽各種不同的結束事件，並作出清理 Shard 的動作
['SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM', 'exit'].forEach(eventName => {
  process.on(eventName, cleanShards);
});

function cleanShards() {
  try {
    console.log('開始結束所有分支');
    manager.shards.each(shard => {
      shard.kill();
      console.log(`編號 ${shard.id} 的分支已經結束`);
    })
    console.log('所有分支都確實結束');
  } catch {
    console.log('出現異常\n如果你在這條訊息前有看到「所有分支都確實結束」，就代表這條訊息是多餘的，沒有任何異常');
  }
}
