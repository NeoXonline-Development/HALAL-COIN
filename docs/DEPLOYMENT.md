# HALAL COIN (HLLCN) – Jetton deployment checklist

## Token parameters (source of truth)
- Name: HALAL COIN
- Symbol: HLLCN
- Decimals: 3
- Metadata: /metadata/jetton.json

## Deployment method
- Deploy via Jetton Minter UI (e.g. minter.ton.org) using the admin wallet.

## Post-deploy (must-have proofs)
Save and publish:
- Jetton Master address
- Deploy tx hash/link
- Initial mint tx hash/link (if separate)
- Admin transfer tx hash/link (if we transfer to customer)
- Mint close / revoke tx hash/link (if fixed supply)

## Admin policy
- If token will be changed later: DO NOT revoke ownership yet.
- If fixed supply and no further changes: revoke/disable minting after final checks.

## Mainnet Deployment ✅

**Deployment Date:** January 8, 2026

### Contract Addresses
- **Jetton Master:** `EQBBaBRT2ozwbZsntfTJKMgEK2Sfj9WksE8z_9wktS6Rea3z`
- **Admin Address:** `UQCRSOwlZATn9aOeW09LYGp3iYJLa1NJuyWf5No6DMup6Srx`

### Explorers
- TONScan: https://tonscan.org/address/EQBBaBRT2ozwbZsntfTJKMgEK2Sfj9WksE8z_9wktS6Rea3z
- TONViewer: https://tonviewer.com/EQBBaBRT2ozwbZsntfTJKMgEK2Sfj9WksE8z_9wktS6Rea3z

### Supply Configuration
- **Maximum Supply (Cap):** 200,000,000 HLLCN
- **Initial Circulation:** 100,000,000 HLLCN
- **Reserved for Future:** 100,000,000 HLLCN

### Token Features
- ✅ Mintable (owner can mint more tokens within cap)
- ✅ Metadata updatable (owner can update token info)
- ✅ Ownership transferable (owner can change admin)
- ✅ Burnable (users can burn their tokens)
- ⚠️ Immutable code (contract logic cannot be changed)

### Security
- Smart contract code: https://github.com/NeoXonline-Development/HALAL-COIN
- Metadata: https://raw.githubusercontent.com/NeoXonline-Development/HALAL-COIN/main/metadata/jetton.json
