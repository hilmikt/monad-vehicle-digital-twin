import { createPublicClient, http } from 'viem';
import vehicleNftJson from "../../artifacts/contracts/VehicleNFT.sol/VehicleNFT.json";

// Environment variables
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID);

// Export ABI and Address
export const vehicleNftAbi = vehicleNftJson.abi as const;
export const vehicleNftAddress = CONTRACT_ADDRESS;

// Types
export type DeliveryStage = 0 | 1 | 2; // NotStarted, InTransit, Delivered

export interface VehicleMetadata {
    name: string;
    description?: string;
    image?: string;
    model?: string;
    year?: string;
}

export interface VehicleView {
    tokenId: number;
    currentOwner: string;
    price: bigint;
    listed: boolean;
    deliveryStage: DeliveryStage;
    metadata?: VehicleMetadata | null;
}

export interface ServiceEventView {
    timestamp: number;
    description: string;
    addedBy: string;
}

// Helper to fetch metadata
export async function fetchMetadata(tokenURI: string): Promise<VehicleMetadata | null> {
    if (!tokenURI) return null;

    try {
        // Handle IPFS if needed, though user said HTTP(s) mostly
        const url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch metadata");
        const json = await res.json();
        return json as VehicleMetadata;
    } catch (error) {
        console.error("Error fetching metadata:", error);
        return null;
    }
}
