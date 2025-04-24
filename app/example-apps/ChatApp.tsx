"use client"
import { useController } from "../stateman/stateman";
import { useEffect, useState, useRef } from "react";
import { ConvosController } from "../stateman/convos_controller";
import { UserController } from "../stateman/user_controller";
import Head from "next/head";
const userController_ = new UserController()

export default function Home() {
    const userController = useController(userController_);
    const isLoggedIn = userController.isLoggedIn();

    return <div>
        {isLoggedIn ? <MessengerView /> : <LoginView />}
    </div>
}

export function LoginView() {
    const userController = useController(userController_);
    const [username, setUsername] = useState("satoshi");
    const [password, setPassword] = useState("");

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Head>
                <title>Login to Messenger</title>
            </Head>
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <div>
                    <h2 className="text-center text-3xl font-bold text-gray-900">Sign in</h2>
                </div>
                <div className="space-y-4">
                    <input 
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        minLength={1}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                        type="password"
                        placeholder="Password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        onClick={() => userController.login(username, password)}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200"
                    >
                        Sign in
                    </button>
                </div>
            </div>
        </div>
    )
}

export function MessengerView() {
    // Controllers.
    const userController = useController(userController_);
    const convosController = useController(new ConvosController(userController_));
    // UI state.
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // State.
    const { conversations, selectedConversation } = convosController.state;
    const messages = convosController.getSelectedConversationMessages();

    // Handlers.
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const setSelectedConversation = (id: number) => {
        convosController.setSelectedConversation(id);
    };

    useEffect(() => {
        convosController.loadConversations();
        
        // now add like 100 messages and see how we fair
        new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
            for (let i = 0; i < 100; i++) {
                // make it a random set of words
                // actual words!!
                const vocab = ["hello", "world", "how", "are", "you", "today", "nice", "weather", "we", "have"];
                const message = Array.from({ length: Math.floor(Math.random() * 10) + 1 }, () => vocab[Math.floor(Math.random() * vocab.length)]).join(" ");
                convosController.sendMessage(message);
            }
        });
    }, []);
    
    // Scroll to bottom whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            convosController.sendMessage(newMessage);
            setNewMessage("");
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Head>
                <title>Messenger</title>
            </Head>
            {/* Conversations sidebar */}
            <div className="w-1/4 bg-white border-r">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">{userController.state.session?.userId}&apos;s chats</h2>
                </div>
                <div className="overflow-y-auto">
                    {convosController.state.convosStatus.status === "pending" ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedConversation === conv.id ? 'bg-blue-50' : ''}`}
                                onClick={() => setSelectedConversation(conv.id)}
                            >
                                <div className="font-medium">{conv.name}</div>
                                <div className="text-sm text-gray-500">{conv.lastMessage}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col">
                {/* Chat header */}
                <div className="p-4 border-b bg-white">
                    <h2 className="text-xl font-semibold">
                        {conversations.find(c => c.id === selectedConversation)?.name}
                    </h2>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                    {convosController.state.convosStatus.status === "pending" ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`mb-4 flex ${message.sender === 'Me' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[70%] rounded-lg p-3 ${
                                    message.sender === 'Me' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-200'
                                }`}>
                                    <div className="text-sm">{message.text}</div>
                                    <div className="text-xs mt-1 opacity-75">{message.timestamp}</div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div className="p-4 border-t bg-white">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                        />
                        <button 
                            onClick={handleSendMessage}
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
