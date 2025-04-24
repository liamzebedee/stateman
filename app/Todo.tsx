"use client"
import { TodoListController } from "./stateman/todo_controller";
import { useController } from "./stateman/stateman";
import { useEffect, useState } from "react";

const TodoList = ({ todoController }: { todoController: TodoListController }) => {
    return (
        <div>
            <h1>Todo List</h1>
            <ul className="list-none w-full max-w-md">
                {todoController.state.todos.map((todo: string, index: number) => (
                    <li
                        key={index}
                        className="flex items-center gap-2 mb-2 p-2 border rounded"
                    >
                        <input
                            type="text"
                            value={todo}
                            onChange={(e) => {
                                todoController.editTodo(index, e.target.value);
                            }}
                            className="flex-1 border-none focus:outline-none"
                        />
                    </li>
                ))}
            </ul>
        </div>
    )
}

const TodoListRoasted = ({ todoController }: { todoController: TodoListController }) => {
    return (
        <div>
            <h1>Todo List</h1>
            <ul className="list-none w-full max-w-md">
                {todoController.state.todos.map((todo: string, index: number) => (
                    <li
                        key={index}
                        className="flex items-center gap-2 mb-2 p-2 border rounded"
                    >
                        <span style={{ fontFamily: 'Comic Sans MS, cursive' }}>{todo}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default function Home() {
    const todoController = useController(new TodoListController());
    const [newTodo, setNewTodo] = useState("");

    useEffect(() => {
        todoController.startProgress();
    }, [])

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <h1 className="text-2xl font-bold">Todo List</h1>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        className="border rounded px-2 py-1"
                        placeholder="Add new todo"
                    />
                    <button
                        onClick={() => {
                            if (newTodo.trim()) {
                                todoController.addTodo(newTodo);
                                setNewTodo("");
                            }
                        }}
                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                    >
                        Add
                    </button>
                </div>

                {/* Simple progress bar */}
                <div className="w-full h-4 bg-gray-200 rounded-full">
                    <div className="h-full bg-blue-500" style={{ width: `${todoController.state.progress}%` }}></div>
                </div>

                <div className="grid grid-cols-2 gap-8 w-full">
                    <TodoList todoController={todoController} />
                    <TodoListRoasted todoController={todoController} />
                </div>

                <button
                    onClick={() => {
                        for (let i = 1; i <= 100; i++) {
                            todoController.addTodo(`Todo item ${i}`);
                        }
                    }}
                    className="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600"
                >
                    Add 100 Todos
                </button>
            </main>

            <footer className="row-start-3 text-sm text-gray-500">
                Simple Todo List App
            </footer>
        </div>
    );
}
