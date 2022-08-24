import { EventEmitter } from "node:events";
import { Client } from "..";
import { CollectorEvents } from "../../types/enum";
import { CollectorOptions } from "../../types/interfaces";
import { Awaitable, CollectorEndReason, CollectorEventsMap } from "../../types/types";

export abstract class Collector<K, V> extends EventEmitter {
  public client: Client;
  public filter: (...args: unknown[]) => Awaitable<boolean>;
  public max: number;
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
    this.max = options.max ?? Infinity;
    this.time = options.time;
    this.idle = options.idle;

    this.collected = new Map();
    if (this.time) this.timeout = setTimeout(() => this.end('time'), this.time).unref();
    if (this.idle) this.idleTimeout = setTimeout(() => this.end('idle'), this.idle).unref();

    this.onCollect = this.onCollect.bind(this);
    this.end = this.end.bind(this);
  }

  public async onCollect(...args: unknown[]): Promise<void> {
    if (await this.filter(...args)) {
      const result = this.collect(...args);
      if (result) {
        const [key, value] = result;
        this.collected.set(key, value);
        this.emit(CollectorEvents.Collect, value, key);
  
        clearTimeout(this.idleTimeout);
        if (this.idle) this.idleTimeout = setTimeout(() => this.end('idle'), this.idle).unref();
      }
    }

    if (this.collected.size >= this.max) {
      this.end('max');
    }
  }

  public end(reason: CollectorEndReason = 'user'): void {
    clearTimeout(this.timeout);
    clearTimeout(this.idleTimeout);
    this.emit(CollectorEvents.End, this.collected, reason);
  }

  public override emit<T extends keyof CollectorEventsMap<K, V>>(event: T, ...args: CollectorEventsMap<K, V>[T]): boolean {
    return super.emit(event, ...args);
  }

  public override on<T extends keyof CollectorEventsMap<K, V>>(event: T, listener: (...args: CollectorEventsMap<K, V>[T]) => void): this {
    return super.on(event, listener as (...args: any[]) => void);
  }

  public override off<T extends keyof CollectorEventsMap<K, V>>(event: T, listener: (...args: CollectorEventsMap<K, V>[T]) => void): this {
    return super.off(event, listener as (...args: any[]) => void);
  }
}