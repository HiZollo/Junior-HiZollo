import { ActionRowBuilder, APISelectMenuOption, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, InteractionCollector, StringSelectMenuBuilder, SelectMenuInteraction } from 'discord.js';
import { BigTwoTrick, BigTwoTrickType, BigTwo, Player } from '@hizollo/games';
import { DjsGameWrapper } from './DjsGameWrapper';
import gameString from '../../features/info/gameString';
import format from '../../features/utils/format';
import sleep from '../../features/utils/sleep';
import { BigTwoStrings, DjsBigTwoOptions, DjsInputResult } from '../../typings/game';

export class DjsBigTwo extends DjsGameWrapper {
  public strings: BigTwoStrings;

  protected game: BigTwo;
  protected inputMode: number;
  protected bundles: ({ messageId: string, menu: StringSelectMenuBuilder, buttons: ButtonBuilder[], selectedCards: number[] })[];
  protected buttonCollector: InteractionCollector<ButtonInteraction> | void;
  protected menuCollector: InteractionCollector<SelectMenuInteraction> | void;


  constructor({ players, source, time }: DjsBigTwoOptions) {
    super({ source, time });
    this.game = new BigTwo({ players });

    this.strings = gameString.bigTwo;
 
    this.inputMode = 0b00;
    this.bundles = [];
    this.buttonCollector = undefined;
    this.menuCollector = undefined;
    this.playerAction = this.playerAction.bind(this);
    this.playerSelect = this.playerSelect.bind(this);
  }

  async initialize(): Promise<void> {
    if (!this.source.channel) {
      throw new Error("The channel of the source is invalid.");
    }

    const components = [new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('HZG_CTRL_leave')
        .setLabel(this.strings.controller.leave)
        .setStyle(ButtonStyle.Danger), 
      new ButtonBuilder()
        .setCustomId('HZG_CTRL_cards')
        .setLabel(this.strings.controller.cards)
        .setStyle(ButtonStyle.Secondary)
    )];
    await super.initialize({ content: '\u200b', components });

    for (let i = 0; i < this.game.playerManager.playerCount; i++) {
      this.bundles[i] = {
        messageId: '', 
        menu: new StringSelectMenuBuilder()
          .setCustomId('HZG_PLAY_select')
          .setPlaceholder(this.strings.player.menu)
          .setMinValues(1)
          .setMaxValues(5)
          .setOptions(this.getOptions(this.game.cards[i])), 
        buttons: [
          new ButtonBuilder()
            .setCustomId('HZG_PLAY_play')
            .setLabel(this.strings.player.play)
            .setStyle(ButtonStyle.Success), 
          new ButtonBuilder()
            .setCustomId('HZG_PLAY_pass')
            .setLabel(this.strings.player.pass)
            .setStyle(ButtonStyle.Danger), 
        ], 
        selectedCards: []
      };
    }

