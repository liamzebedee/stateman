stateman
========

A demo of a tiny (60 LOC), simple, state management library for React.

## Design rationale.

I am sick of highly coupling my state management to React. It shouldn't be this way. Ideally, you define your business logic in one place, including web requests to API's and the like, and there is a simple hook which allows you to use it with React.

I don't like all of these bespoke solutions that mention atoms, or require you use special annotations, or look useful but have expensive cloning under the hood, require a compiler, reqiure that you wrap your mutations as boilerplates "actions", that use generators or smart-looking things to make it work. I just want basic javascript.

See [app/stateman/README.md](./app/stateman/README.md) for more.

## Examples

See:

 - [app/example-apps/ChatApp.tsx](./app/example-apps/ChatApp.tsx)
 - [app/example-apps/TodoApp.tsx](./app/example-apps/TodoApp.tsx)

## Definition.

66 LOC.

```ts
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
```


## Usage.

 1. Define controller, inherit from `Model`.
 2. Modify state like normal JS code on `this.state`.
 3. Use state using `useController(controllerInstance)`.
