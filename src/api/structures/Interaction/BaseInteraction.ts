import { AutocompleteInteraction, Client, CommandInteraction, MessageComponentInteraction, ModalSubmitInteraction } from "..";
import { APIInteraction, APIInteractionGuildMember, APIPingInteraction, APIUser, If, InteractionType, LocaleString } from "../../types/types";

export abstract class BaseInteraction<InGuild extends boolean = boolean> {
  public client!: Client;
  public id: string;
  public applicationId: string;
  public token!: string;
  public version: 1;
  public type: Exclude<InteractionType, InteractionType.Ping>;
  public locale: LocaleString;
  public appPermissions?: string;
  
  public user: If<InGuild, null, APIUser>;
  public guildLocale: If<InGuild, LocaleString>;
  public guildId: If<InGuild, string>;
  public channelId: If<InGuild, string>;
  public member: If<InGuild, APIInteractionGuildMember>;

  constructor(client: Client, data: Exclude<APIInteraction, APIPingInteraction>) {
    Object.defineProperty(this, 'client', { value: client });
    Object.defineProperty(this, 'token', { value: data.token });

    this.id = data.id;
    this.applicationId = data.application_id;
    this.version = data.version;
    this.type = data.type;
    this.locale = data.locale;
    this.appPermissions = data.app_permissions;

    this.user = (data.user ?? null) as If<InGuild, null, APIUser>;
    this.guildLocale = (data.guild_locale ?? null) as If<InGuild, LocaleString>;
    this.guildId = (data.guild_id ?? null) as If<InGuild, string>;
    this.channelId = (data.channel_id ?? null) as If<InGuild, string>;
    this.member = (data.member ?? null) as If<InGuild, APIInteractionGuildMember>;
  }

  public inGuild(): this is BaseInteraction<true> {
    return !!this.guildId;
  }

  public isAutocomplete(): this is AutocompleteInteraction {
    return this.type === InteractionType.ApplicationCommandAutocomplete;
  }

  public isCommand(): this is CommandInteraction {
    return this.type === InteractionType.ApplicationCommand;
  }

  public isMessageComponent(): this is MessageComponentInteraction {
    return this.type === InteractionType.MessageComponent;
  }

  public isModalSubmit(): this is ModalSubmitInteraction {
    return this.type === InteractionType.ModalSubmit;
  }
}