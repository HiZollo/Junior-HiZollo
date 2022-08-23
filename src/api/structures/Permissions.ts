import { PermissionFlagsBits, PermissionResolvable, PermissionStrings } from "../types/types";
import { Util } from "../utils";

export class Permissions {
  public bitfield: bigint;

  constructor(perm: PermissionResolvable) {
    this.bitfield = Permissions.resolve(perm);
  }

  static All = Util.valuesOf(PermissionFlagsBits).reduce((acc, cur) => acc | cur, 0n);

  static resolve(perm: PermissionResolvable): bigint {
    if (Array.isArray(perm)) {
      perm = perm.map(p => Permissions.resolve(p)).reduce((acc, cur) => acc | cur, 0n);
    }
    else if (typeof perm === 'string') {
      if (typeof PermissionFlagsBits[perm as keyof typeof PermissionFlagsBits] === 'bigint') {
        perm = PermissionFlagsBits[perm as keyof typeof PermissionFlagsBits];
      }
      else if (/\d+/.test(perm)) {
        perm = BigInt(perm);
      }
      else {
        throw new Error(`${perm} cannot be parsed as Permissions.`);
      }
    }
    return perm;
  }

  public add(perm: PermissionResolvable): this {
    perm = Permissions.resolve(perm);
    this.bitfield |= perm;
    return this;
  }

  public remove(perm: PermissionResolvable): this {
    perm = Permissions.resolve(perm);
    this.bitfield &= ~perm;
    return this;
  }

  public missing(perm: PermissionResolvable): PermissionStrings[] {
    const against = Permissions.resolve(perm);
    return this.remove(against).toArray();
  }

  public toArray(): PermissionStrings[] {
    return Util.keysOf(PermissionFlagsBits).filter(k => this.bitfield & PermissionFlagsBits[k]);
  }
}