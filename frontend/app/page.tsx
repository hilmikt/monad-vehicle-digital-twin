'use client';

import React, { useEffect, useState } from 'react';
import { readContract } from '@wagmi/core';
import { config } from '../lib/wagmiConfig';
import { vehicleNftAbi, vehicleNftAddress, VehicleView, fetchMetadata } from '../lib/contracts';
import VehicleCard from '../components/VehicleCard';

export default function Marketplace() {
    const [vehicles, setVehicles] = useState<VehicleView[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadVehicles = async () => {
            setLoading(true);
            const tempVehicles: VehicleView[] = [];

            for (let i = 1; i <= 20; i++) {
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
                    // Skip
                }
            }
            setVehicles(tempVehicles);
            setLoading(false);
        };

        loadVehicles();
    }, []);

    const listedVehicles = vehicles.filter(v => v.listed);
    const unlistedVehicles = vehicles.filter(v => !v.listed);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black"></div>
            </div>
        );
    }

    return (
        <div className="space-y-16">
            {/* Header */}
            <div className="text-center space-y-4 py-8">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                    Find Your Digital Twin
                </h1>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                    Explore the marketplace of verified vehicle digital twins on Monad.
                </p>
            </div>

            {/* Listed Vehicles */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-900">Featured Inventory</h2>
                    <span className="text-sm text-gray-500 font-medium">{listedVehicles.length} vehicles</span>
                </div>

                {listedVehicles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {listedVehicles.map(v => (
                            <div key={v.tokenId} className="h-[460px]">
                                <VehicleCard vehicle={v} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400">No vehicles listed for sale.</p>
                    </div>
                )}
            </section>

            {/* Other Vehicles */}
            {unlistedVehicles.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-900">All Vehicles</h2>
                        <span className="text-sm text-gray-500 font-medium">{unlistedVehicles.length} vehicles</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {unlistedVehicles.map(v => (
                            <div key={v.tokenId} className="h-[460px]">
                                <VehicleCard vehicle={v} />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