    await this.mainMessage?.edit({ content: this.getMainContent() });
    this.buttonCollector = this.source.channel.createMessageComponentCollector({
      filter: i => this.bundles.some(({ messageId }) => i.message.id === messageId) && i.customId.startsWith("HZG_PLAY"), 
      componentType: ComponentType.Button
    });
    this.menuCollector = this.source.channel.createMessageComponentCollector({
      filter: i => this.bundles.some(({ messageId }) => i.message.id === messageId) && i.customId.startsWith("HZG_PLAY"), 
      componentType: ComponentType.SelectMenu
    });
  }

  async start(): Promise<void> {
    if (this.buttonCollector === undefined || this.menuCollector === undefined) {
      throw new Error("The game has not been initialized yet.");
    }
    this.buttonCollector.on('collect', this.playerAction);
    this.menuCollector.on('collect', this.playerSelect);
    await super.start();
    this.buttonCollector.stop();
    this.menuCollector.stop();
  }

  public async conclude(): Promise<void> {
    if (this.buttonCollector === undefined || this.menuCollector === undefined) {
      throw new Error("The game has not been initialized yet.");
    }
    await super.conclude();
  }

  getEndContent(): string {
    const message = this.strings.endMessages;
    switch (this.game.status.now) {
      case "WIN":
        return format(message.win, { player: `<@${this.winner?.id}>` });
      case "IDLE":
        return message.idle;
      case "STOPPED":
        return message.stopped;
      case "DELETED":
        return message.deleted;
      default:
        return '';
    }
  }


  protected buttonFilter(): boolean {
    return false;
  }

  protected messageFilter(): boolean {
    return false;
  }

  protected async ctrlCollected(interaction: ButtonInteraction): Promise<void> {
    super.ctrlCollected(interaction);
    
    const args = interaction.customId.split('_');
    if (args[2] === 'cards') {
      if (!interaction.channel) {
        throw new Error("The channel of the source is invalid.");
      }

      const index = this.game.playerManager.getIndex(interaction.user.id);
      const content = format(this.strings.player.cards, { cards: this.cardsToString(this.game.cards[index]) });
      const components = [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(this.bundles[index].menu), 
        new ActionRowBuilder<ButtonBuilder>().addComponents(...this.bundles[index].buttons)
      ];

      this.bundles[index].messageId = (await interaction.deferReply({ ephemeral: true, fetchReply: true })).id;
      await interaction.editReply({ content, components })
    }
  }

  protected async playerAction(interaction: ButtonInteraction): Promise<void> {
    const index = this.game.playerManager.getIndex(interaction.user.id);
    if (index < 0) return;

    const cards = this.bundles[index].selectedCards;
    const trick = this.game.cardsToTrick(cards);
    let content = format(this.strings.player.cards, { cards: this.cardsToString(this.game.cards[index]) }) + '\n'
                + (cards.length ? format(this.strings.player.selected, { cards: this.cardsToString(cards), trick: this.trickToString(trick) }) + '\n' : '');
    
    if (interaction.user.id !== this.game.playerManager.nowPlayer.id) {
      content += this.strings.player.notYourTurn;
      await interaction.update({ content });
      return;
    }

    const args = interaction.customId.split('_');
    if (args[2] === 'play') {
      if (cards.length === 0) {
        content += this.strings.player.noSelection;
        await interaction.update({ content });
        return;
      }
      if (!this.game.playable(cards)) {
        content += format(this.strings.player.invalid, { cards: this.cardsToString(cards) });
        await interaction.update({ content });
        return;
      }

      this.conveyor.emit('cardsPlayed', JSON.parse(JSON.stringify(cards)));
      this.game.playerManager.players[index].addStep();
      this.game.play(cards);

      content = format(this.strings.player.cards, { cards: this.cardsToString(this.game.cards[index]) }) + '\n'
              + format(this.strings.player.played, { cards: this.cardsToString(cards), trick: this.trickToString(this.game.cardsToTrick(cards)) });
      
      if (this.game.cards[index].length > 0) {
        this.bundles[index].menu
          .setMaxValues(Math.min(this.game.cards[index].length, 5))
          .setOptions(this.getOptions(this.game.cards[index]));
      }
      const components = [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(this.bundles[index].menu), 
        new ActionRowBuilder<ButtonBuilder>().addComponents(...this.bundles[index].buttons)
      ];
      
      this.bundles[index].selectedCards = [];
      await interaction.update({ content, components });
      return;
    }
    else if (args[2] === 'pass') {
      this.conveyor.emit('cardsPlayed', []);
      this.game.pass();
      
      content += this.strings.player.passed;
      await interaction.update({ content });
      return;
    }
    throw new Error("Invalid ButtonInteraction is received.");
  }

  protected async playerSelect(interaction: SelectMenuInteraction): Promise<void> {
    const index = this.game.playerManager.getIndex(interaction.user.id);
    if (index < 0) return;

    let content = format(this.strings.player.cards, { cards: this.cardsToString(this.game.cards[index]) }) + '\n';
    const cards = interaction.values.map(c => parseInt(c, 10)).sort((a, b) => a - b);
    if (!this.game.playable(cards)) {
      content += format(this.strings.player.invalid, { cards: this.cardsToString(cards) });
      await interaction.update({ content });
      return;
    }

    this.bundles[index].selectedCards = cards;
    const trick = this.game.cardsToTrick(cards);
    content += format(this.strings.player.selected, { cards: this.cardsToString(cards), trick: this.trickToString(trick) });
    await interaction.update({ content });
  }

  protected idleToDo(nowPlayer: Player): DjsInputResult {
    nowPlayer.status.set("IDLE");
    this.game.pass();
    return {
      content: format(this.strings.previous.idle, { player: nowPlayer.username }), 
    };
  }

  protected buttonToDo(): DjsInputResult {
    throw new Error("Invalid ButtonInteraction is received.");
  }

  protected messageToDo(): DjsInputResult {
    return {};
  }

  protected playToDo(nowPlayer: Player, input: number[]): DjsInputResult {
    nowPlayer.status.set("PLAYING");

    let content = '';
    let endStatus = "";
    if (!input.length) {
      content = format(this.strings.previous.pass, { player: nowPlayer.username });
    }
    else {
      if (this.game.win()) {
        this.winner = nowPlayer;
        endStatus = "WIN";
      }
      content = format(this.strings.previous.play, { player: nowPlayer.username, trick: this.trickToString(this.game.cardsToTrick(input)) });
    }

    return {
      content, 
      endStatus
    };
  }

  protected async botMove(): Promise<DjsInputResult> {
    throw new Error("Bots are not allowed in this game.");
  }

  protected async update(result: DjsInputResult): Promise<DjsInputResult> {
    if (!this.mainMessage) {
      throw new Error("The main message of the game is invalid.");
    }

    this.game.playerManager.next();
    result.content = this.getMainContent(result.content);
    await this.mainMessage.edit(result).catch(() => {
      result.endStatus = "DELETED";
    });
    return result;
  }

  protected async end(status: string): Promise<void> {
    this.game.end(status);

    await this.mainMessage?.edit({ content: this.mainEndContent, components: [] }).catch(() => {});
  }


  private getOptions(cards: number[]): APISelectMenuOption[] {
    return cards.map(c => ({ label: this.cardToString(c), value: `${c}` }));
  }

  protected async getInput(): Promise<number[] | null> {
    // Since awaitMessageComponent() may reject, a must-resolving Promise is needed
    const promises: Promise<number[] | null>[] = [sleep(this.time, null)];

    promises.push(new Promise(resolve => {
      this.conveyor.on('playerLeft', () => {
        resolve(null);
      });
    }));

    promises.push(new Promise(resolve => {
      this.conveyor.on('cardsPlayed', cards => {
        resolve(cards);
      });
    }));

    const result = await Promise.any(promises);
    this.conveyor.removeAllListeners('cardsPlayed').removeAllListeners('playerLeft');
    return result;
  }

  private cardToString(card: number): string {
    return `${this.strings.ranks[card >> 2]}${this.strings.suits[card & 3]}`;
  }

  private cardsToString(cards: number[]): string {
    return cards.map(c => this.cardToString(c)).join(' ');
  }

  private trickToString(trick: BigTwoTrick): string {
    const { tricks } = this.strings;
    switch (trick[0]) {
      case BigTwoTrickType.None:
        return tricks.none;
      case BigTwoTrickType.Single:
        return format(tricks.single, { card: this.cardToString(trick[1]) });
      case BigTwoTrickType.Pair:
        return format(tricks.pair, { rank: this.strings.ranks[trick[1] >> 2] });
      case BigTwoTrickType.Straight:
        return format(tricks.straight, { rank: this.strings.ranks[trick[1] >> 2] });
      case BigTwoTrickType.FullHouse:
        return format(tricks.fullHouse, { rank: this.strings.ranks[trick[1] >> 2] });
      case BigTwoTrickType.FourOfAKind:
        return format(tricks.fourOfAKind, { rank: this.strings.ranks[trick[1] >> 2] });
      case BigTwoTrickType.StraightFlush:
        return format(tricks.straightFlush, { rank: this.strings.ranks[trick[1] >> 2] });
    }
  }

  private getMainContent(extra?: string): string {
    return `
${this.strings.hbar}
${format(this.strings.nowPlayer, { player: `<@${this.game.playerManager.nowPlayer.id}>` })}${extra ? `\n${extra}`: ''}
${this.strings.hbar}
${format(this.strings.cardsOnTable, { cards: this.cardsToString(this.game.currentCards) })}
${this.strings.hbar}
${this.playerCardsLeft}
${this.strings.hbar}
`;
  }

  private get mainEndContent(): string {
    return `
${this.strings.hbar}
${format(this.strings.cardsOnTable, { cards: this.cardsToString(this.game.currentCards) })}
${this.strings.hbar}
${this.playerOpenCards}
${this.strings.hbar}
`;
  }

  private get playerCardsLeft(): string {
    return this.game.cards
      .map((c, i) => format(this.strings.cardsLeft, { player: this.game.playerManager.players[i].username, number: c.length }))
      .map((s, i) => this.game.playerManager.players[i].status.now === "LEFT" ? `~~${s}~~` : s )
      .join('\n');
  }

  private get playerOpenCards(): string {
    return this.game.cards
      .map((c, i) => format(this.strings.openCards, { player: this.game.playerManager.players[i].username, cards: this.cardsToString(c) }))
      .map((s, i) => this.game.playerManager.players[i].status.now === "LEFT" ? `~~${s}~~` : s )
      .join('\n');
  }
}