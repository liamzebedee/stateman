import { Model } from "./stateman";

interface WalletState {
    
}

class WalletController extends Model<WalletState> {
    constructor() {
        super({});
    }
}

export const walletController = new WalletController();