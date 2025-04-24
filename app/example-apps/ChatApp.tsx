"use client"
import { useController } from "../stateman/stateman";
import { useEffect, useState, useRef } from "react";
import { ConvosController } from "../stateman/convos_controller";


export default function Home() {
    const [newMessage, setNewMessage] = useState("");
    const convosController = useController(new ConvosController());
    const { conversations, selectedConversation } = convosController.state;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const setSelectedConversation = (id: number) => {
        convosController.setSelectedConversation(id);
    };

    // now add like 100 messages and see how we fair
    useEffect(() => {
        for (let i = 0; i < 100; i++) {
            // make it a random set of words
            // actual words!!
            const vocab = ["hello", "world", "how", "are", "you", "today", "nice", "weather", "we", "have"];
            const message = Array.from({ length: Math.floor(Math.random() * 10) + 1 }, () => vocab[Math.floor(Math.random() * vocab.length)]).join(" ");
            convosController.sendMessage(message);
        }
    }, []);

    const messages = convosController.getSelectedConversationMessages();

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
            {/* Conversations sidebar */}
            <div className="w-1/4 bg-white border-r">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Conversations</h2>
                </div>
                <div className="overflow-y-auto">
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedConversation === conv.id ? 'bg-blue-50' : ''}`}
                            onClick={() => setSelectedConversation(conv.id)}
                        >
                            <div className="font-medium">{conv.name}</div>
                            <div className="text-sm text-gray-500">{conv.lastMessage}</div>
                        </div>
                    ))}
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
                    {messages.map((message) => (
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
                    ))}
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
