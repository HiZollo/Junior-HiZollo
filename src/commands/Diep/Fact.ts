import { Command } from "../../classes/Command";
import { Source } from "../../classes/Source";
import randomElement from "../../features/utils/randomElement";
import { facts } from "../../features/json/diepFacts.json";
import { CommandType } from "../../utils/enums";

export default class DiepFact extends Command<[]> {
  constructor() {
    super({
      type: CommandType.Fun, 
      parent: 'diep', 
      name: 'fact', 
      description: '獲得一個 Diep.io 的小知識'
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    await source.update(randomElement(facts));
  }
}