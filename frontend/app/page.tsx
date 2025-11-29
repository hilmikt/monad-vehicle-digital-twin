'use client';

import React, { useEffect, useState } from 'react';
import { readContract, writeContract } from '@wagmi/core';
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
    const [selectedVehicle, setSelectedVehicle] = useState<{ type: "demo"; data: DemoVehicle } | { type: "onchain"; data: VehicleView } | null>(null);

    const { addActivity } = useActivityFeedStore();

    useEffect(() => {
        const loadVehicles = async () => {
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

                    // Only process if it exists (price > 0 or owner != zero)
                    // Assuming simple check for now

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

        loadVehicles();
    }, []);

    const handleBuy = async () => {
        if (!selectedVehicle) return;

        if (selectedVehicle.type === 'demo') {
            addActivity({
                type: 'PURCHASE',
                message: `Simulated purchase of ${selectedVehicle.data.name}`,
            });
            alert(`Demo purchase successful for ${selectedVehicle.data.name}!`);
            setSelectedVehicle(null);
        } else {
            // On-chain purchase
            try {
                const tx = await writeContract(config, {
                    address: vehicleNftAddress,
                    abi: vehicleNftAbi,
                    functionName: 'purchaseVehicle',
                    args: [BigInt(selectedVehicle.data.tokenId)],
                    value: selectedVehicle.data.price,
                });

                addActivity({
                    type: 'PURCHASE',
                    message: `Purchase transaction sent for Vehicle #${selectedVehicle.data.tokenId}`,
                    txHash: tx,
                });

                alert('Transaction sent! Check your wallet.');
                setSelectedVehicle(null);
            } catch (error) {
                console.error("Purchase failed:", error);
                alert('Purchase failed. See console for details.');
            }
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

            {/* Demo Inventory */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Featured Demo Inventory</h2>
                        <p className="text-sm text-gray-400">Sample digital twins used to demonstrate the experience.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                onClick={() => setSelectedVehicle({ type: "demo", data: demo })}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* On-Chain Inventory */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">On-Chain Inventory</h2>
                        <p className="text-sm text-gray-400">Live vehicles minted as NFTs on Monad testnet.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
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
                        ))}
                    </div>
                ) : vehicles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {vehicles.map((v) => (
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
                                    onClick={() => setSelectedVehicle({ type: "onchain", data: v })}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-400">No on-chain vehicles found.</p>
                    </div>
                )}
            </section>

            {/* Details Drawer */}
            <VehicleDetailsDrawer
                isOpen={!!selectedVehicle}
                onClose={() => setSelectedVehicle(null)}
                variant={selectedVehicle?.type === 'demo' ? 'demo' : 'onchain'}
                demoData={selectedVehicle?.type === 'demo' ? selectedVehicle.data : undefined}
                onchainData={selectedVehicle?.type === 'onchain' ? selectedVehicle.data : undefined}
                onBuy={handleBuy}
            />
        </div>
    );
}

