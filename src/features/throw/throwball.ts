import { Client, GuildMember } from "discord.js";
import { ThrowBallType } from "../../utils/types";
import randomElement from "../utils/randomElement";
import randomInt from "../utils/randomInt";
import removeMd from "../utils/removeMd";
import baseball from "./baseball";
import bowling from "./bowling";
import chocolate from "./chocolate";
import pingpong from "./pingpong";

const angryTimespan = 60e3;

const responses = Object.freeze({
  '乒乓球': pingpong,
  '巧克力球': chocolate,
  '棒球': baseball,
  '保齡球': bowling
});

export default function throwball(client: Client, pitcher: GuildMember, target: GuildMember, ballType: ThrowBallType): string {
  let result: string;
  const array = responses[ballType];
  if (target.id === client.user?.id) {
    if (randomInt(1, 5) === 1) {
      result = '你為什麼要丟我 QQ，不跟你好了啦';
      client.angryList.set(pitcher.id, Date.now() + angryTimespan);
      setTimeout(() => client.angryList.delete(pitcher.id), angryTimespan);
    }
    else result = randomElement(array.hz);
  }
  else if (target.id === pitcher.id)
    result = randomElement(array.self);
  else
    result = throwMessage(array);

  return result.replace(/%p/g, removeMd(pitcher.displayName))
    .replace(/%t/g, removeMd(target.displayName))
    .replace(/@p/g, pitcher.toString())
    .replace(/@t/g, target.toString());
}

function throwMessage(array: (typeof responses)[keyof typeof responses]): string {
  const ran = randomInt(1, 10);
  if (ran <= 2)
    return randomElement(array.others[0]);
  else if (ran <= 8)
    return randomElement(array.others[1]);
  else
    return randomElement(array.others[2]);
}
