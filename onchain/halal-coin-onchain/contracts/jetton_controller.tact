// HALAL COIN Jetton Implementation
// Based on TEP-74 Standard
// https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md

import "@stdlib/deploy";
import "@stdlib/ownable";

// ============================================
// Message Structures (TEP-74 Standard)
// ============================================

/// Update Jetton content/metadata
message(0xcb862902) JettonUpdateContent {
    queryId: Int as uint64;
    content: Cell;
}

/// Transfer Jettons from wallet to wallet
message(0xf8a7ea5) JettonTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
    responseDestination: Address?;
    customPayload: Cell? = null;
    forwardTonAmount: Int as coins;
    forwardPayload: Slice as remaining;
}

/// Internal transfer message between Jetton wallets
message(0x178d4519) JettonTransferInternal {
    queryId: Int as uint64;
    amount: Int as coins;
    sender: Address;
    responseDestination: Address?;
    forwardTonAmount: Int as coins;
    forwardPayload: Slice as remaining;
}

/// Notification sent to destination wallet after transfer
message(0x7362d09c) JettonTransferNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    sender: Address;
    forwardPayload: Slice as remaining;
}

/// Burn Jettons (remove from circulation)
message(0x595f07bc) JettonBurn {
    queryId: Int as uint64;
    amount: Int as coins;
    responseDestination: Address?;
    customPayload: Cell? = null;
}

/// Notification to master about burned Jettons
message(0x7bdd97de) JettonBurnNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    sender: Address;
    responseDestination: Address?;
}

/// Return excesses (cashback)
message(0xd53276db) JettonExcesses {
    queryId: Int as uint64;
}

/// Mint new Jettons (only for owner)
message Mint {
    queryId: Int as uint64;
    receiver: Address;
    amount: Int as coins;
    forwardTonAmount: Int as coins;
    forwardPayload: Slice as remaining;
}

/// Disable minting permanently (only owner)
message DisableMint {
    queryId: Int as uint64;
}

/// Request wallet address for a given owner
message(0x2c76b973) ProvideWalletAddress {
    queryId: Int as uint64;
    ownerAddress: Address;
    includeAddress: Bool;
}

/// Response with wallet address
message(0xd1735400) TakeWalletAddress {
    queryId: Int as uint64;
    walletAddress: Address;
    ownerAddress: Address?;
}

// ============================================
// Data Structures
// ============================================

struct JettonMasterData {
    totalSupply: Int as coins;
    mintable: Bool;
    adminAddress: Address;
    jettonContent: Cell;
    jettonWalletCode: Cell;
}

struct JettonWalletData {
    balance: Int as coins;
    owner: Address;
    master: Address;
    jettonWalletCode: Cell;
}

// ============================================
// Constants
// ============================================

const MinTonForStorage: Int = ton("0.01");
const GasConsumption: Int = ton("0.015");

// ============================================
// Jetton Master Contract
// ============================================

contract JettonController with Deployable {
    
    totalSupply: Int as coins;
    owner: Address;
    jettonContent: Cell;
    mintable: Bool = true;

    init(totalSupply: Int, owner: Address, jettonContent: Cell) {
        self.totalSupply = totalSupply;
        self.owner = owner;
        self.jettonContent = jettonContent;
        self.mintable = true;
    }

    // Receive burn notifications from Jetton Wallets
    receive(msg: JettonBurnNotification) {
        // Verify sender is a valid Jetton Wallet
        let walletInit: StateInit = self.getJettonWalletInit(msg.sender);
        require(sender() == contractAddress(walletInit), "Invalid sender");

        // Decrease total supply
        self.totalSupply -= msg.amount;

        // Send cashback if needed
        if (msg.responseDestination != null) {
            send(SendParameters{
                to: msg.responseDestination!!,
                body: JettonExcesses{
                    queryId: msg.queryId
                }.toCell(),
                value: 0,
                bounce: false,
                mode: SendRemainingValue | SendIgnoreErrors
            });
        }
    }

    // Update Jetton content/metadata (only owner)
    receive(msg: JettonUpdateContent) {
        require(sender() == self.owner, "Only owner can update content");
        self.jettonContent = msg.content;
    }

    // Mint new Jettons (only owner)
    receive(msg: Mint) {
        require(sender() == self.owner, "Only owner can mint");
        require(self.mintable, "Minting is disabled");

        // Increase total supply
        self.totalSupply += msg.amount;

        // Deploy or notify Jetton Wallet
        let walletInit: StateInit = self.getJettonWalletInit(msg.receiver);
        send(SendParameters{
            to: contractAddress(walletInit),
            value: 0,
            bounce: true,
            mode: SendRemainingValue,
            body: JettonTransferInternal{
                queryId: msg.queryId,
                amount: msg.amount,
                sender: myAddress(),
                responseDestination: self.owner,
                forwardTonAmount: msg.forwardTonAmount,
                forwardPayload: msg.forwardPayload
            }.toCell(),
            code: walletInit.code,
            data: walletInit.data
        });
    }

    // Change owner (only current owner)
    receive(msg: ChangeOwner) {
        require(sender() == self.owner, "Only owner can change owner");
        self.owner = msg.newOwner;
    }

    // Disable minting permanently (only owner, irreversible)
    receive(msg: DisableMint) {
        require(sender() == self.owner, "Only owner can disable mint");
        require(self.mintable, "Minting already disabled");
        self.mintable = false;
    }

    // Provide wallet address for a given owner
    receive(msg: ProvideWalletAddress) {
        let walletInit: StateInit = self.getJettonWalletInit(msg.ownerAddress);
        send(SendParameters{
            to: sender(),
            value: 0,
            mode: SendRemainingValue,
            body: TakeWalletAddress{
                queryId: msg.queryId,
                walletAddress: contractAddress(walletInit),
                ownerAddress: msg.includeAddress ? msg.ownerAddress : null
            }.toCell()
        });
    }

    // Get Jetton data (TEP-74 standard)
    get fun get_jetton_data(): JettonMasterData {
        return JettonMasterData{
            totalSupply: self.totalSupply,
            mintable: self.mintable,
            adminAddress: self.owner,
            jettonContent: self.jettonContent,
            jettonWalletCode: self.getJettonWalletCode()
        };
    }

    // Get wallet address for a given owner
    get fun get_wallet_address(ownerAddress: Address): Address {
        let walletInit: StateInit = self.getJettonWalletInit(ownerAddress);
        return contractAddress(walletInit);
    }

    // Helper: Get Jetton Wallet init
    fun getJettonWalletInit(ownerAddress: Address): StateInit {
        return initOf JettonWallet(ownerAddress, myAddress());
    }

    // Helper: Get Jetton Wallet code
    fun getJettonWalletCode(): Cell {
        return initOf JettonWallet(self.owner, myAddress()).code;
    }
}

