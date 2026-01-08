import { beginCell, toNano } from '@ton/core';
import { JettonController } from '../build/JettonController/JettonController_JettonController';
import { NetworkProvider } from '@ton/blueprint';
import { CONFIG, getAdminAddress, getMetadataUrl } from '../config';

export async function run(provider: NetworkProvider) {
    // Load configuration from config.ts
    const TOTAL_SUPPLY = CONFIG.TOKEN.TOTAL_SUPPLY;
    const ADMIN_ADDRESS = getAdminAddress();
    const METADATA_URL = getMetadataUrl();
    const jettonContent = beginCell()
        .storeUint(0x01, 8) // off-chain content flag
        .storeStringTail(METADATA_URL)
        .endCell();

    console.log('🪙 Deploying HALAL COIN Jetton Master...');
    console.log('📊 Parameters:');
    console.log('   Total Supply: 100,000,000 HLLCN');
    console.log('   Decimals: 3');
    console.log('   Admin Address:', ADMIN_ADDRESS.toString());
    console.log('   Metadata URL:', METADATA_URL);

    const jettonController = provider.open(
        await JettonController.fromInit(TOTAL_SUPPLY, ADMIN_ADDRESS, jettonContent)
    );

    await jettonController.send(
        provider.sender(),
        {
            value: toNano('0.5'), // Enough for deployment + initial setup
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        },
    );

    await provider.waitForDeploy(jettonController.address);

    console.log('✅ Jetton Master deployed at:', jettonController.address.toString());
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Mint initial tokens: npx blueprint run mintTokens');
    console.log('2. Get your Jetton Wallet address: call get_wallet_address(admin_address)');
    console.log('3. Verify on explorer:', `https://testnet.tonviewer.com/${jettonController.address.toString()}`);
}
