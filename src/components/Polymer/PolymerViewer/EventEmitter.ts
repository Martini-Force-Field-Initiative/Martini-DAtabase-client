import { debugLog } from "../../../logger";

type Callback = (...args: any[]) => void;

export abstract class EventEmitter<EventName extends string> {
  private cbRegistry: Partial<Record<EventName, Callback[]>> = {};

  on(evt: EventName, cb: Callback, clearPrevious = false): void {
    if (clearPrevious) this.cbRegistry[evt] = [];

    this.cbRegistry[evt] = Object.hasOwn(this.cbRegistry, evt)
      ? [...this.cbRegistry[evt]!, cb]
      : [cb];
    debugLog(`Registering a ${evt} callback`);
  }

  /** Invoke every callback registered for `evt`, forwarding args. */
  protected emit(evt: EventName, ...args: any[]): void {
    this.cbRegistry[evt]?.forEach((cb) => cb(...args));
  }
}
