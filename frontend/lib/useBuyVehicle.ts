"use client";

import { useWriteContract } from "wagmi";
import { vehicleNftAddress, vehicleNftAbi } from "./contracts";

export function useBuyVehicle() {
    const { writeContractAsync } = useWriteContract();

    const buyVehicle = async (tokenId: number, price: bigint) => {
        const hash = await writeContractAsync({
            address: vehicleNftAddress,
            abi: vehicleNftAbi,
            functionName: "purchaseVehicle",
            args: [BigInt(tokenId)],
            value: price, // must be bigint (wei)
        });

        return hash; // tx hash on Monad testnet
    };

    return { buyVehicle };
}
