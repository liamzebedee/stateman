declare module 'event-target-shim' {
    export class EventTarget {
        addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void;
        dispatchEvent(event: Event): boolean;
    }
} 