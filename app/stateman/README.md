stateman
========

A really dumb straightforward state management system in 60 lines of React, no libraries.

## How does it work?

The library follows the ViewController pattern found in most UI systems (Cocoa, C#). 

You define your `Controller` class, which inherits from `Model`.

`Model` has single member variable `state` and a set of methods that mutate it.

The state (`this.state`) is wrapped in a `Proxy`, meaning we can track when there are updates by overriding `get` and `set`. 

When a mutation happens, the `Proxy` emits an event via an `EventTarget` that we pass into it.

This gives us a simple class where we can subscribe to mutations, without using special syntax to clone the state, or requiring users to return deep copies of it. 

How do we connect this to React?

`useController` is a React hook which allows us to use this state in React, and re-render when it changes.

 - maintains a small `tick` variable, which counts the number of state mutations.
 - listen to changes on `state` by subscribing to `Model.EventTarget`
 - calls `setTick` when there is a new mutation, which triggers React to re-render the component using the controller.

## Problems with other approaches.

I am sick of highly coupling my state management to React. It shouldn't be this way. Ideally, you define your business logic in one place, including web requests to API's and the like, and there is a simple hook which allows you to use it with React.

I don't like all of these bespoke solutions that mention atoms, or require you use special annotations, or look useful but have expensive cloning under the hood, require a compiler, reqiure that you wrap your mutations as boilerplates "actions", that use generators or smart-looking things to make it work. I just want basic javascript.

There are three classes of problems you're solving on the web:

 1. Building a web site. Static HTML.
 2. Building a SaaS application. Typical CRUD routes. Minimal frontend state, form editing, rendering, etc.
 3. Building software. Like Figma. These have complex state management needs and engines.

This library solves for #2. 

Anti-design areas:

**Highly coupled with React**. Controllers don't use any React API's. You can test them as they were regular JS code. Coupling tightly with React is not a useful feature.

**Highly coupled with single state store**. The original Flux design was useful because you could define separate stores that functioned independently of each other. Coupling stores into one single reduced store is tight coupling, which isn't ideal for flexibility. It's ideallic when it comes to a functional programming lens - but we are most productive when programming imperatively. This means - it's easy to define instances of controllers and drop them in where they're useful using `useController`. We don't need 100 top-layer nested `Context`'s in order to make this work.

**Bespokeness**. Purposefully, this library does not use generators, it doesn't use async, it doesn't require annotations, it doesn't require defining mutations as their own (e.g. redux actions), it doesn't have its own language (atoms, etc), it doesn't have a special syntax, it's just vanilla JS with vanilla runtime API's.

## Useful features.

The first thing is singletons. Sometimes, you only need one controller for an application. For example, the user session. This can be defined outside of React components.

```tsx
const userSessionController = new UserSessionController()
const Component = () => {
    const userSession = useController(userSessionController)
}
```

The second thing is instances. Sometimes, you want to use the controller as something we can instantiate in many different places - ie. two different todo lists. We can do this easily too, and it's the normal way. `useController(new TodosListController())` suffices.

```tsx
const Component = () => {
    const todos1 = useController(new TodoListController())
    const todos2 = useController(new TodoListController())
}
```


## Usage.

Define **controllers**. Controllers are just regular JS classes with a `state` that can be modified in-place.

```ts
interface TodosState {
    todos: string[]
}

export class TodoListController extends Model<TodosState> {
    constructor() {
        super({ todos: [] });
    }

    getTodos(): string[] {
        return this.state.todos;
    }

    addTodo(text: string): void {
        this.state.todos.push(text);
    }

    editTodo(index: number, text: string): void {
        this.state.todos[index] = text;
    }
}
```

Use controllers in your views with `useController`:

```ts
export default function Home() {
  const todoController = useController(new TodoListController());
```

Call methods on the controllers to update state:

```ts
return <div>
    <button onClick={() => todosController.addTodo("test")}/>
    <button onClick={() => todosController.editTodo(0, "test-edited")}/>
</div>
```

Render the state from a controller:

```ts
return <div>
    {todoController.state.todos.map((todo, i) => {
        return <div key={i}>{todo}</div>
    })}
</div>
```

