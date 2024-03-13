/**
 * 把時間字串轉換為毫秒
 * @param timeString 輸入值
 * @returns 毫秒
 */
export default function (timeString: string): number {
  let milliseconds = 0
  if (/^\d+:\d+:\d+$/.test(timeString)) {
    const [hours, minutes, seconds] = timeString.split(':');
    milliseconds += parseInt(hours, 10) * 3600000;
    milliseconds += parseInt(minutes, 10) * 60000;
    milliseconds += parseInt(seconds, 10) * 1000;
  } else if (/^\d+:\d+$/.test(timeString)) {
    const [minutes, seconds] = timeString.split(':');
    milliseconds += parseInt(minutes, 10) * 60000;
    milliseconds += parseInt(seconds, 10) * 1000;
  } else {
    // 檢查時間格式是否為 XhYmZs 或 X分鐘 或 X秒
    const regex = /^((\d+(\.\d+)?)h)?((\d+(\.\d+)?)m)?((\d+(\.\d+)?)s)?$/;
    const matches = timeString.match(regex);
    if (matches) {
      const hours = parseFloat(matches[2]) || 0;
      const minutes = parseFloat(matches[5]) || 0;
      const seconds = parseFloat(matches[8]) || 0;
      milliseconds += hours * 3600000;
      milliseconds += minutes * 60000;
      milliseconds += seconds * 1000;
    }
  }
  return milliseconds;
}