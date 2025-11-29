import vehicleNftJson from "../../../artifacts/contracts/VehicleNFT.sol/VehicleNFT.json";

export const vehicleNftAbi = vehicleNftJson.abi as const;
export const vehicleNftAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

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

export const fetchMetadata = async (tokenURI: string): Promise<VehicleMetadata | null> => {
    if (!tokenURI) return null;

    // Handle simple JSON string (for demo/testing)
    if (tokenURI.startsWith("{")) {
        try {
            return JSON.parse(tokenURI);
        } catch (e) {
            console.error("Failed to parse metadata JSON", e);
            return null;
        }
    }

    // Handle URL
    try {
        const res = await fetch(tokenURI);
        if (!res.ok) throw new Error("Failed to fetch metadata");
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch metadata URL", e);
        return null;
    }
};
