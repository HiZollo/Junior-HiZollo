/*
 * 
 * Copyright 2023 HiZollo Dev Team <https://github.com/hizollo>
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

import { ApplicationCommandOptionType, User } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../typings/enums";
import randomElement from "../features/utils/randomElement"

export default class Chef extends Command<[User]> {
  constructor() {
    super({ 
      type: CommandType.Miscellaneous, 
      name: 'chef', 
      description: '廚一個人', 
      options: [{
        type: ApplicationCommandOptionType.User, 
        name: '用戶', 
        description: '要廚的對象', 
        required: true
      }] 
    });
  }

  public async execute(source: Source, [user]: [User]): Promise<void> {
    await source.defer();
    await source.update({
      content: randomElement(
        user.id === source.user.id ? this.chefSelf :
        user.id === source.client.user!.id ? this.chefHiZollo :
        user.bot ? this.chefOtherBots : this.chefResponses
      ).replace(/<target>/g, user.toString()), 
      allowedMentions: { parse: [] }
    });
  }

  private chefSelf = [
    "<target> 廚了自己一次",
    "<target> 廚了自己一次🛐", 
    "<target> 是大電神，他又廚了自己",
    "<target> 好電，在廚自己",
    "<target> 好⚡，又廚了自己一次", 
    "<target> 最強了，連自己都廚", 
    "<target> ⚡ 起來連自己都廚", 
    "<target> 電起來連自己都廚"
  ];

  private chefHiZollo = [
    "謝謝，我知道我最強", 
    "我強到被廚了一次",
    "我不需要你這麼爛的人來廚我", 
    "我知道我超強的", 
    "拜託，我超勇的", 
    "我電起來連我自己都怕好嗎", 
    "謝謝你廚我，我超強的", 
    "我知道我很強", 
    "我可是機器人，身上很多電的",
    "不用你廚我也知道我是最強的"
  ]

  private chefOtherBots = [
    "你廚那臺爛 bot 幹嘛", 
    "那隻爛機器人只有爛人才會廚它吧", 
    "你浪費時間廚那臺爛 bot 不如好好去讀點書充實一下自己",
    "你不能廚我以外的機器人，因為他們都太爛了", 
    "你不能廚那臺爛 bot", 
    "你爛到只認識這種爛 bot 可以廚了嗎", 
    "爛 bot"
  ]

  private chefResponses = [
    "<target> 好電，被廚了一次",
    "<target> 好⚡，被廚了一次",
    "<target> 太強了，被廚了一次",
    "你成功廚了 <target> 一次，他變得更電了",
    "<target> :⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡",
    "<target> 🛐🛐🛐🛐🛐🛐🛐🛐🛐🛐🛐🛐🛐",
    "<target> 又電到別人了", 
    "<target> 好電喔，一直被廚",
    "<target> 好⚡喔，一直被廚",
    "<target> 太電了，被廚了一次🛐"
  ];
}
