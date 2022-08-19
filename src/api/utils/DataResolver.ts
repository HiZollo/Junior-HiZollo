import fs from "node:fs/promises";
import path from "node:path";

export class DataResolver extends null {
  static async resolveFile(resource: string | Buffer): Promise<{ data: Buffer, contentType?: string }> {
    if (Buffer.isBuffer(resource)) return { data: resource };

    if (/^https?:\/\//.test(resource)) {
      const res = await fetch(resource);
      return { data: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get('content-type') ?? undefined };
    }

    const file = path.resolve(resource);

    const stats = await fs.stat(file);
    if (!stats.isFile()) throw new Error('File Not Found.');
    return { data: await fs.readFile(file) };
  }
}