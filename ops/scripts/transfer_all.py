import asyncio
import os
from decimal import Decimal

from tonutils.client import ToncenterV3Client
from tonutils.wallet import WalletV4R2
from tonutils.wallet.messages import TransferJettonMessage


def _required(name: str) -> str:
    v = os.getenv(name)
    if not v:
        raise RuntimeError(f"Missing env var: {name}")
    return v


async def main() -> None:
    network = os.getenv("NETWORK", "testnet").lower()
    is_testnet = network != "mainnet"

    mnemonic = _required("MNEMONIC")
    jetton_master = _required("JETTON_MASTER_ADDRESS")
    destination = _required("DESTINATION_ADDRESS")

    decimals = int(os.getenv("TOKEN_DECIMALS", "3"))
    total_tokens = Decimal(_required("TOTAL_TOKENS"))

    client = ToncenterV3Client(is_testnet=is_testnet, rps=1, max_retries=1)
    wallet, _, _, _ = WalletV4R2.from_mnemonic(client, mnemonic)

    # NOTE: tonutils converts with decimals. Keep TOTAL_TOKENS in "human" units.
    tx = await wallet.transfer_message(
        message=TransferJettonMessage(
            destination=destination,
            jetton_master_address=jetton_master,
            jetton_amount=float(total_tokens),
            jetton_decimals=decimals,
            forward_payload="delivery",
        )
    )

    print("OK: jettons transfer sent")
    print("tx:", tx)


if __name__ == "__main__":
    asyncio.run(main())
