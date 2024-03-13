import { EmbedBuilder, TextBasedChannel, User } from "discord.js";
import { Command } from "../classes/Command";
import { CommandType } from "../typings/enums";
import fixedDigits from "../features/utils/fixedDigits";

interface Timer { userId: string; time: number; note: string; timerId: string; startTime: number; timeoutId: NodeJS.Timeout }
const timers: { [timerId: string]: Timer } = {};
const userTimerCounts: { [userId: string]: number } = {};

export default class Countdown extends Command<[]> {
  constructor() {
    super({
      type: CommandType.SubcommandGroup, 
      name: 'timer', 
      description: '執行倒數計時器指令'
    });
  }

  public async execute(): Promise<void> {
    throw new Error('Subcommand group is not executable.');
  }
}

/***
 * 建立計時器並在指定時間傳送提示
 * @param user 使用者
 * @param channel 目標頻道
 * @param time 延遲時間毫秒
 * @param note 註解
 * @returns 嵌入訊息
 */
export function addTimer(user: User, channel: TextBasedChannel, time: number, note: string): {} {
  const userId = user.id;
  let timerCount = userTimerCounts[userId] || 0; // 取得該使用者的計時器計數
  const timerId = `${userId}_${timerCount + 1}`; // 生成計時器唯一識別碼
  const timer = {
    userId, time, note, timerId, // 保存啟動資料
    startTime: Date.now(), // 保存啟動時間
    timeoutId: setTimeout(() => { // 時間到了執行的動作
      channel.send(`${user} 時間到了！${note ?? ''}`);
      delete timers[timerId];
    }, time)
  };
  timers[timerId] = timer; // 將計時器加入到 timers 物件中
  userTimerCounts[userId] = timerCount + 1; // 更新使用者的計時器計數
  return {
    embeds: [new EmbedBuilder()
      .setColor(0x94B4FA)
      .setAuthor({ name: `已設定計時器${timerId.split('_')[1]}`, iconURL: user.avatarURL() || user.defaultAvatarURL })
      .setDescription(`時間：${Math.floor(time / 1000 / 60 / 60)}:${fixedDigits(Math.floor(time / 1000 / 60) % 60, 2)}:${fixedDigits(Math.floor(time / 1000) % 60, 2)}${note ? '\n註解：' + note : ''}`)]
  }
}

/***
 * 取消已建立的計時器
 * @param user 使用者
 * @param id 計時器識別碼
 * @returns 文字訊息內容
 */
export function cancelTimer(user: User, id: Number): {} {
  const timerId = `${user.id}_${id}` // 計時器唯一識別碼
  if (!id) { // 取消所有計時器
    const userId = user.id;
    let count = 0;
    Object.keys(timers).forEach((key) => {
      if (key.startsWith(userId)) {
        clearTimeout(timers[key].timeoutId);
        delete timers[key];
        count++;
      }
    });
    return {
      content: (count > 0) ? `已取消${count}個計時器！` : '沒有計時器可以取消！'
    }
  } else if (timers[timerId]) { // 取消指定計時器
    clearTimeout(timers[timerId].timeoutId);
    delete timers[timerId];
    return {
      content: `**計時器${timerId.split('_')[1]}**已被取消！`
    }
  } else { // 沒有可取消的計時器
    return {
      content: `找不到**計時器${timerId.split('_')[1]}**！`
    }
  }
}

/***
 * 列出指定使用者的計時器
 * @param user 使用者
 * @returns 嵌入訊息或文字訊息內容
 */
export function listTimers(user: User) {
  const userTimers = Object.values(timers).filter((timer) => timer.userId === user.id);
  if (userTimers.length > 0) { // 列出作用中的計時器
    let timerIds = '';
    let remainings = '';
    let notes = '';
    userTimers.forEach((timer) => {
      const remainingTime = timer.time - (Date.now() - timer.startTime);
      const seconds = Math.floor(remainingTime / 1000) % 60;
      const minutes = Math.floor(remainingTime / 1000 / 60) % 60;
      const hours = Math.floor(remainingTime / 1000 / 60 / 60);
      timerIds += `${timer.timerId.split('_')[1]}\n`;
      remainings += `${hours}:${fixedDigits(minutes, 2)}:${fixedDigits(seconds, 2)}\n`;
      notes += `${timer.note || '\u200B'}\n`;
    });
    return {
      embeds: [new EmbedBuilder()
        .setColor(0x94B4FA)
        .setAuthor({ name: `${userTimers.length}個計時器`, iconURL: user.avatarURL() || user.defaultAvatarURL })
        .addFields(
          { name: '編號', value: timerIds, inline: true },
          { name: '剩餘時間', value: remainings, inline: true },
          { name: '註解', value: notes, inline: true },
        )]
    }
  } else { // 不存在作用中的計時器
    return {
      content: '您目前沒有任何計時器！'
    }
  }
}