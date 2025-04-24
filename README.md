stateman
========

A demo of a tiny (60 LOC), simple, state management library for React.

## Design rationale.

I am sick of highly coupling my state management to React. It shouldn't be this way. Ideally, you define your business logic in one place, including web requests to API's and the like, and there is a simple hook which allows you to use it with React.

React code suffers from insane control flow, whereby logic is continually jumping around the place. And why? It does not seem to improve application UX. 

I don't like all of these bespoke solutions that mention atoms, or require you use special annotations, require `Context`'s everywhere, look useful but have expensive cloning under the hood, require a compiler, reqiure that you wrap your mutations as boilerplates "actions", that use generators or smart-looking things to make it work. 

All I want is basic javascript.

## What is stateman?

Stateman is basically the ViewController pattern for React. It's extremely simple and straightforward. You define a class that has state and methods (mutations like addTodo, getters like getTodo, async too).

Unlike other state management solutions, stateman is basically plain JS. There are no new patterns to learn, there's no special syntax, there's no boilerplate. Stateman looks like regular JS, and it's only 60 lines of code with no external libraries.

It's really easy to define controllers, and then use their state in different places. There's no `Context`, there's no deep copying or performance overhead.

Let me show you:

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
  // ...
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

Stateman controllers can be global singletons, meaning you can use their state in different places. That's pretty simple:

```ts
const userController$ = new UserController()

const Login = () => {
    const userController = useController(userController$)
    return <div>
        <button onClick={userController.login()}>
    </div>
}

const LoggedInView = () => {
    const userController = useController(userController$)
    return userController.state.getSession().username
}
```

They can also just be instantiated, meaning you can use the same controller logic for many instances of a component, e.g.:

```ts
const ReplyToComment = ({ commentId }: { commentId: number }) => {
    const postCommentController = useController(new PostCommentController(commentId))
    // ...
}

const Article = () => {
    const comments = ['a', 'b', 'c']
    return <div>
        {comments.map((comment, i) => {
            return <li key={i}>
                <span>{comment}</span>
                <ReplyToComment commentId={i}/>
            </li>
        })}
    </div>
}
```

## What's good about this approach?

The fastest code is the code that doesn't exist. When you identify the problem you're solving (business logic and state), separate it from the other problem (UI logic and state), you find that they have different optimization criteria. 

UI elements like charts deserve interactivity, which inherently involves functions and state. But there's no reason we need to intermix this with business logic. Business logic is oftentimes really simple and straightforward. 

Rather than jumping to use contexts, why not use a single global variable? Why do we use context? Likewise - rather than invoking methods like `useState`, writing custom async function handlers (`useHook`, `Suspense`), writing leagues of littered control flow which depends on the variables of previous methods - why not just have a single function which runs a bunch of imperative sequential statements? 

I never learnt the answer. But I've been building web applications since JQuery and PHP. And I find I really don't need any of the stuff React offers me except JSX and `useState`/`useHook` for making UI elements really interactive.

Web application development can really be broken down into three different problems:

 1. Static websites. HTML, blogs.
 2. SaaS applications. Users, sessions, records, API calls.
 3. Web software. Photopea, Figma, Facebook, etc.

Stateman is designed to solve for #2.

## How does it work?

The library follows the ViewController pattern found in most UI systems (Cocoa, C#). 

You define your `Controller` class, which inherits from `Model`.

`Model` has single member variable `state`.

The state (`this.state`) is wrapped in a `Proxy`, meaning we can track when there are mutations by overriding `set`. 

When a mutation happens, the `Proxy` emits an event via an `EventTarget` that we pass into it.

This gives us a simple class where we can subscribe to mutations, without using special syntax to clone the state, or requiring users to return deep copies of it. 

How do we connect this to React?

`useController` is a React hook which allows us to use this state in React, and re-render when it changes.

 - maintains a small `tick` variable, which counts the number of state mutations.
 - listen to changes on `state` by subscribing to `Model.EventTarget`
 - calls `setTick` when there is a new mutation, which triggers React to re-render the component using the state in the controller.

The state is updated instantly inside the `Model` upon changes. Upon calling `setTick(tick+1)`, React will re-render with this new state.

See [app/stateman/README.md](./app/stateman/README.md) for more.

## Usage.

This isn't a library yet, but the code is 60 LOC. Take a look in the repo.

## Examples

See:

 - [app/example-apps/ChatApp.tsx](./app/example-apps/ChatApp.tsx)
 - [app/example-apps/TodoApp.tsx](./app/example-apps/TodoApp.tsx)

## Usage.

 1. Define controller, inherit from `Model`.
 2. Modify state like normal JS code on `this.state`.
 3. Use state using `useController(controllerInstance)`.
