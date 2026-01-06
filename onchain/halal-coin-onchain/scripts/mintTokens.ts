import { Address, beginCell, toNano } from '@ton/core';
import { JettonController } from '../build/JettonController/JettonController_JettonController';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const JETTON_MASTER_ADDRESS = Address.parse(await provider.ui().input('Enter Jetton Master address'));
    const ADMIN_ADDRESS = Address.parse('UQBhrm5E2njlRRCvJbOAuO0Sp-o7HHEsWaiSoDhI6CiDFZuO');
    const MINT_AMOUNT = 100_000_000_000n; // 100 million HLLCN (with decimals=3)

    console.log('🪙 Minting HALAL COIN tokens...');
    console.log('📊 Parameters:');
    console.log('   Jetton Master:', JETTON_MASTER_ADDRESS.toString());
    console.log('   Receiver (Admin):', ADMIN_ADDRESS.toString());
    console.log('   Amount: 100,000,000 HLLCN');

    const jettonController = provider.open(JettonController.fromAddress(JETTON_MASTER_ADDRESS));

    await jettonController.send(
        provider.sender(),
        {
            value: toNano('0.5'), // Increased gas for minting + wallet deployment
        },
        {
            $$type: 'Mint',
            queryId: 0n,
            receiver: ADMIN_ADDRESS,
            amount: MINT_AMOUNT,
            forwardTonAmount: toNano('0.1'), // Increased forward amount
            forwardPayload: beginCell().endCell().asSlice(),
        },
    );

    console.log('✅ Mint message sent!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Wait 10-15 seconds for transaction confirmation');
    console.log('2. Check your Jetton Wallet balance on explorer');
    console.log('3. Get wallet address: call get_wallet_address(' + ADMIN_ADDRESS.toString() + ')');
}
