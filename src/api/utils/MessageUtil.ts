import { RawFile } from "@discordjs/rest";
import { DataResolver } from ".";
import { APIMessagePatchBody, FileOptions, TextBasedChannelSendOptions } from "../types/interfaces";

export class MessageUtil extends null {
  static resolveBody(options: TextBasedChannelSendOptions): APIMessagePatchBody {
    return {
      content: options.content, 
      tts: options.tts, 
      embeds: options.embeds, 
      allowed_mentions: options.allowedMentions, 
      message_reference: options.messageReference, 
      components: options.components, 
      sticker_ids: options.stickerIds, 
      attachments: options.files?.map((file, i) => ({
        id: `${i}`, 
        filename: file.name ?? 'file.jpg', 
        descrpition: file.description
      })), 
      flags: options.flags
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