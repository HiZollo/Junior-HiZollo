import { PermissionFlagsBits, PermissionResolvable, PermissionStrings } from "../types/types";
import { Util } from "../utils";

export class Permissions {
  public bitfields: bigint;

  constructor(perm: bigint) {
    this.bitfields = perm;
  }

  static All = Util.valuesOf(PermissionFlagsBits).reduce((acc, cur) => acc | cur, 0n);

  static resolve(perm: PermissionResolvable): Permissions {
    if (Array.isArray(perm)) {
      perm = perm.reduce((acc, cur) => acc | PermissionFlagsBits[cur], 0n);
    }
    else if (typeof perm === 'string') {
      perm = BigInt(perm);
    }
    return new Permissions(perm);
  }

  public exclude(perm: Permissions): Permissions {
    return new Permissions(~this.bitfields & perm.bitfields);
  }

  public missing(perm: PermissionResolvable): PermissionStrings[] {
    const against = Permissions.resolve(perm);
    return this.exclude(against).toArray();
  }

  public toArray(): PermissionStrings[] {
    return Util.keysOf(PermissionFlagsBits).filter(k => this.bitfields & PermissionFlagsBits[k]);
  }
}