export class SnowflakeUtil extends null {
  static epoch: bigint = 1420070400000n;

  static timestampFrom(id: string): number {
    return Number((BigInt(id) >> 22n) + this.epoch);
  }
}