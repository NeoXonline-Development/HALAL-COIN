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

## Mainnet references (fill after deploy)
- Jetton Master: TBD
- Deploy tx: TBD
- Admin address: TBD
- Admin transfer tx: TBD
- Revoke/close mint tx: TBD
