import { EventEmitter } from "node:events";
import { Client } from ".";
import { CollectorOptions } from "../types/interfaces";
import { Awaitable, CollectorEndReason } from "../types/types";

export abstract class Collector<K, V> extends EventEmitter {
  public client: Client;
  public filter: (...args: unknown[]) => Awaitable<boolean>;
  public max?: number;
  public time?: number;
  public idle?: number;

  protected collected: Map<K, V>;
  protected timeout?: NodeJS.Timeout;
  protected idleTimeout?: NodeJS.Timeout;

  protected abstract collect(...args: unknown[]): [key: K, value: V] | null;

  constructor(options: CollectorOptions) {
    super();

    this.client = options.client;
    this.filter = options.filter ?? (() => true);
    this.max = options.max;
    this.time = options.time;
    this.idle = options.idle;

    this.collected = new Map();
    if (this.time) this.timeout = setTimeout(() => this.end('time'), this.time).unref();
    if (this.idle) this.idleTimeout = setTimeout(() => this.end('idle'), this.idle).unref();
  }

  public onCollect(...args: unknown[]): void {
    if (this.filter(...args)) {
      const result = this.collect(...args);
      if (result) {
        const [key, value] = result;
        this.collected.set(key, value);
        this.emit('collect', value, key);
  
        clearTimeout(this.idleTimeout);
        this.idleTimeout = setTimeout(() => this.end('idle'), this.idle).unref();
      }
    }

    if (this.max && this.collected.size >= this.max) {
      this.end('max');
    }
  }

  public end(reason: CollectorEndReason = 'user'): void {
    clearTimeout(this.timeout);
    clearTimeout(this.idleTimeout);
    this.emit('end', this.collected, reason);
  }
}