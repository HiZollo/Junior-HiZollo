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
  Pause, Resume, Repeat, Again, NoRepeat, Skip, Info
}

export enum MusicLoopState {
  Normal, Again, Loop
}
