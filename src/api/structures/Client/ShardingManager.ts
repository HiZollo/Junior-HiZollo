import childProcess from "node:child_process";
import path from "node:path";
import { APIGatewayBotInfo, RouteBases, Routes } from "discord-api-types/v10";
import { fetch } from "undici";
import { ShardingManagerOptions } from "../../types/interfaces";
import { Util } from "../../utils";

export class ShardingManager {
  public token!: string;
  public file: string;
  public shardArgs: string[];
  public shardCount: number | 'auto';
  public shardProcesses: childProcess.ChildProcess[];

  constructor(options: ShardingManagerOptions) {
    Object.defineProperty(this, 'token', { value: options.token });

    this.file = path.join(process.cwd(), options.file);
    this.shardArgs = options.shardArgs ?? [];
    this.shardCount = options.shardCount ?? 'auto';
    this.shardProcesses = [];
  }

  public async spawn(): Promise<this> {
    if (this.shardCount === 'auto') {
      const response = await fetch(RouteBases.api + Routes.gatewayBot(), {
        method: 'GET', 
        headers: { Authorization: `Bot ${this.token}` }
      });
      if (!response.ok) throw response;

      const { shards } = await response.json() as APIGatewayBotInfo;
      this.shardCount = shards;
    }

    const shardIds = Array.from({ length: this.shardCount }, (_, i) => i);
    for (const id of shardIds) {
      this.shardProcesses.push(
        childProcess.fork(this.file, this.shardArgs, {
          env: {
            SHARD_ID: id.toString(), 
            SHARD_COUNT: this.shardCount.toString()
          }
        })
      );
      await Util.sleep(5e3);
    }

    return this;
  }
}