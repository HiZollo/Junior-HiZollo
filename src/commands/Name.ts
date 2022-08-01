import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import randomElement from "../features/utils/randomElement";
import { CommandType } from "../utils/enums";

export default class Name extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Information, 
      name: 'name', 
      description: 'HiZollo 叫什麼名字呢？真是個好問題呢'
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    await source.update(randomElement(this.names));
  }

  private names = [
    '我叫 Junior HiZollo，你呢？',
    '我的名字是 Junior HiZollo，很高興認識你！',
    'Junior HiZollo',
    '就是 Junior HiZollo 喔，有看到我的名字嗎？',
    '我叫 Junior HiZollo 啦',
    '你好，我是 Junior HiZollo',
    'My name is Junior HiZollo.',
    '吾乃揪你耳 ‧ 還揍羅是也',
    'Junior HiZollo，一個機器人',
    '我是 Junior HiZollo'
  ];
}