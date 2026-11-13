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

export const Computer = [
  // 軼聞
  'C 語言之所以叫 C 語言，純粹是因為它的前身叫 B 語言',
  '諾貝爾獎並沒有電腦科學獎，因為諾貝爾去世時電腦根本還沒發明',
  '世界上有 10 種人，一種是懂二進位的人，另一種是不懂二進位的人',
  '世界上第一個被註冊的網域是 nordu.net，它是由北歐五國（丹麥、冰島、挪威、瑞典、芬蘭）建立的，用於連接學術研究機構',
  'BrainFuck 是一種只由 8 種字元（`<>+-.,[]`）組成的程式語言，但它卻是圖靈完備的，因此理論上可以完成所有圖靈機可以做到的運算',
  '阿波羅 11 號所使用的電腦僅有 4 KB 的記憶體，小到連現代手機的一張照片都放不下，然而卻是這台簡陋的電腦，幫人類完成史上第一次的登月任務',
  '你可能聽過 404 Not Found 的狀態碼，代表伺服器找不到你要的資源，但你可能沒聽過 418 I\'m a teapot，代表伺服器拒絕幫你泡咖啡，因為它只是一個茶壺',
  '1947 年的某天，哈佛大學的電腦出錯，後來發現原因是機器裡卡了一隻飛蛾，很多人以為這就是「bug」的詞源，但其實早在 19 世紀，工程師就已經會使用 bug 來形容系統的錯誤了',
  '「自產生程式」是指不通過讀取檔案就能把自己的程式內容完整印出的程式，例如在 Node.js 中，已知最短的自產生程式是 `($=()=>console.log(`($=${$})()`))()`，只有 35 個字元',

  // 理論
  '不存在任何演算法在給定任意程式後，判斷該程式是否存在漏洞',
  '不存在任何演算法在給定任意程式與任意輸入後，判斷該程式在接收輸入時是否會陷入無窮迴圈',
  '不存在任何演算法在給定兩個相異程式後，判斷這兩個程式在接收相同輸入時必定會輸出相同的結果',
  '所有程式的數量有可數無限多個，但實數函數的數量卻有不可數無限多個，代表絕大多數的函數都無法被任何程式實作出來',
  '給定一張圖，要尋找最短路徑是非常容易的，它是一個 P 問題，但要尋找最長簡單路徑（不經過同一個點的路徑）卻是 NP 困難的',
  '雖然量子演算法可以更有效率地解決某些古典演算法的難題，但如果一個問題是古典演算法無法判定的，則量子演算法也無法判定這個問題',

  // 詞源
  '位元的英文是 bit，它是 binary digit（二進位數字）的縮寫',
  '雜湊的英文是 hash，原意是將食材剁碎並混合，而雜湊函數的功能就如同其原意，會將原始資料打亂並混合，產生一個不可逆的雜湊值',
  '在類 Unix 的作業系統中，會用 daemon（原意精靈）來表示持續在背景運行的程式，這個名稱是借用自馬克士威所提出的思想實驗「馬克士威妖」',
  '計算機的英文是 computer，這個詞在計算機出現以前其實是指一種職業：計算員，他們是在真正的計算機被發明以前，協助科學家進行冗長的計算的工作人員',
  '4 位元又稱 nibble，它原本是指「咬一小口」的動作，當初這樣命名是因為 8 位元的英文 byte 與咬（bite）的讀音相同，所以就引用咬一小口作為 4 位元的名稱',
  '開機的英文是 boot，它是來自英文成語 Pull oneself up by one\'s bootstraps，原意是拉起自己的鞋帶站起來，有自立振作的引申義，而開機確實是電腦透過啟動程式自己把自己喚醒的過程',
  '網頁 Cookie 的名稱由來是美式中餐廳裡的「幸運餅乾」，這種餅乾送來時，裡面會夾著寫有籤詩或幸運數字的紙條，而伺服器傳送封包附上的「Cookie」就像是夾藏的紙條一樣，寫著有關於客戶端的資訊',

  // JavaScript
  'JavaScript 的發明者 Brendan Eich 當初只花了十天就寫出了它的原型，以至於現在所有前端工程師都在幫他還技術債',
  '在 JavaScript 中，NaN（Not a Number）的型別是 number，而且如果檢查兩個 NaN 是否相等（`NaN == NaN`），你會得到 false 的答案',
];
