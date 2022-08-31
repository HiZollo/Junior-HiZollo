import { ShardingManager } from "./structures";
import config from "../../config";

const manager = new ShardingManager({
  file: './dist/src/api/app.js', 
  token: config.bot.token, 
  shardArgs: process.argv.slice(2), 
  shardCount: 2
});
manager.spawn().then(() => {
  console.log('All shards have been spawned.');
});