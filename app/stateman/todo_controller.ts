import { Model } from './stateman';

interface TodosState {
    todos: string[]
    progress: number
}

export class TodoListController extends Model<TodosState> {
    constructor() {
        super({ 
            todos: [],
            progress: 0,
        });
    }

    async startProgress(): Promise<void> {
        // tick for 5s, counting to 100, tick length is dynamic
        const tickLength = 5000 / 100;
        for (let i = 0; i < 100; i++) {
            this.state.progress = i;
            await new Promise(resolve => setTimeout(resolve, tickLength));
        }
        this.state.progress = 100;
    }

    getTodos(): string[] {
        return this.state.todos;
    }

    async addTodo(text: string): Promise<void> {
        this.state.todos.push(text);
        // wait then sort
        await new Promise(resolve => setTimeout(resolve, 100));
        this.state.todos.sort();
    }

    editTodo(index: number, text: string): void {
        this.state.todos[index] = text;
        this.state.todos.sort();
    }
}

