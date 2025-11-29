'use client';

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { readContract } from '@wagmi/core';
import { config } from '../../lib/wagmiConfig';
import { vehicleNftAbi, vehicleNftAddress, VehicleView, fetchMetadata } from '../../lib/contracts';
import VehicleCard from '../../components/VehicleCard';

export default function DashboardPage() {
    const { address, isConnected } = useAccount();
    const [vehicles, setVehicles] = useState<VehicleView[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!address) {
            setLoading(false);
            return;
        }

        const loadMyVehicles = async () => {
            setLoading(true);
            const tempVehicles: VehicleView[] = [];

            for (let i = 1; i <= 50; i++) {
                try {
                    const vehicleData = await readContract(config, {
                        address: vehicleNftAddress,
                        abi: vehicleNftAbi,
                        functionName: 'getVehicle',
                        args: [BigInt(i)],
                    }) as any;

                    if (vehicleData.currentOwner.toLowerCase() !== address.toLowerCase()) {
                        continue;
                    }

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
                    // Ignore
                }
            }
            setVehicles(tempVehicles);
            setLoading(false);
        };

        loadMyVehicles();
    }, [address]);

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">🔒</div>
                <h2 className="text-xl font-bold text-gray-900">Wallet Not Connected</h2>
                <p className="text-gray-500">Please connect your wallet to view your garage.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black"></div>
            </div>
        );
    }

    const totalVehicles = vehicles.length;
    const inTransit = vehicles.filter(v => v.deliveryStage === 1).length;
    const delivered = vehicles.filter(v => v.deliveryStage === 2).length;
    const listedCount = vehicles.filter(v => v.listed).length;

    return (
        <div className="space-y-12">
            <div className="flex items-end justify-between border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Garage</h1>
                    <p className="text-gray-500 mt-1">Manage your digital vehicle collection.</p>
                </div>
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{address}</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Owned</p>
                    <p className="text-4xl font-bold text-gray-900">{totalVehicles}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">In Transit</p>
                    <p className="text-4xl font-bold text-blue-600">{inTransit}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Delivered</p>
                    <p className="text-4xl font-bold text-emerald-600">{delivered}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Listed</p>
                    <p className="text-4xl font-bold text-yellow-600">{listedCount}</p>
                </div>
            </div>

            {/* Vehicles List */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Your Vehicles</h2>
                {vehicles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {vehicles.map(v => (
                            <div key={v.tokenId} className="h-[460px]">
                                <VehicleCard vehicle={v} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 mb-4">You don't own any vehicles yet.</p>
                        <a href="/" className="px-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors">
                            Browse Marketplace
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
