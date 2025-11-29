"use client";

import { useState, useEffect } from "react";
import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { vehicleNftAbi, vehicleNftAddress } from "../lib/contracts";
import VehicleCard from "../components/VehicleCard";
import { parseEther } from "viem";

// Mock metadata for demo purposes since we don't have a real IPFS gateway setup in this environment
const MOCK_METADATA = [
    { model: "Tesla Model S", year: 2024, image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800" },
    { model: "Porsche Taycan", year: 2023, image: "https://images.unsplash.com/photo-1614200187524-dc411c872690?auto=format&fit=crop&q=80&w=800" },
    { model: "Rivian R1T", year: 2024, image: "https://images.unsplash.com/photo-1669670676720-6d9b0c23908f?auto=format&fit=crop&q=80&w=800" },
];

export default function Home() {
    const { address } = useAccount();
    const { writeContract } = useWriteContract();
    const [mounted, setMounted] = useState(false);
    const [vehicles, setVehicles] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch a fixed range of tokens for demo
    // In a real app, you'd likely query a subgraph or event logs
    const tokenIds = [0, 1, 2];

    // We'll just simulate fetching for now because hooks inside loops are tricky in React
    // A better pattern is a separate component per ID or a multi-read hook
    // For this demo, we will assume we can read them individually or just show the UI structure

    // NOTE: In a real production app, use `useReadContracts` from wagmi to batch these.
    // For simplicity in this generated code, we will just render a "Mint Demo" button and 
    // show placeholders if no data is found, or use a client-side fetch effect.

    const handleMintDemo = () => {
        if (!address) return;

        // Mint a demo vehicle
        const randomCar = MOCK_METADATA[Math.floor(Math.random() * MOCK_METADATA.length)];
        const metadata = JSON.stringify(randomCar);

        writeContract({
            address: vehicleNftAddress,
            abi: vehicleNftAbi,
            functionName: "mintVehicle",
            args: [address, parseEther("0.1"), metadata],
        });
    };

    // This is a simplified way to fetch data for the demo. 
    // In a real app, we would use `useReadContracts` to fetch all data at once.
    // Since we can't easily generate dynamic hooks here, we'll rely on the user interacting.

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Vehicle Marketplace
                </h1>
                {address && (
                    <button
                        onClick={handleMintDemo}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Mint Demo Vehicle
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                {/* 
          In a real implementation, we would map over fetched data.
          For this hackathon starter, we will show a placeholder message if no vehicles are found,
          or render a few hardcoded cards if the contract is empty to demonstrate UI.
        */}
                <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <p className="text-gray-500">
                        Connect your wallet and mint a vehicle to get started!
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                        (Once minted, vehicles will appear here. You would implement `useReadContracts` to fetch IDs 0-10)
                    </p>
                </div>

                {/* Example of how it would look with data */}
                {/* 
        <VehicleCard
          tokenId={0}
          model="Tesla Model S"
          year={2024}
          price={parseEther("0.1")}
          deliveryStage={0}
          imageUrl="https://..."
        />
        */}
            </div>
        </div>
    );
}
