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

export default `
● 修復了一些 bug
　● 當斜線指令選項的使用者不在伺服器內，錯誤提示會顯示 \`null\` 而非該使用者
● \`buttonrole\` 指令現在可以編輯和移除按鈕了
  ● 當你填入已經存在按鈕的身分組時會處發此機制
  ● 如果其餘資訊都一樣，那麼該身分會被移除
  ● 如果有資訊不一樣，那該會更新該身分的資訊
● \`music\` 指令不再支持 YouTube
  ● 關於這點更改的說明，可以參考官方公告或加入官方伺服器詢問
  ● 由於本來的音樂系統只有支持 YouTube，所以目前是半癱瘓狀態
  ● 我們會在未來新增其它東西給 \`music\` 指令
  ● 你可以使用 \`activity\` 指令的 WatchTogether 做為此指令的替代
● 將 \`youtube\` 指令改成 \`activity\` 指令，並開放選擇使用其它的語音活動
  ● 原先的 \`youtube\` 是其中的 WatchTogether 功能
  ● 部分功能因 Discord 限制要有伺服器加成才能玩
● \`say\` 和 \`repeat\` 指令現在不會 tag 使用者了
  ● 這是為了防範有人匿名大量 tag 使用者的問題
● 為 \`confession\` 指令新增了一些回應
`;