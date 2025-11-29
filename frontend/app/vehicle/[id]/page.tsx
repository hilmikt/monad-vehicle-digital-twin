'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { readContract } from '@wagmi/core';
import { parseEther, formatEther } from 'viem';
import { config } from '../../lib/wagmiConfig';
import {
    vehicleNftAbi,
    vehicleNftAddress,
    VehicleView,
    ServiceEventView,
    fetchMetadata
} from '../../lib/contracts';
import { useActivityFeedStore } from '../../lib/activityStore';
import DeliveryTimeline from '../../components/DeliveryTimeline';
import ServiceHistory from '../../components/ServiceHistory';
import StatPill from '../../components/StatPill';

export default function VehicleDetailsPage() {
    const { id } = useParams();
    const tokenId = BigInt(id as string);
    const { address } = useAccount();
    const { addActivity } = useActivityFeedStore();

    const [vehicle, setVehicle] = useState<VehicleView | null>(null);
    const [serviceEvents, setServiceEvents] = useState<ServiceEventView[]>([]);
    const [loading, setLoading] = useState(true);

    const [listPrice, setListPrice] = useState('');
    const [serviceDesc, setServiceDesc] = useState('');

    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const fetchData = async () => {
        try {
            const vData = await readContract(config, {
                address: vehicleNftAddress,
                abi: vehicleNftAbi,
                functionName: 'getVehicle',
                args: [tokenId],
            }) as any;

            const tokenUri = await readContract(config, {
                address: vehicleNftAddress,
                abi: vehicleNftAbi,
                functionName: 'tokenURI',
                args: [tokenId],
            }) as string;

            const meta = await fetchMetadata(tokenUri);

            setVehicle({
                tokenId: Number(tokenId),
                currentOwner: vData.currentOwner,
                price: vData.price,
                listed: vData.listed,
                deliveryStage: vData.deliveryStage,
                metadata: meta,
            });

            const events = await readContract(config, {
                address: vehicleNftAddress,
                abi: vehicleNftAbi,
                functionName: 'getServiceEvents',
                args: [tokenId],
            }) as any[];

            setServiceEvents(events.map((e: any) => ({
                timestamp: Number(e.timestamp),
                description: e.description,
                addedBy: e.addedBy,
            })));

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    useEffect(() => {
        if (isConfirmed) {
            fetchData();
            addActivity({ type: 'SERVICE', message: `Action confirmed for Vehicle #${tokenId}`, txHash: hash });
        }
    }, [isConfirmed]);

    // Actions
    const handleBuy = () => {
        if (!vehicle) return;
        writeContract({
            address: vehicleNftAddress,
            abi: vehicleNftAbi,
            functionName: 'purchaseVehicle',
            args: [tokenId],
            value: vehicle.price,
        });
    };

    const handleList = () => {
        if (!listPrice) return;
        writeContract({
            address: vehicleNftAddress,
            abi: vehicleNftAbi,
            functionName: 'listVehicle',
            args: [tokenId, parseEther(listPrice)],
        });
    };

    const handleUnlist = () => {
        writeContract({
            address: vehicleNftAddress,
            abi: vehicleNftAbi,
            functionName: 'unlistVehicle',
            args: [tokenId],
        });
    };

    const handleAdvanceDelivery = () => {
        writeContract({
            address: vehicleNftAddress,
            abi: vehicleNftAbi,
            functionName: 'advanceDelivery',
            args: [tokenId],
        });
    };

    const handleAddService = () => {
        if (!serviceDesc) return;
        writeContract({
            address: vehicleNftAddress,
            abi: vehicleNftAbi,
            functionName: 'addServiceEvent',
            args: [tokenId, serviceDesc],
        });
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading vehicle details...</div>;
    if (!vehicle) return <div className="p-12 text-center text-gray-500">Vehicle not found.</div>;

    const isOwner = address && vehicle.currentOwner.toLowerCase() === address.toLowerCase();

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            {/* Top Section: Image & Title */}
            <div className="text-center space-y-6">
                <div className="relative w-full h-[400px] bg-white rounded-3xl shadow-xl shadow-gray-200/50 flex items-center justify-center overflow-hidden p-8 border border-gray-100">
                    <img
                        src={vehicle.metadata?.image || 'https://via.placeholder.com/800x500'}
                        alt={vehicle.metadata?.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                    />
                    <div className="absolute top-6 right-6">
                        {vehicle.listed ? <StatPill label="Listed for Sale" color="green" /> : <StatPill label="Not Listed" color="gray" />}
                    </div>
                </div>

                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{vehicle.metadata?.name || `Vehicle #${vehicle.tokenId}`}</h1>
                    <p className="text-lg text-gray-500 mt-2">{vehicle.metadata?.model} • {vehicle.metadata?.year}</p>
                </div>
            </div>

            {/* Metadata Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-10 space-y-10">

                {/* Section 1: Key Specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">Vehicle Model</h3>
                        <p className="text-xl font-medium text-gray-900">{vehicle.metadata?.model || 'Unknown Model'}</p>
                        <p className="text-sm text-gray-500 mt-1">{vehicle.metadata?.description}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">Price</h3>
                        <p className="text-xl font-medium text-gray-900">
                            {vehicle.listed ? `${formatEther(vehicle.price)} MON` : 'Not Listed'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Owner: <span className="font-mono text-gray-700">{vehicle.currentOwner.slice(0, 6)}...{vehicle.currentOwner.slice(-4)}</span>
                            {isOwner && <span className="ml-2 text-emerald-600 font-bold">(You)</span>}
                        </p>
                    </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Section 2: Delivery */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Delivery Status</h3>
                    <DeliveryTimeline stage={vehicle.deliveryStage} />
                </div>

                <div className="h-px bg-gray-100" />

                {/* Section 3: Service Records */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Service Records</h3>
                    <ServiceHistory events={serviceEvents} />
                </div>

                {/* Section 4: Actions */}
                <div className="pt-6">
                    {/* Buy Button */}
                    {vehicle.listed && !isOwner && (
                        <button
                            onClick={handleBuy}
                            disabled={isPending || isConfirming}
                            className="w-full py-4 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-gray-200 disabled:opacity-50"
                        >
                            {isPending || isConfirming ? 'Processing...' : `Buy Now for ${formatEther(vehicle.price)} MON`}
                        </button>
                    )}

                    {/* Owner Actions */}
                    {isOwner && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vehicle.listed ? (
                                    <button
                                        onClick={handleUnlist}
                                        disabled={isPending || isConfirming}
                                        className="py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Unlist Vehicle
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Price (MON)"
                                            value={listPrice}
                                            onChange={(e) => setListPrice(e.target.value)}
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 focus:outline-none focus:border-black transition-colors"
                                        />
                                        <button
                                            onClick={handleList}
                                            disabled={!listPrice || isPending || isConfirming}
                                            className="px-8 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            List
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={handleAdvanceDelivery}
                                    disabled={vehicle.deliveryStage >= 2 || isPending || isConfirming}
                                    className="py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Advance Delivery
                                </button>
                            </div>

                            {/* Add Service */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900 mb-3">Add Service Entry</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={serviceDesc}
                                        onChange={(e) => setServiceDesc(e.target.value)}
                                        placeholder="e.g. Tire rotation, Software update..."
                                        className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-black"
                                    />
                                    <button
                                        onClick={handleAddService}
                                        disabled={!serviceDesc || isPending || isConfirming}
                                        className="px-6 py-2 bg-white border border-gray-300 text-gray-900 font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
