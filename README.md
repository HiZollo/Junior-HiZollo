<div align="center">
  <img src="https://files.catbox.moe/3n2tv1.png" />
  <em><p><a href="https://hizollo.ddns.net">https://hizollo.ddns.net</a><p></em>

  <a href="https://hizollo.ddns.net/server">
    <img src="https://img.shields.io/discord/572733182412193792.svg?style=for-the-badge&logo=Discord&colorB=7289da" />
  </a>
  <a href="https://github.com/hizollo/junior-hizollo">
    <img src="https://img.shields.io/github/license/hizollo/junior-hizollo?style=for-the-badge" />
  </a>
  
  <br />
  
  <a href="https://github.com/hizollo/junior-hizollo/pulls">
    <img src="https://img.shields.io/github/issues-pr/hizollo/junior-hizollo?style=for-the-badge&logo=Github" />
  </a>
  <a href="https://github.com/hizollo/junior-hizollo/issues">
    <img src="https://img.shields.io/github/issues/hizollo/junior-hizollo?style=for-the-badge&logo=Github" />
  </a>
  <br /><br />
  <p>用 TypeScript 寫出來的爛 bot。</p>

  <img src="https://files.catbox.moe/ys65as.png" width="500" />
</div>

## 邀請連結
你可以[點擊此處](https://hizollo.ddns.net/invite)邀請他加入你的伺服器。

## 功能
- `/2048`：在 Discord 中玩一場 2048
- `/buttonrole`：設置讓使用者獲取身份的按鈕
- `/calc`：計算一個數學算式
- `/confession`：和伺服器中的一位成員告白
- `/getmsg`：匯出你和朋友的聊天記錄
- `/gomoku`：和伺服器中的朋友們玩一場五子棋
- `/fact`：獲取一條會害你沒朋友的冷知識
- `/music`：可以播歌的音樂功能
- `/say`：讓機器人代替你說一句話
- `/useless`：???

當然，HiZollo 的功能絕對不只這些，你可以使用 `z!help` 或 `/help` 來查看他的指令清單。
你也可以到 [HiZollo 的官方網站](https://hizollo.ddns.net)上瀏覽他的[指令列表](https://hizollo.ddns.net/commands)。

## 複製一臺
Junior HiZollo 需要在 node.js v18.2.1 以上的版本中才能運行，你可以使用 `node -v` 來確定你的版本是否足夠。

在你把整份專案複製回去後，在根目錄創建一個叫做 `.env` 的檔案，並把下方模板中的缺項補齊：
```
TOKEN=
MAIN_WEBHOOK_URL=
ERROR_WEBHOOK_URL=
BUG_WEBHOOK_URL=
SUGGEST_WEBHOOK_URL=
REPLY_WEBHOOK_URL=
NETWORK_WEBHOOK_URL=
OSU_APIKEY=
TEST_CHANNELS="[
  // 這是一個陣列，請在這裡填入測試頻道的 ID，沒有的話則留白
]"
BLOCKED_USERS="[
  // 這是一個陣列，請在這裡填入被封鎖用戶的 ID，沒有的話則留白
]"
```
在這之後，也將 `config.ts` 中的各種 ID 換成你自己的，各種 prefix 如果你有自己的也換成自己的。

完成資料的設置後，請用 `npm install` 把所有依賴的套件下載完，並使用 `npm run build` 來編譯整個專案。

編譯完成後，使用 `npm run deploy` 來部署所有應用程式指令。使用 `npm start` 可以在一般模式下執行機器人，而使用 `npm test` 則是在測試模式下執行。在測試模式中：
- HiZollo Network 無效
- 測試頻道以外使用的指令不會被回應

在複製或使用 HiZollo 的原始碼時，請注意[我們的授權方式](#授權)。

### Webhook
在創建回報系統的 Webhook 時，我們建議你使用由應用程式創建的 Webhook，按鈕才能正常顯示。

如果要使用，可以先不填入 Webhook 相關部分直接編譯整份專案。編譯完成後使用 `npm run rg-webhook [頻道 ID] <Webhook 名稱>` 指令讓你的應用程式在指定的頻道上註冊 Webhook。之後再將它們的 ID 和 Token 寫回 `.env` 和 `config.ts`。

請注意因為 `config.ts` 會被編進 `dist/config.js`，所以如果 `config.ts` 有任何更動都會需要重新編譯。

Webhook 的名稱可以在之後到 Discord 中手動更改。

使用範例：
```
> npm run rg-webhook 816612487649689621 "Cool Webhook"

Name: Cool Webhook
URL: https://discord.com/api/webhooks/1022496087895973898/DYewdMZ138jskaXgFalU_JJ_wKBTjaC6kdgYnF2lyqnkb-HrU2y0JdY2xdpr7Do-P6zl
```

### Youtube 音樂功能
因應 Youtube 的聲明，Discord 會將被發現在播放 Youtube 音樂的機器人取消驗證。

為了避免遭受處分，我們在程式中將播放 Youtube 音樂的功能上了鎖。如果你希望在你的複製品中可以啟用此功能，可以在你的 `.env` 檔案中加上一行

```
ENABLE_YT=1
```

或是把 `/src/commands/Music/Play` 中 `<Lock></Lock>` 的部分刪掉。

由於在未來我們可能會對音樂系統做改寫，啟用此功能的方法亦可能改變，對於使用此功能的人，請關注本章節和更新日誌。

## 官方伺服器
如果有碰到任何使用上的問題，你都可以到我們的[官方伺服器](https://hizollo.ddns.net/server)中詢問。

## 授權
Junior HiZollo 的原始碼是以 GPL-3.0-or-later 條款授權給所有人使用，你可以在該條款之下對其做任意的分發、修改。對於更詳細的說明，請參見 [COPYING](https://github.com/HiZollo/Junior-HiZollo/blob/main/COPYING) 或 [Google](https://www.google.com/search?q=gpl-3.0-or-later)。
