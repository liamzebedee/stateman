"use client"
import { useController } from "../../stateman/stateman";
import { Model } from "../../stateman/stateman";
import { useEffect, useState } from "react";
import Head from "next/head";
import { AsyncResult } from "../../stateman/utils";
import { HomepageController, Post, tweetsCtrl } from "./controller";
import { AIAgent } from "./agent";


async function setupFeed() {
    const agents = [
        new AIAgent("ayn_rand", "system", tweetsCtrl),
        new AIAgent("satoshi_nakamoto", "system", tweetsCtrl),
        // new AIAgent("richard_k_bernstein", "system", tweetsCtrl),
        // new AIAgent("jiri_lev", "system", tweetsCtrl),
        // new AIAgent("patrick_collison", "system", tweetsCtrl),
        // new AIAgent("elon_musk", "system", tweetsCtrl),
        new AIAgent("jazz_masterclass", "system", tweetsCtrl),
        // new AIAgent("century_of_self", "system", tweetsCtrl),
        // new AIAgent("steve_jobs", "system", tweetsCtrl),
        // new AIAgent("ralph_waldo_emerson", "system", tweetsCtrl),
        // new AIAgent("naval_ravikant", "system", tweetsCtrl),
        new AIAgent("lee_kuan_yew", "system", tweetsCtrl),
        // new AIAgent("sam_altman", "system", tweetsCtrl),
        // new AIAgent("richard_stallman", "system", tweetsCtrl),
        // new AIAgent("george_hotz", "system", tweetsCtrl),
        // new AIAgent("richard_feynmann", "system", tweetsCtrl),
        // new AIAgent("paul_graham", "system", tweetsCtrl),
        new AIAgent("ray_dalio", "system", tweetsCtrl),
        // new AIAgent("nassim_taleb", "system", tweetsCtrl),
        // new AIAgent("peter_thiel", "system", tweetsCtrl),
        // new AIAgent("elad_gil", "system", tweetsCtrl),
        // new AIAgent("federico_carrone", "system", tweetsCtrl),
        // new AIAgent("bryan_johnson", "system", tweetsCtrl),
    ]

    for (const agent of agents) {
        await agent.generatePost("trump's tariffs");
    }
}

// Components
const PostView = ({ post, controller, showReply = false }: { post: Post, controller: HomepageController, showReply?: boolean }) => {
    const [replyText, setReplyText] = useState("");

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (replyText.trim()) {
                // Add reply logic here
                setReplyText("");
            }
        }
    };

    return (
        <div className="border-b p-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-start gap-3">
                <div 
                    className="w-12 h-12 rounded-full bg-gray-200"
                    onClick={(e) => {
                        e.stopPropagation();
                        controller.viewProfile(post.username);
                    }}
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span 
                            className="font-bold hover:underline"
                            onClick={(e) => {
                                e.stopPropagation();
                                controller.viewProfile(post.username);
                            }}
                        >{post.username}</span>
                        <span className="text-gray-500">· {new Date(post.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-2">{post.content}</p>
                    <div className="flex gap-6 mt-2 text-gray-500">
                        <button 
                            className="hover:text-blue-500 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                controller.viewThread(post);
                            }}
                        >
                            💬 {post.replies}
                        </button>
                        <button className="hover:text-red-500 transition-colors">
                            ❤️ {post.likes}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ThreadView = ({ controller }: { controller: HomepageController }) => {
    const post = controller.state.selectedPost!;
    const [replyText, setReplyText] = useState("");

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (replyText.trim()) {
                // Add reply logic here
                setReplyText("");
            }
        }
    };

    return (
        <div>
            <div className="p-4 border-b">
                <button 
                    onClick={() => controller.goToFeed()}
                    className="text-blue-500 hover:underline"
                >
                    ← Back to feed
                </button>
            </div>
            <PostView post={post} controller={controller} />
            <div className="p-4 border-b">
                <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Post your reply..."
                    className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                />
            </div>
            <div className="p-4 text-gray-500 text-center">
                No replies yet
            </div>
        </div>
    );
};

const ProfileView = ({ controller }: { controller: HomepageController }) => {
    const user = controller.state.selectedUserProfile!.user;
    return (
        <div>
            <div className="p-4 border-b">
                <button 
                    onClick={() => controller.goToFeed()}
                    className="text-blue-500 hover:underline"
                >
                    ← Back to feed
                </button>
            </div>
            <div className="p-4 border-b">
                <div className="w-24 h-24 rounded-full bg-gray-200 mb-4" />
                <h2 className="text-xl font-bold">{user.displayName}</h2>
                <div className="text-gray-500">@{user.username}</div>
                <p className="mt-2">{user.bio}</p>
                <div className="flex gap-4 mt-4 text-gray-500">
                    <span><b>{user.following}</b> Following</span>
                    <span><b>{user.followers}</b> Followers</span>
                </div>
                <div className="mt-2 text-gray-500">
                    Joined {user.joined}
                </div>
            </div>
            <div className="p-4">
                {controller.state.selectedUserProfile!.posts.map(post => (
                    <PostView key={post.id} post={post} controller={controller} />
                ))}
            </div>
        </div>
    );
};

// Main App
export default function FlixApp() {
    const controller = useController(new HomepageController(tweetsCtrl));
    const { posts, currentView, feedStatus } = controller.state;

    useEffect(() => {
        async function x() {
            await setupFeed()
            controller.loadFeed();
        }
        x()
    }, []);

    return (
        <div className="max-w-2xl mx-auto">
            <Head>
                <title>Flix - Web3 Social</title>
            </Head>

            {currentView === "feed" && (
                <div>
                    <div className="sticky top-0 bg-white p-4 border-b">
                        <h1 className="text-xl font-bold">Home</h1>
                    </div>
                    
                    {feedStatus.status === "pending" ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        </div>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} onClick={() => controller.viewThread(post)}>
                                <PostView post={post} controller={controller} />
                            </div>
                        ))
                    )}
                </div>
            )}

            {currentView === "thread" && <ThreadView controller={controller} />}
            {currentView === "profile" && <ProfileView controller={controller} />}
        </div>
    );
}
