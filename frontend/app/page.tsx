'use client';

import React, { useEffect, useState } from 'react';
import { readContract } from '@wagmi/core';
import { formatEther } from 'viem';
import { config } from '../lib/wagmiConfig';
import { vehicleNftAbi, vehicleNftAddress, VehicleView, fetchMetadata } from '../lib/contracts';
import VehicleCard from '../components/VehicleCard';
import VehicleDetailsDrawer from '../components/VehicleDetailsDrawer';
import { demoVehicles, DemoVehicle } from '../lib/demoVehicles';
import { useActivityFeedStore } from '../lib/activityStore';

export default function Marketplace() {
    const [vehicles, setVehicles] = useState<VehicleView[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState<{
        type: "demo";
        data: DemoVehicle;
        mode?: "buy" | "rent"
    } | {
        type: "onchain";
        data: VehicleView;
        mode?: "buy" | "rent"
    } | null>(null);

    const { addActivity } = useActivityFeedStore();

    const fetchVehicles = async () => {
        setLoading(true);
        const tempVehicles: VehicleView[] = [];

        // Fetch first 10 for now to be faster
        for (let i = 1; i <= 10; i++) {
            try {
                const vehicleData = await readContract(config, {
                    address: vehicleNftAddress,
                    abi: vehicleNftAbi,
                    functionName: 'getVehicle',
                    args: [BigInt(i)],
                }) as any;

                const tokenUri = await readContract(config, {
                    address: vehicleNftAddress,
                    abi: vehicleNftAbi,
                    functionName: 'tokenURI',
                    args: [BigInt(i)],
                }) as string;

                const metadata = await fetchMetadata(tokenUri);

                tempVehicles.push({
                    tokenId: i,
                    currentOwner: vehicleData.currentOwner,
                    price: vehicleData.price,
                    listed: vehicleData.listed,
                    deliveryStage: vehicleData.deliveryStage,
                    metadata: metadata,
                });
            } catch (err) {
                // Skip if not minted or error
            }
        }
        setVehicles(tempVehicles);
        setLoading(false);
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handlePurchaseComplete = ({ demo }: { demo?: boolean } = {}) => {
        if (!demo) {
            // Refresh on-chain data
            fetchVehicles();
        }
    };

    return (
        <div className="space-y-12">
            {/* Header */}
            <section className="mb-10 text-center sm:text-left">
                <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
                    Find Your Next Car
                </h1>
                <p className="mt-3 text-gray-500 max-w-2xl">
                    Explore a marketplace of vehicle digital twins with transparent delivery and service history on Monad.
                </p>
            </section>

            {/* Combined Inventory */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Featured Inventory</h2>
                        <p className="text-sm text-gray-400">Browse available vehicles for sale and rent.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Demo Vehicles */}
                    {demoVehicles.map((demo) => (
                        <div key={demo.id} className="h-[420px]">
                            <VehicleCard
                                variant="demo"
                                id={demo.id}
                                name={demo.name}
                                model={demo.model}
                                year={demo.year}
                                image={demo.image}
                                priceLabel={demo.priceLabel}
                                listed={true}
                                deliveryStageLabel="Available"
                                onClick={() => setSelectedVehicle({ type: "demo", data: demo, mode: "buy" })}
                                onRent={() => setSelectedVehicle({ type: "demo", data: demo, mode: "rent" })}
                            />
                        </div>
                    ))}

                    {/* On-Chain Vehicles */}
                    {loading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-[420px] bg-gray-100 rounded-3xl animate-pulse flex flex-col overflow-hidden">
                                <div className="h-64 bg-gray-200" />
                                <div className="p-6 space-y-4 flex-1">
                                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                    <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center">
                                        <div className="h-8 bg-gray-200 rounded w-20" />
                                        <div className="h-8 bg-gray-200 rounded w-24" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        vehicles.map((v) => (
                            <div key={v.tokenId} className="h-[420px]">
                                <VehicleCard
                                    variant="onchain"
                                    id={v.tokenId.toString()}
                                    name={v.metadata?.name || `Vehicle #${v.tokenId}`}
                                    model={v.metadata?.model}
                                    year={v.metadata?.year}
                                    image={v.metadata?.image}
                                    priceLabel={formatEther(v.price) + " MON"}
                                    listed={v.listed}
                                    deliveryStageLabel={v.deliveryStage === 2 ? 'Delivered' : v.deliveryStage === 1 ? 'In Transit' : undefined}
                                    onClick={() => setSelectedVehicle({ type: "onchain", data: v, mode: "buy" })}
                                    onRent={() => setSelectedVehicle({ type: "onchain", data: v, mode: "rent" })}
                                />
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Details Drawer */}
            <VehicleDetailsDrawer
                isOpen={!!selectedVehicle}
                onClose={() => setSelectedVehicle(null)}
                variant={selectedVehicle?.type === 'demo' ? 'demo' : 'onchain'}
                demoData={selectedVehicle?.type === 'demo' ? selectedVehicle.data : undefined}
                onchainData={selectedVehicle?.type === 'onchain' ? selectedVehicle.data : undefined}
                onPurchaseComplete={handlePurchaseComplete}
                modeOverride={selectedVehicle?.mode}
            />
        </div>
    );
}
