import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, beginCell, toNano } from '@ton/core';
import { JettonController } from '../build/JettonController/JettonController_JettonController';
import { JettonWallet } from '../build/JettonController/JettonController_JettonWallet';
import '@ton/test-utils';

describe('JettonController', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let admin: SandboxContract<TreasuryContract>;
    let user: SandboxContract<TreasuryContract>;
    let jettonController: SandboxContract<JettonController>;

    const TOTAL_SUPPLY = 100_000_000_000n; // 100M tokens with decimals=3
    
    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        admin = await blockchain.treasury('admin');
        user = await blockchain.treasury('user');

        // Prepare jetton content
        const jettonContent = beginCell()
            .storeUint(0x01, 8) // off-chain content
            .storeStringTail('https://example.com/jetton.json')
            .endCell();

        jettonController = blockchain.openContract(
            await JettonController.fromInit(TOTAL_SUPPLY, admin.address, jettonContent)
        );

        const deployResult = await jettonController.send(
            deployer.getSender(),
            {
                value: toNano('0.5'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: jettonController.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy successfully', async () => {
        // Deployment check done in beforeEach
        expect(jettonController.address).toBeDefined();
    });

    it('should return correct jetton data', async () => {
        const jettonData = await jettonController.getGetJettonData();
        
        expect(jettonData.totalSupply).toEqual(TOTAL_SUPPLY);
        expect(jettonData.mintable).toBe(true);
        expect(jettonData.adminAddress.toString()).toEqual(admin.address.toString());
    });

    it('should mint tokens successfully', async () => {
        const mintAmount = 1_000_000n; // 1000 tokens with decimals=3

        const mintResult = await jettonController.send(
            admin.getSender(),
            {
                value: toNano('0.5'),
            },
            {
                $$type: 'Mint',
                queryId: 1n,
                receiver: user.address,
                amount: mintAmount,
                forwardTonAmount: toNano('0.05'),
                forwardPayload: beginCell().endCell().asSlice(),
            }
        );

        expect(mintResult.transactions).toHaveTransaction({
            from: admin.address,
            to: jettonController.address,
            success: true,
        });

        // Get user's wallet address
        const userWalletAddress = await jettonController.getGetWalletAddress(user.address);
        const userWallet = blockchain.openContract(JettonWallet.fromAddress(userWalletAddress));

        // Check wallet balance
        const walletData = await userWallet.getGetWalletData();
        expect(walletData.balance).toEqual(mintAmount);
    });

    it('should not allow non-admin to mint', async () => {
        const mintAmount = 1_000_000n;

        const mintResult = await jettonController.send(
            user.getSender(),
            {
                value: toNano('0.5'),
            },
            {
                $$type: 'Mint',
                queryId: 2n,
                receiver: user.address,
                amount: mintAmount,
                forwardTonAmount: toNano('0.05'),
                forwardPayload: beginCell().endCell().asSlice(),
            }
        );

        expect(mintResult.transactions).toHaveTransaction({
            from: user.address,
            to: jettonController.address,
            success: false,
        });
    });

    it('should update content by admin', async () => {
        const newContent = beginCell()
            .storeUint(0x01, 8)
            .storeStringTail('https://example.com/new-jetton.json')
            .endCell();

        const updateResult = await jettonController.send(
            admin.getSender(),
            {
                value: toNano('0.1'),
            },
            {
                $$type: 'JettonUpdateContent',
                queryId: 3n,
                content: newContent,
            }
        );

        expect(updateResult.transactions).toHaveTransaction({
            from: admin.address,
            to: jettonController.address,
            success: true,
        });
    });

    it('should change owner by current owner', async () => {
        const newOwner = await blockchain.treasury('newOwner');

        const changeOwnerResult = await jettonController.send(
            admin.getSender(),
            {
                value: toNano('0.1'),
            },
            {
                $$type: 'ChangeOwner',
                queryId: 4n,
                newOwner: newOwner.address,
            }
        );

        expect(changeOwnerResult.transactions).toHaveTransaction({
            from: admin.address,
            to: jettonController.address,
            success: true,
        });

        // Verify new owner by trying to mint
        const mintResult = await jettonController.send(
            newOwner.getSender(),
            {
                value: toNano('0.5'),
            },
            {
                $$type: 'Mint',
                queryId: 5n,
                receiver: user.address,
                amount: 100_000n,
                forwardTonAmount: toNano('0.05'),
                forwardPayload: beginCell().endCell().asSlice(),
            }
        );

        expect(mintResult.transactions).toHaveTransaction({
            from: newOwner.address,
            to: jettonController.address,
            success: true,
        });
    });

    it('should transfer tokens between wallets', async () => {
        // First mint tokens to user
        await jettonController.send(
            admin.getSender(),
            { value: toNano('0.5') },
            {
                $$type: 'Mint',
                queryId: 6n,
                receiver: user.address,
                amount: 1_000_000n,
                forwardTonAmount: toNano('0.05'),
                forwardPayload: beginCell().endCell().asSlice(),
            }
        );

        // Get user's wallet
        const userWalletAddress = await jettonController.getGetWalletAddress(user.address);
        const userWallet = blockchain.openContract(JettonWallet.fromAddress(userWalletAddress));

        // Transfer tokens to deployer
        const transferAmount = 500_000n;
        const transferResult = await userWallet.send(
            user.getSender(),
            { value: toNano('0.5') },
            {
                $$type: 'JettonTransfer',
                queryId: 7n,
                amount: transferAmount,
                destination: deployer.address,
                responseDestination: user.address,
                customPayload: null,
                forwardTonAmount: toNano('0.05'),
                forwardPayload: beginCell().endCell().asSlice(),
            }
        );

        expect(transferResult.transactions).toHaveTransaction({
            from: user.address,
            to: userWalletAddress,
            success: true,
        });

        // Check balances
        const userBalance = (await userWallet.getGetWalletData()).balance;
        expect(userBalance).toEqual(500_000n);

        const deployerWalletAddress = await jettonController.getGetWalletAddress(deployer.address);
        const deployerWallet = blockchain.openContract(JettonWallet.fromAddress(deployerWalletAddress));
        const deployerBalance = (await deployerWallet.getGetWalletData()).balance;
        expect(deployerBalance).toEqual(transferAmount);
    });

    it('should burn tokens successfully', async () => {
        // First mint tokens
        await jettonController.send(
            admin.getSender(),
            { value: toNano('0.5') },
            {
                $$type: 'Mint',
                queryId: 8n,
                receiver: user.address,
                amount: 1_000_000n,
                forwardTonAmount: toNano('0.05'),
                forwardPayload: beginCell().endCell().asSlice(),
            }
        );

        const userWalletAddress = await jettonController.getGetWalletAddress(user.address);
        const userWallet = blockchain.openContract(JettonWallet.fromAddress(userWalletAddress));

        // Burn tokens
        const burnAmount = 300_000n;
        const burnResult = await userWallet.send(
            user.getSender(),
            { value: toNano('0.3') },
            {
                $$type: 'JettonBurn',
                queryId: 9n,
                amount: burnAmount,
                responseDestination: user.address,
                customPayload: null,
            }
        );

        expect(burnResult.transactions).toHaveTransaction({
            from: user.address,
            to: userWalletAddress,
            success: true,
        });

        // Check balance after burn
        const userBalance = (await userWallet.getGetWalletData()).balance;
        expect(userBalance).toEqual(700_000n);
    });

    it('should disable minting by owner', async () => {
        // Verify minting is initially enabled
        let jettonData = await jettonController.getGetJettonData();
        expect(jettonData.mintable).toBe(true);

        // Disable minting
        const disableResult = await jettonController.send(
            admin.getSender(),
            { value: toNano('0.1') },
            {
                $$type: 'DisableMint',
                queryId: 10n,
                confirmationCode: 0xDEADC0DEn, // Required confirmation code
            }
        );

        expect(disableResult.transactions).toHaveTransaction({
            from: admin.address,
            to: jettonController.address,
            success: true,
        });

        // Verify minting is now disabled
        jettonData = await jettonController.getGetJettonData();
        expect(jettonData.mintable).toBe(false);

        // Try to mint after disabling - should fail
        const mintAfterDisable = await jettonController.send(
            admin.getSender(),
            { value: toNano('0.5') },
            {
                $$type: 'Mint',
                queryId: 11n,
                receiver: user.address,
                amount: 100_000n,
                forwardTonAmount: toNano('0.05'),
                forwardPayload: beginCell().endCell().asSlice(),
            }
        );

        expect(mintAfterDisable.transactions).toHaveTransaction({
            from: admin.address,
            to: jettonController.address,
            success: false,
        });
    });

    it('should reject disable minting by non-owner', async () => {
        const nonOwner = await blockchain.treasury('nonOwner');

        const disableResult = await jettonController.send(
            nonOwner.getSender(),
            { value: toNano('0.1') },
            {
                $$type: 'DisableMint',
                queryId: 12n,
                confirmationCode: 0xDEADC0DEn, // Even with correct code, non-owner cannot disable
            }
        );

        expect(disableResult.transactions).toHaveTransaction({
            from: nonOwner.address,
            to: jettonController.address,
            success: false,
        });

        // Verify minting is still enabled
        const jettonData = await jettonController.getGetJettonData();
        expect(jettonData.mintable).toBe(true);
    });
});
