import { Model } from "@/app/stateman/stateman";
import { AsyncResult } from "@/app/stateman/utils";

// Types
export interface Post {
    id: string;
    userId: string;
    username: string;
    content: string;
    likes: number;
    replies: number;
    timestamp: string;
}

export interface User {
    id: string;
    username: string;
    displayName: string;
    bio: string;
    followers: number;
    following: number;
    joined: string;
}

export interface UserProfile {
    user: User;
    posts: Post[];
}

export interface HomepageState {
    posts: Post[];
    selectedPost: Post | null;
    selectedUserProfile: UserProfile | null;
    feedStatus: AsyncResult<any>;
    currentView: "feed" | "thread" | "profile";
}

export interface TweetsState {
    posts: Post[];
}

export class TweetsController extends Model<TweetsState> {
    constructor() {
        super({
            posts: [],
        });
    }

    initialiseRandom() {
        // Generate fake posts
        const users = ["satoshi", "vitalik", "gavin", "charles", "andre"];
        const contents = [
            "Just deployed a new smart contract! 🚀",
            "Thoughts on the latest ETH merge?",
            "Web3 is the future of social media",
            "Building in a bear market > building in a bull market",
            "Who's going to ETHDenver?"
        ];

        this.state.posts = Array.from({ length: 20 }, () => ({
            id: crypto.randomUUID(),
            userId: crypto.randomUUID(),
            username: users[Math.floor(Math.random() * users.length)],
            content: contents[Math.floor(Math.random() * contents.length)],
            likes: Math.floor(Math.random() * 1000),
            replies: Math.floor(Math.random() * 100),
            timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
        }));
    }

    async addPost(post: Post) {
        this.state.posts.push(post);
    }

    async getPosts() {
        return this.state.posts;
    }
}

let tweetsCtrl = new TweetsController();
export { tweetsCtrl };




// Controller
export class HomepageController extends Model<HomepageState> {
    tweetsCtrl: TweetsController;

    constructor(tweetsCtrl: TweetsController) {
        super({
            posts: [],
            selectedPost: null,
            selectedUserProfile: null,
            feedStatus: {
                status: "idle",
                data: null,
                error: null
            },
            currentView: "feed"
        });
        this.tweetsCtrl = tweetsCtrl;
    }

    async loadFeed() {
        this.state.feedStatus.status = "pending";
        await new Promise(resolve => setTimeout(resolve, 200));

        this.state.posts = await this.tweetsCtrl.getPosts();

        this.state.feedStatus.status = "success";
    }

    viewThread(post: Post) {
        this.state.selectedPost = post;
        this.state.currentView = "thread";
    }

    viewProfile(username: string) {
        // get user posts
        const userPosts = this.state.posts.filter(post => post.username === username);

        this.state.selectedUserProfile = {
            user: {
                id: crypto.randomUUID(),
                username,
                displayName: username.charAt(0).toUpperCase() + username.slice(1),
                bio: "",
                followers: Math.floor(Math.random() * 10000),
                following: Math.floor(Math.random() * 1000),
                joined: "January 2021"
            },
            posts: userPosts
        };
        this.state.currentView = "profile";
    }

    goToFeed() {
        this.state.currentView = "feed";
        this.state.selectedPost = null;
        this.state.selectedUserProfile = null;
    }
}
