"use client";

import { useSendTransaction } from "wagmi";

const RENT_RECEIVER_ADDRESS = "0x000000000000000000000000000000000000dEaD" as `0x${string}`;
// ↑ You may replace with any valid Monad testnet address (e.g. contract owner).
// This is only to simulate a real tx with gas fee, value = 0.

export function useRentTransaction() {
    const { sendTransactionAsync } = useSendTransaction();

    const sendRentTx = async () => {
        const hash = await sendTransactionAsync({
            to: RENT_RECEIVER_ADDRESS,
            value: BigInt(0), // 0 native token, only gas cost
        });

        return hash;
    };

    return { sendRentTx };
}
