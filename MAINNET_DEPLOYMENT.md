# HALAL COIN - Mainnet Deployment Summary

## ✅ Deployment Status: SUCCESSFUL

**Deployment Date:** January 8, 2026  
**Network:** TON Blockchain (Mainnet)  
**Contract Hash:** `c34250185962134945482c413e7b05d1dd49d0cc03974f8ccafaac120dc9250d`

## 📋 Token Parameters

- **Name:** HALAL COIN
- **Symbol:** HLLCN
- **Decimals:** 3
- **Standard:** TEP-74 (Jetton)

## 📊 Supply Information

| Parameter | Value |
|-----------|-------|
| Maximum Supply (Cap) | 200,000,000 HLLCN |
| Initial Circulation | 100,000,000 HLLCN |
| Reserved for Future | 100,000,000 HLLCN |

**Supply Structure:**
- The smart contract has a hard cap of 200M tokens to protect against inflation
- Currently 100M tokens are in circulation as per initial tokenomics
- Remaining 100M tokens are reserved for future emissions (staking rewards, liquidity programs, partnerships)
- This approach provides transparency and controlled emission similar to Bitcoin's model

## 🔗 Contract Addresses

**Jetton Master Contract:**
```
EQBBaBRT2ozwbZsntfTJKMgEK2Sfj9WksE8z_9wktS6Rea3z
```

**Admin Address:**
```
UQCRSOwlZATn9aOeW09LYGp3iYJLa1NJuyWf5No6DMup6Srx
```

## 🔍 Explorer Links

- **TONScan:** https://tonscan.org/address/EQBBaBRT2ozwbZsntfTJKMgEK2Sfj9WksE8z_9wktS6Rea3z
- **TONViewer:** https://tonviewer.com/EQBBaBRT2ozwbZsntfTJKMgEK2Sfj9WksE8z_9wktS6Rea3z

## 🔧 Contract Features

- ✅ **Mintable:** Owner can mint additional tokens (within the 200M cap)
- ✅ **Burnable:** Users can burn their tokens to reduce supply
- ✅ **Metadata Updatable:** Owner can update token information and logo
- ✅ **Ownership Transferable:** Admin rights can be transferred to another address
- ✅ **Mint Disabling:** Owner can permanently disable minting (irreversible)
- ⚠️ **Immutable Code:** Contract logic cannot be upgraded (security feature)

## 📝 Deployment Steps Completed

1. ✅ Compiled smart contract (Tact v1.6.13)
2. ✅ Deployed Jetton Master to mainnet
3. ✅ Minted initial 100M tokens to admin address
4. ✅ Verified contract on blockchain explorers
5. ✅ Updated repository documentation

## 🔐 Security Information

- **Source Code:** https://github.com/NeoXonline-Development/HALAL-COIN
- **Contract Language:** Tact 1.6.13
- **Framework:** Blueprint 0.40.0+
- **Tests:** 8/8 passed
- **Metadata URL:** https://raw.githubusercontent.com/NeoXonline-Development/HALAL-COIN/main/metadata/jetton.json

## 🛠️ Operational Scripts

Python scripts for token management are available in `/ops/scripts/`:

- `change_admin.py` - Transfer admin rights to another address
- `transfer_all.py` - Transfer all tokens from wallet
- `transfer_jetton.py` - Transfer specific amount of tokens

**Configuration:**
- Uses WalletV5R1 (latest TON wallet version)
- Environment variables: `WALLET_MNEMONIC`, `NETWORK`, `JETTON_MASTER_ADDRESS`

## 📚 Next Steps

### For Token Holders
- View your balance on TONScan or TONViewer
- Transfer tokens using TON wallets that support Jettons
- Trade on DEXs that support HLLCN

### For Integration
- Use standard TEP-74 Jetton interface
- Get wallet address: call `get_wallet_address(owner_address)`
- Check balance via blockchain explorers or smart contract methods

### For Developers
- Review smart contract code in `/onchain/halal-coin-onchain/contracts/`
- Use TypeScript scripts in `/onchain/halal-coin-onchain/scripts/`
- Follow Blueprint framework conventions

## ⚠️ Important Notes

1. **Minting Control:** Only the admin address can mint new tokens
2. **Cap Enforcement:** Cannot mint more than 200M total (contract limitation)
3. **Irreversible Actions:** Disabling mint is permanent - use with caution
4. **Admin Responsibility:** Admin key must be kept secure - controls all owner functions

## 📞 Support

For technical questions or support, refer to:
- Repository: https://github.com/NeoXonline-Development/HALAL-COIN
- Developer: Igor Migov
