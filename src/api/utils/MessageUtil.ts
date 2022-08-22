import { RawFile } from "@discordjs/rest";
import { DataResolver } from ".";
import { APIMessagePatchBody, FileOptions, InteractionReplyOptions, TextBasedChannelSendOptions } from "../types/interfaces";
import { MessageFlags } from "../types/types";

export class MessageUtil extends null {
  static resolveBody(options: TextBasedChannelSendOptions | InteractionReplyOptions): APIMessagePatchBody {
    return {
      content: options.content, 
      tts: 'tts' in options ? options.tts : undefined, 
      embeds: options.embeds, 
      allowed_mentions: options.allowedMentions, 
      components: options.components, 
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