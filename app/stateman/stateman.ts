// stateman.ts

import { useEffect, useState, useSyncExternalStore } from 'react';
import { EventTarget } from 'event-target-shim';

type Subscriber = () => void;

function makeHandler(events: EventTarget): ProxyHandler<any> {
    return {
        get(target, prop, receiver) {
            const val = Reflect.get(target, prop, receiver);
            if (val && typeof val === 'object') {
                // Handle nested objects and arrays with the same proxy
                return new Proxy(val, makeHandler(events));
            }
            return val;
        },
        set(target, prop, value, receiver) {
            const prev = target[prop];
            const ok = Reflect.set(target, prop, value, receiver);
            if (prev !== value) {
                events.dispatchEvent(new Event('change'));
            }
            return ok;
        },
        deleteProperty(target, prop) {
            const ok = Reflect.deleteProperty(target, prop);
            events.dispatchEvent(new Event('change'));
            return ok;
        }
    };
}

export class Model<T extends object> {
    protected _state: T;
    private _stateEventTarget: EventTarget;

    get state() {
        return this._state;
    }

    constructor(initialState: T) {
        const stateEventTarget = new EventTarget();
        this._state = new Proxy(initialState, makeHandler(stateEventTarget));
        this._stateEventTarget = stateEventTarget;
    }

    subscribe(fn: Subscriber): () => void {
        this._stateEventTarget.addEventListener('change', () => {
            fn();
        });
        return () => this._stateEventTarget.removeEventListener('change', fn);
    }
}

export function useController<T extends Model<any>>(ctrl: T): T {
    // This preserves the reference to the controller.
    const [ctrl$, setState] = useState<T>(ctrl);
    
    // This re-renders the component when the state changes, without requiring state be compared.
    // We already know state has changed, because we're using a proxy. React can determine what has changed.
    const [tick, setTick] = useState(0)
    useEffect(() => ctrl$.subscribe(() => setTick(t => t + 1)), [ctrl$])

    return ctrl$;
}


