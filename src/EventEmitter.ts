export interface EventEmitterOptions<EventPayload = any> {
  logger?: (log: string, payload?: EventPayload) => void;
}

export type EventHandler<EventPayload> =
  | ((payload: EventPayload) => Promise<void> | void)
  | null
  | undefined;

export class EventEmitter<EventPayload> {
  private handlerCount = 0;

  // Keyed by handler id so that `off`/`delete` can actually reclaim the slot.
  // The previous implementation pushed into an array and only nulled entries
  // on removal, so the backing array grew without bound across every
  // subscribe/dispose cycle (e.g. each tree mount/unmount) — a memory leak.
  private handlers = new Map<number, EventHandler<EventPayload>>();

  private options?: EventEmitterOptions<EventPayload>;

  constructor(options?: EventEmitterOptions<EventPayload>) {
    this.options = options;
  }

  public get numberOfHandlers() {
    return this.handlers.size;
  }

  public async emit(payload: EventPayload): Promise<void> {
    const promises: Array<Promise<void>> = [];

    this.options?.logger?.('emit', payload);

    this.handlers.forEach(handler => {
      if (handler) {
        const res = handler(payload) as Promise<void>;
        if (typeof res?.then === 'function') {
          promises.push(res);
        }
      }
    });

    await Promise.all(promises);
  }

  public on(handler: EventHandler<EventPayload>): number {
    this.options?.logger?.('on');
    // eslint-disable-next-line no-plusplus
    const handlerId = this.handlerCount++;
    this.handlers.set(handlerId, handler);
    return handlerId;
  }

  public off(handlerId: number) {
    this.delete(handlerId);
  }

  public delete(handlerId: number) {
    this.options?.logger?.('off');
    this.handlers.delete(handlerId);
  }
}
