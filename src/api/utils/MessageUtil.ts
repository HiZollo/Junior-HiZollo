import { RawFile } from "@discordjs/rest";
import { DataResolver } from ".";
import { APIMessagePatchBody, FileOptions, InteractionReplyOptions, TextBasedChannelSendOptions } from "../types/interfaces";
import { APIActionRowComponent, APIMessageActionRowComponent, ComponentType, MessageFlags } from "../types/types";

export class MessageUtil extends null {
  static resolveBody(options: TextBasedChannelSendOptions | InteractionReplyOptions): APIMessagePatchBody {
    let components = options.components?.map(actionRow => {
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
    })

    return {
      content: options.content, 
      tts: 'tts' in options ? options.tts : undefined, 
      embeds: options.embeds, 
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