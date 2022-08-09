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
}
