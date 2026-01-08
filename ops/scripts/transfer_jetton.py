import asyncio
import os
from decimal import Decimal

from pytoniq_core import Address, begin_cell

from tonutils.client import ToncenterV3Client
from tonutils.jetton import JettonMasterStandard, JettonWalletStandard
from tonutils.wallet import WalletV5R1


def _required(name: str) -> str:
    v = os.getenv(name)
    if not v:
        raise RuntimeError(f"Missing env var: {name}")
    return v


async def main() -> None:
    # Set network from environment variable (testnet or mainnet)
    network = os.getenv("NETWORK", "testnet").lower()
    is_testnet = network != "mainnet"

    # Load configuration from environment variables
    mnemonic = _required("WALLET_MNEMONIC")
    jetton_master = _required("JETTON_MASTER_ADDRESS")
    destination = _required("DESTINATION_ADDRESS")
    
    # Jetton decimals (default: 3 for HALAL COIN)
    decimals = int(os.getenv("JETTON_DECIMALS", "3"))
    
    # Amount of jettons to transfer (in human-readable units, e.g., 0.01)
    jetton_amount = Decimal(os.getenv("JETTON_AMOUNT", "0.01"))
    
    # Optional comment for the transfer
    comment = os.getenv("COMMENT", "Transfer from tonutils")
    # Optional comment for the transfer
    comment = os.getenv("COMMENT", "Transfer from tonutils")

    client = ToncenterV3Client(is_testnet=is_testnet, rps=1, max_retries=1)
    wallet, _, _, _ = WalletV5R1.from_mnemonic(client, mnemonic)

    jetton_wallet_address = await JettonMasterStandard.get_wallet_address(
        client=client,
        owner_address=wallet.address.to_str(),
        jetton_master_address=jetton_master,
    )

    body = JettonWalletStandard.build_transfer_body(
        recipient_address=Address(destination),
        response_address=wallet.address,
        jetton_amount=int(jetton_amount * (10 ** decimals)),
        forward_payload=(
            begin_cell()
            .store_uint(0, 32)  # Text comment opcode
            .store_snake_string(comment)
            .end_cell()
        ),
        forward_amount=1,
    )

    tx_hash = await wallet.transfer(
        destination=jetton_wallet_address,
        amount=0.05,
        body=body,
    )

    print(f"Successfully transferred {jetton_amount} jettons!")
    print(f"Transaction hash: {tx_hash}")

if __name__ == "__main__":
    asyncio.run(main())
