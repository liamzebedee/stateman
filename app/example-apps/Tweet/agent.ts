import { Post, TweetsController } from "./controller";

interface Agent {
    username: string;
    owner: string;
    makePost(content: string): Post;
}

export class AIAgent implements Agent {
    username: string;
    owner: string;
    tweetsController: TweetsController;

    constructor(username: string, owner: string, tweetsController: TweetsController) {
        this.username = username;
        this.owner = owner;
        this.tweetsController = tweetsController;
    }

    makePost(content: string): Post {
        const post: Post = {
            id: crypto.randomUUID(),
            userId: crypto.randomUUID(),
            username: this.username,
            content: content,
            likes: 0,
            replies: 0,
            timestamp: new Date().toISOString()
        };
        this.tweetsController.addPost(post);
        return post;
    }

    async generatePost(topic: string) {
        const personalityModifications = [
            "wit",
            "charisma", 
            "eloquence",
            "cynicism",
            "optimism", 
            "wisdom",
            "sarcasm",
            "patience",
            "aggression",
            "humor",
            "empathy",
            "curiosity", 
            "humility",
            "ambition",
            "logic",
            "impulsiveness",
            "confidence",
            "creativity",
            "skepticism",
            "sincerity"
        ]
        const forms = [
            'poetry',
            'quote',
            'reference and citation',
            'logic',
            'song lyrics',
            'dialogue',
            'prose',
            'poetry',
            'quote',
            'reference and citation',
            'logic',
        ]

        // now select 5, and for each, generate a random weight between 0 and 100%, and add it to the pair so it reads "+20% wit" or "-10% sarcasm" etc.
        const selectedPersonalityModifications = personalityModifications.sort(() => Math.random() - 0.5).slice(0, 5);
        const personalityModificationsString = selectedPersonalityModifications.map(mod => `${Math.floor(Math.random() * 100)}% ${mod}`).join("\n");

        const basePrompt = `generate a tweet of max 140 chars. don't use hashtags. type in lowercase like sama does. first think of a compelling argument in your head. then output the tweet.
user: ${this.username}
topic: ${topic}
form: ${forms[Math.floor(Math.random() * forms.length)]}
personality modifications: ${personalityModificationsString}`
        const OPENAI_API_KEY = ""
        // Call OpenAI API with GPT-4.5
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: basePrompt
                    }
                ],
                max_tokens: 60,
                temperature: 0.4
            })
        });

        const data = await response.json();
        const content = data.choices[0].message.content.trim() as string;

        const post = this.makePost(content);
        
        return post;
    }
}

class AgentOwner {
    agents: Agent[];
    
    constructor() {
        this.agents = [];
    }

    addAgent(agent: Agent) {
        this.agents.push(agent);
    }

    getAgents() {
        return this.agents;
    }
}

