import { Message, MessageOptions } from "discord.js";
import randomElement from "../features/utils/randomElement";
import randomInt from "../features/utils/randomInt";


export abstract class HiddenCommand {
  public name: string;
  public abstract filter(message: Message): boolean;
  public abstract execute(message: Message): boolean;

  constructor(name: string) {
    this.name = name;
  }

  protected epicResponse(message: Message, notEpic: (string | MessageOptions)[], epic: (string | MessageOptions)[]): boolean {
    message.channel.send(
      randomInt(1, 1000) <= 2 ? 
        randomElement(epic) :
        randomElement(notEpic)
    );
    return true;
  }

  protected randomResponse(message: Message, ...responses: ((string | MessageOptions)[] | null)[]): boolean {
    return this.alwaysResponse(message, null, ...responses);
  }

  protected alwaysResponse(message: Message, ...responses: ((string | MessageOptions)[] | null)[]): boolean {
    const random = Math.random();
    const mappedRandom = random / (11 - 10 * random);
    const index = Math.trunc(mappedRandom * responses.length);

    const group = responses[index];
    if (!group) return false;
    
    let response = randomElement(group);
    if (typeof response === 'string') {
      response = response.replaceAll('%u', message.author.toString());
    }
    else {
      response.content = response.content?.replaceAll('%u', message.author.toString());
    }
    message.channel.send(response);
    
    return true;
  }
}