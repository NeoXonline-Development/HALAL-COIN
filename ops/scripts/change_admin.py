import asyncio
import os

from pytoniq_core import Address
from tonutils.client import ToncenterV3Client
from tonutils.jetton import JettonMasterStandard
from tonutils.wallet import WalletV4R2


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
    new_admin = _required("NEW_ADMIN_ADDRESS")

    client = ToncenterV3Client(is_testnet=is_testnet, rps=1, max_retries=1)
    wallet, _, _, _ = WalletV4R2.from_mnemonic(client, mnemonic)

    body = JettonMasterStandard.build_change_admin_body(
        new_admin_address=Address(new_admin),
    )

    tx = await wallet.transfer(
        destination=jetton_master,
        amount=0.05,  # TON for fees, adjust later
        body=body,
    )

    print("OK: admin change sent")
    print("tx:", tx)


if __name__ == "__main__":
    asyncio.run(main())
