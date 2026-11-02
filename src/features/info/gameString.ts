import emoji from "@root/app_emoji.json";

export default {
  "bigTwo": {
    "name": "大老二", 
    "ranks": ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"], 
    "suits": ["\\♣", "\\♦", "\\♥", "\\♠"], 
    "player": {
      "cards": "**你的手牌**：[<cards>]", 
      "menu": "請選擇一到五張牌", 
      "pass": "跳過", 
      "play": "出牌", 
      "selected": "**你選擇的牌組**：[<cards>] (<trick>)\n當遊戲輪到你時，你可以按下綠色按鈕來出牌", 
      "played": "成功打出 [<cards>] (<trick>)", 
      "passed": "你跳過了這個回合", 
      "invalid": "[<cards>] 並不是合法的牌組，請重新選擇你要打出的牌組", 
      "notYourTurn": "還沒輪到你，等輪到你你再動作", 
      "noSelection": "你還沒選擇任何牌組"
    }, 
    "previous": {
      "play": "<player> 打出了 **<trick>**.", 
      "pass": "<player> 跳過了這個回合", 
      "idle": "<player> 錯過了他的回合"
    },
    "tricks": {
      "none": "無", 
      "single": "單張 <card>", 
      "pair": "<rank> 對子", 
      "straight": "<rank> 順子", 
      "fullHouse": "<rank> 葫蘆", 
      "fourOfAKind": "<rank> 鐵支", 
      "straightFlush": "<rank> 同花順"
    }, 
    "hbar": "———————————————————", 
    "nowPlayer": "現在輪到 <player> 了", 
    "cardsOnTable": "**現在桌面上的牌組是**：[<cards>]", 
    "cardsLeft": "<player>：還剩 <number> 張牌", 
    "openCards": "<player>：[<cards>]", 
    "playerLeft": "<player> 已離開遊戲", 
    "controller": {
      "cards": "顯示手牌", 
      "leave": "離開遊戲"
    },
    "endMessages": {
      "win": "<player> 贏得了這場大老二！",
      "idle": "遊戲已因閒置過久而自動停止",
      "stopped": "遊戲已因玩家要求而停止",
      "deleted": "等等，牌桌呢？沒有牌桌是要怎麼玩下去？",
      "gameStats": {
        "header": "遊戲數據 - <game>",
        "message": "**總花費時間**：<min>:<sec>\n**總出牌次數**：<step>"
      },
      "playerStats": {
        "message": "**花費時間**：<min>:<sec>\n**出牌次數**：<step>"
      }
    }
  },
  "bullsAndCows": {
    "name": "猜 AB",
    "initial": "<player>，請猜測一個數字",
    "query": "`<query>` 得出的結果是：`<a>A<b>B`",
    "playerLeft": "<player> 已離開遊戲", 
    "controller": {
      "leave": "離開遊戲"
    },
    "endMessages": {
      "win": "<player>，你猜到了最終答案 `<answer>`！",
      "idle": "遊戲已因閒置過久而自動停止",
      "stopped": "遊戲已因玩家要求而停止",
      "deleted": "等等，訊息呢？訊息不見我要怎麼跟你講幾 A 幾 B 啊？",
      "gameStats": {
        "header": "遊戲數據 - <game>",
        "message": "**總花費時間**：<min>:<sec>\n**總猜測次數**：<step>"
      },
      "playerStats": {
        "message": "**花費時間**：<min>:<sec>\n**猜測次數**：<step>"
      }
    }
  },
  "chess": {
    "name": "西洋棋",
    "rows": [
      "a", "b", "c", "d", "e", "f", "g", "h"
    ],
    "columns": [
      "8", "7", "6", "5", "4", "3", "2", "1"
    ],
    "grid": "🔲",
    "corner": "🔹",
    "previous": {
      "move": "上一手 <player> 下了 `<move>`",
      "idle": "<player> 錯過了他的回合",
      "leaving": "<player> 想要結束這場遊戲"
    },
    "nowPlayer": "現在輪到 <player>（<symbol>）了",
    "playerLeft": "<player> 已離開遊戲", 
    "controller": {
      "leave": "離開遊戲"
    },
    "endMessages": {
      "win": "恭喜 <player> 在這場五子棋中拿下了勝利",
      "draw": "這場五子棋最終平手收場，看來兩位勢均力敵呢",
      "idle": "遊戲已因閒置過久而自動停止",
      "stopped": "遊戲已因玩家要求而停止",
      "deleted": "等等，棋盤呢？棋盤不見是要怎麼下棋？",
      "gameStats": {
        "header": "遊戲數據 - <game>",
        "message": "**總花費時間**：<min>:<sec>\n**總下棋次數**：<step>"
      },
      "playerStats": {
        "message": "**花費時間**：<min>:<sec>\n**下棋次數**：<step>"
      }
    }
  },
  "finalCode": {
    "name": "終極密碼",
    "previous": {
      "tooSmall": "<query> 太小了",
      "tooLarge": "<query> 太大了", 
      "idle": "<player> 錯過了他的回合",
      "leaving": "<player> 想要結束這場遊戲"
    },
    "interval": "現在終極密碼落在 <min> 和 <max> 之間",
    "nowPlayer": "現在輪到 <player> 了",
    "playerLeft": "<player> 已離開遊戲", 
    "controller": {
      "leave": "離開遊戲"
    },
    "endMessages": {
      "win": "<player>，你猜到終極密碼 <answer> 了！",
      "idle": "遊戲已因閒置過久而自動停止",
      "stopped": "遊戲已因玩家要求而停止",
      "deleted": "等等，訊息呢？訊息不見我要怎麼跟你講太大太小啊？",
      "gameStats": {
        "header": "遊戲數據 - <game>",
        "message": "**總花費時間**：<min>:<sec>\n**總猜測次數**：<step>"
      },
      "playerStats": {
        "message": "**花費時間**：<min>:<sec>\n**猜測次數**：<step>"
      }
    }
  },
  "flipTrip": {
    "name": "Flip Trip",
    "numbers": ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"],
    "pieces": ["⚪", "⚫"],
    "playerLeft": "<player> 已離開遊戲", 
    "controller": {
      "leave": "離開遊戲"
    },
    "endMessages": {
      "win": "FULL TRIP!\n<player>，恭喜你在 **<size>** 顆棋子的 Flip Trip 中獲勝！",
      "lose": "哈哈 <player>，想不到吧，`<state>` 早就出現過了！\n你還差 <perm> 種組合就能破關了，請再接再厲",
      "idle": "遊戲已因閒置過久而自動停止",
      "stopped": "遊戲已因玩家要求而停止",
      "deleted": "等等，棋子呢？棋子不見我要怎麼翻給你看？",
      "gameStats": {
        "header": "遊戲數據 - <game>",
        "message": "**總花費時間**：<min>:<sec>\n**總嘗試次數**：<step>"
      },
      "playerStats": {
        "message": "**花費時間**：<min>:<sec>\n**嘗試次數**：<step>"
      }
    }
  },
  "gomoku": {
    "name": "五子棋",
    "rows": [
      emoji.n1, 
      emoji.n2, 
      emoji.n3, 
      emoji.n4, 
      emoji.n5, 
      emoji.n6, 
      emoji.n7, 
      emoji.n8, 
      emoji.n9, 
      emoji.n10, 
      emoji.n11, 
      emoji.n12, 
      emoji.n13, 
    ],
    "columns": [
      emoji.a_, 
      emoji.b_, 
      emoji.c_, 
      emoji.d_, 
      emoji.e_, 
      emoji.f_, 
      emoji.g_, 
      emoji.h_, 
      emoji.i_, 
      emoji.j_, 
      emoji.k_, 
      emoji.l_, 
      emoji.m_
    ],
    "grid": "🔲",
    "corner": "🔹",
    "previous": {
      "move": "上一手 <player> 下在 `<col><row>` 的位置",
      "idle": "<player> 錯過了他的回合",
      "leaving": "<player> 想要結束這場遊戲"
    },
    "nowPlayer": "現在輪到 <player>（<symbol>）了",
    "playerLeft": "<player> 已離開遊戲", 
    "controller": {
      "leave": "離開遊戲"
    },
    "endMessages": {
      "win": "恭喜 <player> 在這場五子棋中拿下了勝利",
      "draw": "這場五子棋最終平手收場，看來兩位勢均力敵呢",
      "idle": "遊戲已因閒置過久而自動停止",
      "stopped": "遊戲已因玩家要求而停止",
      "deleted": "等等，棋盤呢？棋盤不見是要怎麼下棋？",
      "gameStats": {
        "header": "遊戲數據 - <game>",
        "message": "**總花費時間**：<min>:<sec>\n**總下棋次數**：<step>"
      },
      "playerStats": {
        "message": "**花費時間**：<min>:<sec>\n**下棋次數**：<step>"
      }
    }
  },
  "lightsUp": {
    "name": "點燈",
    "answerSymbols": ["🔴", "🟡"],
    "currentAnswer": "以下是這個燈泡盤面的答案：\n<answer>",
    "playerLeft": "<player> 已離開遊戲", 
    "controller": {
      "answer": "查看答案",
      "leave": "離開遊戲"
    },
    "endMessages": {
      "jackpot": "大恭喜！所有燈泡在一開始就都是全亮的了！",
      "win": "恭喜 <player> 因為偷看答案所以點亮了所有燈泡！",
      "unansweredWin": "恭喜 <player> 在沒有偷看答案的情況下點亮了所有燈泡！",
      "idle": "遊戲已因閒置過久而自動停止",
      "stopped": "遊戲已因玩家要求而停止",
      "deleted": "等等，燈泡呢？燈泡不見是要怎麼點燈？",
      "gameStats": {
        "header": "遊戲數據 - <game>",
        "message": "**總花費時間**：<min>:<sec>\n**總點燈次數**：<step>"
      },
      "playerStats": {
        "message": "**花費時間**：<min>:<sec>\n**點燈次數**：<step>"
      }
    }
  },
  "ticTacToe": {
    "name": "圈圈叉叉",
    "labels": [
      ["\u200b", "\u200b", "\u200b", "\u200b"],
      ["\u200b", "\u200b", "\u200b", "\u200b"],
      ["\u200b", "\u200b", "\u200b", "\u200b"],
      ["\u200b", "\u200b", "\u200b", "\u200b"]
    ],
    "previous": {
      "idle": "<player> 錯過了他的回合",
      "leaving": "<player> 想要結束這場遊戲"
    },
    "nowPlayer": "現在輪到 <player>（<symbol>）了",
    "playerLeft": "<player> 已離開遊戲", 
    "controller": {
      "leave": "離開遊戲"
    },
    "endMessages": {
      "win": "恭喜 <player> 贏得了這場圈圈叉叉！",
      "draw": "這場圈圈叉叉以平手收場，看來兩位勢均力敵呢",
      "idle": "遊戲已因閒置過久而自動停止",
      "stopped": "遊戲已因玩家要求而停止",
      "deleted": "等等，棋盤呢？沒有棋盤是要怎麼玩下去？",
      "gameStats": {
        "header": "遊戲數據 - <game>",
        "message": "**總花費時間**：<min>:<sec>\n**總下棋次數**：<step>"
      },
      "playerStats": {
        "message": "**花費時間**：<min>:<sec>\n**下棋次數**：<step>"
      }
    }
  },
  "tofe": {
    "name": "2048",
    "playerLeft": "<player> 已離開遊戲", 
    "score": "分數：<score>", 
    "controller": {
      "up": "⬆️", 
      "down": "⬇️", 
      "left": "⬅️", 
      "right": "➡️", 
      "leave": "離開遊戲"
    },
    "endMessages": {
      "win": "<player>，你成功做出 2048 了！",
      "lose": "<player>，版面滿了，你輸了",
      "idle": "遊戲已因閒置過久而自動停止",
      "stopped": "遊戲已因玩家要求而停止",
      "deleted": "等等，數字呢？數字不見了是要怎麼玩下去？",
      "gameStats": {
        "header": "遊戲數據 - <game>",
        "message": "**總花費時間**：<min>:<sec>\n**總操作次數**：<step>"
      },
      "playerStats": {
        "message": "**花費時間**：<min>:<sec>\n**操作次數**：<step>"
      }
    }
  }
};