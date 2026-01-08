import { Address } from '@ton/core';

/**
 * HALAL COIN Configuration
 * 
 * Change these addresses before mainnet deployment!
 */

export const CONFIG = {
    // Token Parameters
    TOKEN: {
        TOTAL_SUPPLY: 100_000_000_000n, // 100 million HLLCN (with decimals=3)
        DECIMALS: 3,
        SYMBOL: 'HLLCN',
        NAME: 'HALAL COIN',
    },

    // Admin/Owner address - receives all token management rights
    // Can: mint, change metadata, transfer ownership, disable minting
    ADMIN_ADDRESS: 'UQCRSOwlZATn9aOeW09LYGp3iYJLa1NJuyWf5No6DMup6Srx',

    // Deployer address - taken from .env WALLET_MNEMONIC
    // Pays for contract deployment gas fees

    // Metadata URL
    METADATA_URL: 'https://raw.githubusercontent.com/NeoXonline-Development/HALAL-COIN/main/metadata/jetton.json',
};

// Helper function to parse admin address
export function getAdminAddress(): Address {
    return Address.parse(CONFIG.ADMIN_ADDRESS);
}

export function getMetadataUrl(): string {
    return CONFIG.METADATA_URL;
}
