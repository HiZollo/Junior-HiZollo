import config from "@root/config";
const { prefix } = config.bot;

export default `
● 修復了一些 bug
　● \`${prefix}addrole\` 與 \`${prefix}removerole\` 不提供身分組時無法觸發指令
　● \`${prefix}bullsandcows\` 的指令用法沒有跟著改名
　● \`/gomoku\` 只 tag 自己時無法觸發指令
　● \`/react\` 就算成功反應表情，也會顯示反應失敗
　● \`/think\` 不提供參數時無法觸發指令
　● \`/tictactoe\` 不提供版面大小時無法觸發指令
　● 當 HiZollo 被球丟到生氣時，使用者仍然可以執行指令
● 現在創建新的討論串時 HiZollo 不會自動加入了，如果你需要他進到討論串裡，只需要在討論串 tag 他就可以了
● 移除部分過時的隱藏指令
`;
