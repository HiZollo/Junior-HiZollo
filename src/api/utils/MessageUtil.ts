import { RawFile } from "@discordjs/rest";
import { DataResolver } from ".";
import { APIMessagePatchBody, FileOptions, InteractionReplyOptions, TextBasedChannelSendOptions } from "../types/interfaces";
import { APIActionRowComponent, APIEmbed, APIMessageActionRowComponent, ComponentType, MessageFlags } from "../types/types";

export class MessageUtil extends null {
  static resolveBody(options: TextBasedChannelSendOptions | InteractionReplyOptions): APIMessagePatchBody {
    if (options.content ?? 0 > 2000) {
      throw new Error('The message content exeeds its maximum length 2000.');
    }

    let embedsTotalTextLength = 0;
    const embeds = options.embeds?.map(embed => {
      if (embed.fields && embed.fields.length > 25) {
        throw new Error('The number of fields should be less than 25');
      }

      const fieldsTextLength = embed.fields?.reduce((length, field, i) => {
        if (field.name.length > 256) {
          throw new Error(`The name of field ${i} exceeds its maximum length 256.`);
        }
        if (field.value.length > 1024) {
          throw new Error(`The value of field ${i} exceeds its maximum length 1024.`);
        }
        return length + field.name.length + field.value.length;
      }, 0) ?? 0;

      if (embed.title && embed.title.length > 256) {
        throw new Error(`The title exceeds its maximum length 256.`);
      }
      if (embed.description && embed.description.length > 256) {
        throw new Error(`The description exceeds its maximum length 4096.`);
      }
      if (embed.author?.name && embed.author.name.length > 256) {
        throw new Error(`The author name exceeds its maximum length 256.`);
      }
      if (embed.footer?.text && embed.footer.text.length > 256) {
        throw new Error(`The footer text exceeds its maximum length 2048.`);
      }

      embedsTotalTextLength += fieldsTextLength +
        (embed.title?.length ?? 0) + 
        (embed.description?.length ?? 0) +
        (embed.author?.name?.length ?? 0) + 
        (embed.footer?.text?.length ?? 0);
      
      return embed as APIEmbed;
    });
    if (embedsTotalTextLength > 6000) {
      throw new Error('The texts across all embeds exceed their maximum length 6000');
    }

    const components = options.components?.map(actionRow => {
      return {
        type: ComponentType.ActionRow, 
        components: actionRow.components.map(component => {
          if ('custom_id' in component && !component.custom_id) {
            throw new Error('Missing custom id');
          }
          if ('url' in component && !component.url) {
            throw new Error('Missing url');
          }
          if ('style' in component && !component.style) {
            throw new Error('Missing style');
          }
          if ('label' in component && 'emoji' in component && !component.label && !component.emoji) {
            throw new Error('Either label or emoji should be provided');
          }
          if ('options' in component && !component.options?.length) {
            throw new Error('At least one option should be provided');
          }
          return component as APIMessageActionRowComponent;
        })
      } as APIActionRowComponent<APIMessageActionRowComponent>;
    });

    return {
      content: options.content, 
      tts: 'tts' in options ? options.tts : undefined, 
      embeds: embeds, 
      allowed_mentions: options.allowedMentions, 
      components: components, 
      flags: 'ephemeral' in options ? MessageFlags.Ephemeral : undefined, 
      sticker_ids: 'stickerIds' in options ? options.stickerIds : undefined, 
      attachments: options.files?.map((file, i) => ({
        id: `${i}`, 
        filename: file.name ?? 'file.jpg', 
        descrpition: file.description
      }))
    }
  }

  static async resolveFiles(files: FileOptions[]): Promise<RawFile[]> {
    return Promise.all(
      files.map(async ({ attachment, name }, i) => {
        const { data, contentType } = await DataResolver.resolveFile(attachment);
        return { name: name ?? `file_${i}`, data, contentType };
      })
    );
  }
}