// ============================================
// Jetton Wallet Contract
// ============================================

contract JettonWallet with Deployable {
    
    balance: Int as coins = 0;
    owner: Address;
    master: Address;

    init(owner: Address, master: Address) {
        self.balance = 0;
        self.owner = owner;
        self.master = master;
    }

    // Transfer Jettons to another wallet
    receive(msg: JettonTransfer) {
        let ctx: Context = context();
        
        // Only owner can transfer
        require(ctx.sender == self.owner, "Only owner can transfer");

        // Check balance
        self.balance -= msg.amount;
        require(self.balance >= 0, "Insufficient balance");

        // Calculate fees
        let fwdCount: Int = 1;
        if (msg.forwardTonAmount > 0) {
            fwdCount = 2;
        }
        let fwdFee: Int = ctx.readForwardFee() * fwdCount;
        
        require(
            ctx.value > msg.forwardTonAmount + fwdFee + 2 * GasConsumption + MinTonForStorage,
            "Insufficient TON for transfer"
        );

        // Send transfer to destination wallet
        let walletInit: StateInit = initOf JettonWallet(msg.destination, self.master);
        send(SendParameters{
            to: contractAddress(walletInit),
            value: 0,
            mode: SendRemainingValue,
            bounce: true,
            body: JettonTransferInternal{
                queryId: msg.queryId,
                amount: msg.amount,
                sender: self.owner,
                responseDestination: msg.responseDestination,
                forwardTonAmount: msg.forwardTonAmount,
                forwardPayload: msg.forwardPayload
            }.toCell(),
            code: walletInit.code,
            data: walletInit.data
        });
    }

    // Receive internal transfer
    receive(msg: JettonTransferInternal) {
        let ctx: Context = context();
        
        // Verify sender (should be master or another wallet)
        if (sender() != self.master) {
            let walletInit: StateInit = initOf JettonWallet(msg.sender, self.master);
            require(sender() == contractAddress(walletInit), "Invalid sender");
        }

        // Increase balance
        self.balance += msg.amount;

        // Forward notification if requested
        if (msg.forwardTonAmount > 0) {
            send(SendParameters{
                to: self.owner,
                value: msg.forwardTonAmount,
                mode: SendPayGasSeparately,
                bounce: false,
                body: JettonTransferNotification{
                    queryId: msg.queryId,
                    amount: msg.amount,
                    sender: msg.sender,
                    forwardPayload: msg.forwardPayload
                }.toCell()
            });
        }

        // Reserve storage and send cashback
        let tonBalanceBeforeMsg: Int = myBalance() - ctx.value;
        let storageReserve: Int = MinTonForStorage;
        if (tonBalanceBeforeMsg > storageReserve) {
            storageReserve = tonBalanceBeforeMsg;
        }
        nativeReserve(storageReserve, ReserveAtMost);

        if (msg.responseDestination != null) {
            send(SendParameters{
                to: msg.responseDestination!!,
                value: 0,
                mode: SendRemainingBalance | SendIgnoreErrors,
                bounce: false,
                body: JettonExcesses{
                    queryId: msg.queryId
                }.toCell()
            });
        }
    }

    // Burn Jettons
    receive(msg: JettonBurn) {
        let ctx: Context = context();
        
        // Only owner can burn
        require(ctx.sender == self.owner, "Only owner can burn");

        // Check balance
        self.balance -= msg.amount;
        require(self.balance >= 0, "Insufficient balance");

        // Calculate fees
        let fwdFee: Int = ctx.readForwardFee();
        require(ctx.value > fwdFee + 2 * GasConsumption + MinTonForStorage, "Insufficient TON");

        // Notify master about burn
        send(SendParameters{
            to: self.master,
            value: 0,
            mode: SendRemainingValue,
            bounce: true,
            body: JettonBurnNotification{
                queryId: msg.queryId,
                amount: msg.amount,
                sender: self.owner,
                responseDestination: msg.responseDestination
            }.toCell()
        });
    }

    // Handle bounced messages (failed transfers)
    bounced(msg: bounced<JettonTransferInternal>) {
        self.balance += msg.amount;
    }

    bounced(msg: bounced<JettonBurnNotification>) {
        self.balance += msg.amount;
    }

    // Get wallet data
    get fun get_wallet_data(): JettonWalletData {
        return JettonWalletData{
            balance: self.balance,
            owner: self.owner,
            master: self.master,
            jettonWalletCode: myCode()
        };
    }
}
