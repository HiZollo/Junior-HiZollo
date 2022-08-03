export enum CommandParserOptionResultStatus {
  Pass, 
  Required, 
  WrongFormat, 
  NotInChoices, 
  ValueTooSmall, 
  ValueTooLarge, 
  LengthTooShort, 
  LengthTooLong
}

export enum CommandManagerRejectReason {
  Angry, 
  TwoFactorRequird, 
  BotMissingPermission, 
  UserMissingPermission, 
  InCooldown, 
  InNetwork, 
  IllegalArgument
}

export enum CommandType {
  Fun, 
  Utility, 
  SinglePlayerGame, 
  MultiPlayerGame, 
  Information, 
  SubcommandGroup, 
  Contact, 
  Network, 
  Miscellaneous, 
  // 不管上面再多加幾個分類，Developer 永遠都要在最底端
  Developer
}

export enum CommandOptionType {
  Subcommand, 
  SubcommandGroup, 
  String, 
  Emoji, 
  Integer, 
  Boolean, 
  User, 
  Member, 
  Channel, 
  Role, 
  Mentionable, 
  Number, 
  Attachment
};

export enum ArgumentParseType {
  None, Split, Quote, Custom
};

export enum PageSystemMode {
  Description, EmbedField
}

export enum PlayMusicResultType {
  StartPlaying, AddedToQueue, NotInVoiceChannel, ResourceNotFound
}

export enum MusicControllerActions {
  Pause, Resume, Repeat, NoRepeat, Skip, Info
}