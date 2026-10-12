/**
 * 轻量解耦事件总线 (EventBus)
 */

export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(handler);
    }
  }

  emit(event, payload) {
    if (this.listeners.has(event)) {
      for (const handler of this.listeners.get(event)) {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[EventBus] Error in event listener for ${event}:`, err);
        }
      }
    }
  }

  clear() {
    this.listeners.clear();
  }
}

export const globalEventBus = new EventBus();
