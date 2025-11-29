'use client';

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { readContract } from '@wagmi/core';
import { clsx } from 'clsx';
import { formatEther } from 'viem';
import { config } from '../../lib/wagmiConfig';
import { vehicleNftAbi, vehicleNftAddress, VehicleView, fetchMetadata } from '../../lib/contracts';
import VehicleCard from '../../components/VehicleCard';
import GarageActionDrawer, { GarageAction } from '../../components/GarageActionDrawer';
import DeliveryProgress from '../../components/DeliveryProgress';
import { IN_TRANSIT_COUNT, demoOrdersInTransit } from '../../lib/ordersData';

// Demo Garage Vehicles
const demoGarageVehicles = [
    {
        id: "garage-model3",
        tokenId: 1, // Map to real token ID 1 (Owned by User)
        name: "Tesla Model 3 Long Range",
        model: "Model 3",
        year: "2023",
        image: "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-3-Main-Hero-Desktop-LHD.png",
        priceLabel: "$59,990",
        dailyRateLabel: "$120/day",
        status: "Owned",
    },
    {
        id: "garage-modely",
        tokenId: 2, // Map to real token ID 2 (Owned by User)
        name: "Tesla Model Y Performance",
        model: "Model Y",
        year: "2023",
        image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2668&auto=format&fit=crop",
        priceLabel: "$69,990",
        dailyRateLabel: "$140/day",
        status: "Owned",
    }
];

export default function DashboardPage() {
    const { address, isConnected } = useAccount();
    const [vehicles, setVehicles] = useState<VehicleView[]>([]);
    const [loading, setLoading] = useState(true);

    // Garage Action State
    const [selectedGarageVehicle, setSelectedGarageVehicle] = useState<any | null>(null);
    const [garageAction, setGarageAction] = useState<GarageAction>(null);

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
                        serviceRecords: [], // Will be populated below
                    });

                    // Fetch service records
                    try {
                        const records = await readContract(config, {
                            address: vehicleNftAddress,
                            abi: vehicleNftAbi,
                            functionName: 'getServiceRecords',
                            args: [BigInt(i)],
                        }) as any[];
                        console.log(`Fetched records for token ${i}:`, records);
                        tempVehicles[tempVehicles.length - 1].serviceRecords = records;
                    } catch (e) {
                        console.error("Failed to fetch service records for token", i, e);
                    }
                } catch (err) {
                    // Ignore
                }
            }
            console.log("Final vehicles state:", tempVehicles);
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

    const totalVehicles = vehicles.length + demoGarageVehicles.length;
    const inTransit = vehicles.filter(v => v.deliveryStage === 1).length;
    const delivered = vehicles.filter(v => v.deliveryStage === 2).length + demoGarageVehicles.length; // Assume demo cars are delivered
    const listedCount = vehicles.filter(v => v.listed).length;

    const handleAction = (vehicle: any, action: GarageAction) => {
        setSelectedGarageVehicle(vehicle);
        setGarageAction(action);
    };

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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Owned</p>
                    <p className="text-4xl font-bold text-gray-900">{totalVehicles}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">In Transit</p>
                    <p className="text-4xl font-bold text-blue-600">{IN_TRANSIT_COUNT}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Delivered</p>
                    <p className="text-4xl font-bold text-emerald-600">{delivered}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Listed</p>
                    <p className="text-4xl font-bold text-yellow-600">{listedCount}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Rented</p>
                    <p className="text-4xl font-bold text-blue-600">{inTransit}</p>
                </div>
            </div>

            {/* In Transit Section */}
            {demoOrdersInTransit.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Vehicles in Transit</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {demoOrdersInTransit.map((order) => (
                            <div key={order.id} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-24 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                                            <img src={order.image} alt={order.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-100">{order.name}</p>
                                            <p className="text-xs text-gray-500">
                                                In Transit · Delivery expected in {order.expectedInDays} days
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Compact 3-point progress bar */}
                                <div className="mt-4">
                                    <DeliveryProgress currentStopIndex={order.currentStopIndex} stops={order.routeStops} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Vehicles List */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Your Vehicles</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Demo Garage Vehicles */}
                    {demoGarageVehicles.map(demo => (
                        <div key={demo.id} className="h-[520px] flex flex-col">
                            <div className="flex-1">
                                <VehicleCard
                                    variant="demo"
                                    id={demo.id}
                                    name={demo.name}
                                    model={demo.model}
                                    year={demo.year}
                                    image={demo.image}
                                    priceLabel={demo.priceLabel}
                                    listed={false}
                                    deliveryStageLabel="Delivered"
                                    showMarketActions={false}
                                    customBadge={
                                        <span className={clsx(
                                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium backdrop-blur-md",
                                            demo.status === "Rented" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                        )}>
                                            {demo.status}
                                        </span>
                                    }
                                    latestService={
                                        // Fetch latest service for demo vehicles (mapped to ID 1 and 2)
                                        // Since we can't easily async fetch here in render, we'll rely on a separate effect or just show "Loading..." if we want to be perfect.
                                        // But for simplicity, let's try to find the matching on-chain vehicle if it's already loaded in 'vehicles' array?
                                        // No, 'vehicles' only contains owned vehicles. If demo ID 1/2 is owned, it's in there.
                                        vehicles.find(v => v.tokenId === demo.tokenId)?.serviceRecords?.length
                                            ? vehicles.find(v => v.tokenId === demo.tokenId)?.serviceRecords?.slice(-1)[0]?.description
                                            : undefined
                                    }
                                />
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => handleAction(demo, 'sell')}
                                    disabled={demo.status === 'Rented'}
                                    className="py-2 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold uppercase rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sell Now
                                </button>
                                <button
                                    onClick={() => handleAction(demo, 'rent')}
                                    disabled={demo.status === 'Rented'}
                                    className="py-2 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold uppercase rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Rent Now
                                </button>
                                <button
                                    onClick={() => handleAction(demo, 'service')}
                                    className="py-2 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold uppercase rounded-lg transition-colors"
                                >
                                    Add Log
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* On-Chain Vehicles */}
                    {vehicles.map(v => (
                        <div key={v.tokenId} className="h-[520px] flex flex-col">
                            <div className="flex-1">
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
                                    showMarketActions={false}
                                    latestService={v.serviceRecords && v.serviceRecords.length > 0 ? v.serviceRecords[v.serviceRecords.length - 1].description : undefined}
                                />
                            </div>
                            {/* Actions for on-chain vehicles */}
                            <div className="mt-4 grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => handleAction(v, 'sell')}
                                    className="py-2 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold uppercase rounded-lg transition-colors"
                                >
                                    Sell Now
                                </button>
                                <button
                                    onClick={() => handleAction(v, 'rent')}
                                    className="py-2 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold uppercase rounded-lg transition-colors"
                                >
                                    Rent Now
                                </button>
                                <button
                                    onClick={() => handleAction(v, 'service')}
                                    className="py-2 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold uppercase rounded-lg transition-colors"
                                >
                                    Add Log
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <GarageActionDrawer
                isOpen={!!garageAction}
                onClose={() => setGarageAction(null)}
                vehicleName={selectedGarageVehicle?.name || (selectedGarageVehicle?.metadata?.name) || 'Vehicle'}
                tokenId={selectedGarageVehicle?.tokenId}
                action={garageAction}
            />
        </div>
    );
}
