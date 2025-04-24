import { Model } from "./stateman";
import { AsyncResult } from "./utils";

interface Session {
    id: string;
    userId: string;
    expiresAt: number;
}

interface UserControllerState {
    session: Session | null;

    loginStatus: AsyncResult<any>;
}

export class UserController extends Model<UserControllerState> {
    constructor() {
        super({
            session: null,
            loginStatus: {
                status: "idle",
                data: null,
                error: null,
            },
        });
    }

    isLoggedIn() {
        return this.state.session !== null;
    }

    getSession() {
        return this.state.session!;
    }
    
    async login(username: string, password: string) {
        // Simulate a request login over 250ms.
        this.state.loginStatus.status = "pending";
        await new Promise(resolve => setTimeout(resolve, 250));
        this.state.session = {
            id: crypto.randomUUID(),
            userId: username,
            expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
        };
        this.state.loginStatus.status = "success";
    }
}

