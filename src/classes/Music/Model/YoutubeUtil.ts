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

import ytpl, { YouTubeStream } from "play-dl";

/**
 * 與 Youtube 相關的功能性函式
 */
export class YoutubeUtil extends null {
  /**
   * 確認字串是不是合法的 Youtube 影片連結
   * @param url 字串
   */
  static isVideoUrl(url: string): boolean {
    return /^((?:https?:)?\/\/)?(?:(?:www|m|music)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|shorts\/|embed\/|v\/)?)([\w\-]+)(\S+)?$/.test(url);
  }

  /**
   * 確認字串是不是合法的 Youtube 播放清單連結
   * @param url 字串
   */
  static isPlaylistUrl(url: string): boolean {
    return /^((?:https?:)?\/\/)?(?:(?:www|m|music)\.)?((?:youtube\.com|youtu.be))\/(?:(playlist|watch))?(.*)?((\?|\&)list=)(PL|UU|LL|RD|OL)[a-zA-Z\d_-]{10,}(&.*)?$/.test(url);
  }

  /**
   * 嘗試抓取指定連結的 Youtube 音樂串流，最多會嘗試 5 次
   * @param url 指定連結
   * @returns 音樂串流
   */
  static async getStream(url: string): Promise<YouTubeStream | void> {
    let stream: YouTubeStream | void;
    for (let i = 0; i < 5 && !stream; i++) {
      stream = await ytpl.stream(url).catch(() => {}) as YouTubeStream | void;
    }
    return stream;
  }
}
