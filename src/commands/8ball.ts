import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import randomElement from "../features/utils/randomElement";
import { ArgumentParseType, CommandType } from "../utils/enums";

export default class EBall extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Fun, 
      name: '8ball', 
      description: '當你對人生感到迷茫時，或許可以來問問 HiZollo 的神奇 8 號球……', 
      options: [{ 
        type: ApplicationCommandOptionType.String, 
        name: '問題', 
        description: '你要向 HiZollo 的神奇 8 號球請示的問題', 
        required: true
      }], 
      argumentParseMethod: {
        type: ArgumentParseType.None
      }
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    await source.update(`${source.user}，${randomElement(this.answers)}`);
  }

  private answers = [
    '當然', '理論上是', '嗯', '是', '對', '我覺得是', 'I agree', // 完全肯定
    '有可能', '也許吧', '或許吧', 'perhaps', '應該對吧，我不清楚', '我猜是吧', '如果是呢？', '應該吧，如果不是呢？', // 一半肯定
    '我不知道', '不要問我，我不知道', '或是焉，或否焉', '呃 這不好回答', 'hmm......', '你覺得呢', '你再想想看', '請等等再問一次', // 中立
    '你可以問看看隔壁棚的 \`\/coin\`', '這個答案是機密，所以我不能告訴你', '這個問題需要留給後世解答', '這需要用一生來證明', '我看起來像神奇海螺嗎', // 幹話
    '比起問個隨機的唬爛答案，你可能可以自己先想想看', '我其實不太知道，你可以問問 siri，他是我學姐', '無論是或不是，皆有它的意義，我就說到這，你自己想看看？', // 幹話
    '不太可能吧', '也許不是', '或許不是', 'maybe not?', '應該不是吧', '我猜不', '如果不是呢？', '應該不是吧，如果是呢？', // 一半否定
    '當然不是', '理論上不是', '不', '否', '最好不要', '我不覺得', 'I don\'t think so' // 完全否定
  ];
}