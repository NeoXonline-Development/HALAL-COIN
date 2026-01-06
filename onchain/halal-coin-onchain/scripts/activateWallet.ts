import { toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const sender = provider.sender();
    const address = sender.address;

    console.log('');
    console.log('💳 Wallet Information:');
    console.log('   Address:', address?.toString());
    console.log('');

    if (!address) {
        console.log('❌ No wallet address found!');
        return;
    }

    console.log('� Send this address to @testgiver_ton_bot:');
    console.log('   ' + address.toString());
    console.log('');
    console.log('🚀 Attempting to activate wallet...');
    console.log('');

    try {
        // Try to send a transaction to activate the wallet
        await provider.sender().send({
            to: address,
            value: toNano('0.01'),
            bounce: false,
        });

        console.log('✅ Activation transaction sent successfully!');
        console.log('');
        console.log('📝 Next steps:');
        console.log('1. Wait 10-15 seconds for transaction confirmation');
        console.log('2. Run the deployment script:');
        console.log('   npx blueprint run deployJettonController --testnet');
    } catch (error: any) {
        console.log('❌ Activation failed:', error.message);
        console.log('');
        
        if (error.message.includes('account is not active') || error.message.includes('LITE_SERVER_UNKNOWN')) {
            console.log('ℹ️ Wallet needs funds first!');
            console.log('');
            console.log('📝 Steps:');
            console.log('1. Copy this address: ' + address.toString());
            console.log('2. Send it to @testgiver_ton_bot in Telegram');
            console.log('3. Wait 30 seconds for TON to arrive');
            console.log('4. Run deployment directly:');
            console.log('   npx blueprint run deployJettonController --testnet');
        } else {
            console.log('💡 Try running deployment directly - it might work:');
            console.log('   npx blueprint run deployJettonController --testnet');
        }
    }
}
