import { Model } from "./stateman";
import { UserController } from "./user_controller";
import { AsyncResult } from "./utils";

interface Message {
    id: number;
    convoId: string;
    sender: string;
    text: string;
    timestamp: string;
}

interface Conversation {
    id: number;
    convoId: string;
    name: string;
    lastMessage: string;
}

interface ConvosState {
    conversations: Conversation[];
    messages: Message[];
    selectedConversation: number;

    convosStatus: AsyncResult<any>;
}

export class ConvosController extends Model<ConvosState> {
    private userController: UserController;

    constructor(userController: UserController) {
        super({
            selectedConversation: 0,
            conversations: [
            ],
            messages: [
            ],
            convosStatus: {
                status: "idle",
                data: null,
                error: null,
            },
        });

        this.userController = userController;
    }

    async loadConversations() {
        this.state.convosStatus.status = "pending";
        await new Promise(resolve => setTimeout(resolve, 250));
        this.state.conversations = [
            { id: 0, convoId: "convo_0", name: "John Doe", lastMessage: "Hey there!" },
            { id: 1, convoId: "convo_1", name: "Jane Smith", lastMessage: "How are you?" }, 
            { id: 2, convoId: "convo_2", name: "Bob Wilson", lastMessage: "See you later!" }
        ]
        this.state.messages = [
            { id: 0, convoId: "convo_0", sender: "John Doe", text: "Hey there!", timestamp: "10:00 AM" },
            { id: 1, convoId: "convo_1", sender: this.userController.getSession().userId, text: "Hi! How are you?", timestamp: "10:01 AM" },
            { id: 2, convoId: "convo_2", sender: "Bob Wilson", text: "I'm good, thanks!", timestamp: "10:02 AM" }
        ]
        this.state.convosStatus.status = "success";
    }

    setSelectedConversation(id: number) {
        this._state.selectedConversation = id;
    }

    sendMessage(text: string) {
        const conversation = this._state.conversations.find(
            c => c.id === this._state.selectedConversation
        );

        if (!conversation) return;

        const newMessage: Message = {
            id: this._state.messages.length,
            convoId: conversation.convoId,
            sender: "Me",
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        
        this._state.messages.push(newMessage);
        
        // Update last message in conversation
        conversation.lastMessage = text;
    }

    getSelectedConversationMessages(): Message[] {
        const conversation = this._state.conversations.find(c => c.id === this._state.selectedConversation);
        if (!conversation) return [];
        
        return this._state.messages.filter(message => message.convoId === conversation.convoId);
    }
}
