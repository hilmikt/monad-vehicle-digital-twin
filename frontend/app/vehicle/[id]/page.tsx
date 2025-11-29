"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { vehicleNftAbi, vehicleNftAddress } from "../../lib/contracts";
import DeliveryTimeline from "../../components/DeliveryTimeline";
import ServiceHistory from "../../components/ServiceHistory";
import { formatEther, parseEther } from "viem";

export default function VehicleDetail() {
    const params = useParams();
    const id = params.id as string;
    const tokenId = BigInt(id);
    const { address } = useAccount();
    const { writeContract } = useWriteContract();

    const [serviceDescription, setServiceDescription] = useState("");

    // Fetch vehicle details
    const { data: vehicleData, isLoading: isVehicleLoading } = useReadContract({
        address: vehicleNftAddress,
        abi: vehicleNftAbi,
        functionName: "vehicles",
        args: [tokenId],
    });

    // Fetch service history
    const { data: serviceHistory, isLoading: isHistoryLoading } = useReadContract({
        address: vehicleNftAddress,
        abi: vehicleNftAbi,
        functionName: "getServiceEvents",
        args: [tokenId],
    });

    // Fetch token URI (metadata)
    const { data: tokenURI } = useReadContract({
        address: vehicleNftAddress,
        abi: vehicleNftAbi,
        functionName: "tokenURI",
        args: [tokenId],
    });

    const [metadata, setMetadata] = useState<any>(null);

    useEffect(() => {
        if (tokenURI) {
            try {
                // In a real app, fetch from IPFS/URL. For demo, we might have stored JSON string directly or need to fetch.
                // Assuming simple JSON string for this demo if it starts with {
                if (tokenURI.startsWith("{")) {
                    setMetadata(JSON.parse(tokenURI));
                } else {
                    // Fetch from URL
                    // fetch(tokenURI).then(res => res.json()).then(setMetadata);
                    // Fallback for demo
                    setMetadata({ model: "Unknown Model", year: 2024, image: "" });
                }
            } catch (e) {
                console.error("Failed to parse metadata", e);
            }
        }
    }, [tokenURI]);

    if (isVehicleLoading || isHistoryLoading) {
        return <div className="p-8 text-center">Loading vehicle details...</div>;
    }

    if (!vehicleData) {
        return <div className="p-8 text-center">Vehicle not found.</div>;
    }

    const [currentOwner, price, listed, deliveryStage] = vehicleData as [string, bigint, boolean, number];

    const handlePurchase = () => {
        writeContract({
            address: vehicleNftAddress,
            abi: vehicleNftAbi,
            functionName: "purchaseVehicle",
            args: [tokenId],
            value: price,
        });
    };

    const handleAdvanceDelivery = () => {
        writeContract({
            address: vehicleNftAddress,
            abi: vehicleNftAbi,
            functionName: "advanceDelivery",
            args: [tokenId],
        });
    };

    const handleAddService = (e: React.FormEvent) => {
        e.preventDefault();
        if (!serviceDescription) return;

        writeContract({
            address: vehicleNftAddress,
            abi: vehicleNftAbi,
            functionName: "addServiceEvent",
            args: [tokenId, serviceDescription],
        });
        setServiceDescription("");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            {metadata?.year} {metadata?.model}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Token ID: {id}</p>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatEther(price)} ETH
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            {metadata?.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={metadata.image} alt={metadata.model} className="w-full h-auto rounded-lg shadow-md" />
                            ) : (
                                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}

                            <div className="mt-6">
                                <h4 className="text-sm font-medium text-gray-500">Owner</h4>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{currentOwner}</p>
                            </div>

                            <div className="mt-6">
                                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                <div className="mt-2">
                                    <DeliveryTimeline deliveryStage={deliveryStage} />
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col gap-4">
                                {listed && currentOwner !== address && (
                                    <button
                                        onClick={handlePurchase}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                                    >
                                        Purchase Vehicle
                                    </button>
                                )}

                                {(currentOwner === address) && (
                                    <button
                                        onClick={handleAdvanceDelivery}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                        disabled={deliveryStage >= 2}
                                    >
                                        Advance Delivery Stage
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Service History</h4>
                            <ServiceHistory serviceEvents={serviceHistory as any[]} />

                            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Add Service Event</h4>
                                <form onSubmit={handleAddService} className="flex gap-4">
                                    <input
                                        type="text"
                                        value={serviceDescription}
                                        onChange={(e) => setServiceDescription(e.target.value)}
                                        placeholder="e.g. Oil Change, Tire Rotation"
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm p-2"
                                    />
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Add Record
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
