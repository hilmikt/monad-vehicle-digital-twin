'use client';

import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatEther } from 'viem';
import { useChainId } from 'wagmi';
import { DemoVehicle } from '../lib/demoVehicles';
import { VehicleView, vehicleNftAddress, vehicleNftAbi } from '../lib/contracts';
import { useActivityFeedStore } from '../lib/activityStore';
import { useBuyVehicle } from '../lib/useBuyVehicle';
import { useRentTransaction } from '../lib/useRentTransaction';
import { monadTestnet, config } from '../lib/wagmiConfig';
import { waitForTransactionReceipt, readContract } from '@wagmi/core';
import { useReadContract, useReadContracts } from 'wagmi';
import DeliveryProgress from './DeliveryProgress';

// Fleet configuration
const RIVIAN_FLEET_START = 8;
const RIVIAN_FLEET_END = 27;
const RIVIAN_FLEET_IDS = Array.from({ length: RIVIAN_FLEET_END - RIVIAN_FLEET_START + 1 }, (_, i) => RIVIAN_FLEET_START + i);

type DrawerMode = "details" | "checkout" | "confirm" | "success" | "rent_details" | "rent_success";

interface VehicleDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    variant: "demo" | "onchain";
    demoData?: DemoVehicle;
    onchainData?: VehicleView;
    onPurchaseComplete?: (options?: { demo?: boolean }) => void;
    modeOverride?: "buy" | "rent";
}

export default function VehicleDetailsDrawer({
    isOpen,
    onClose,
    variant,
    demoData,
    onchainData,
    onPurchaseComplete,
    modeOverride
}: VehicleDetailsDrawerProps) {
    const [mode, setMode] = useState<DrawerMode>("details");
    const [buyerInfo, setBuyerInfo] = useState({
        fullName: "",
        email: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
    });
    const [rentInfo, setRentInfo] = useState({
        fullName: "",
        email: "",
        startDate: "",
        duration: "3",
        notes: ""
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const { addActivity } = useActivityFeedStore();
    // Fetch fleet status for Rivian (demo-4)
    const { data: fleetData } = useReadContracts({
        contracts: RIVIAN_FLEET_IDS.map(id => ({
            address: vehicleNftAddress,
            abi: vehicleNftAbi,
            functionName: 'getVehicle',
            args: [BigInt(id)],
        })),
        query: {
            enabled: demoData?.id === 'demo-4',
        }
    });

    // Find first available vehicle in fleet
    const availableFleetToken = React.useMemo(() => {
        if (!fleetData) return null;
        for (let i = 0; i < fleetData.length; i++) {
            const result = fleetData[i];
            if (result.status === 'success' && result.result) {
                const vehicle = result.result as any;
                if (vehicle.listed) {
                    return {
                        tokenId: RIVIAN_FLEET_IDS[i],
                        price: vehicle.price
                    };
                }
            }
        }
        return null;
    }, [fleetData]);

    const { buyVehicle } = useBuyVehicle();
    const { sendRentTx } = useRentTransaction();
    const chainId = useChainId();
    const isWrongNetwork = !!chainId && chainId !== monadTestnet.id;

    // Fetch real service records (Moved to top level to avoid hook ordering issues)
    const { data: realServiceRecords } = useReadContract({
        address: vehicleNftAddress,
        abi: vehicleNftAbi,
        functionName: 'getServiceRecords',
        args: [onchainData?.tokenId ? BigInt(onchainData.tokenId) : BigInt(0)],
        query: {
            enabled: !!onchainData?.tokenId,
        }
    });

    // Reset state when opening/closing
    useEffect(() => {
        if (isOpen) {
            setMode(modeOverride === "rent" ? "rent_details" : "details");
            setIsProcessing(false);
            setTxHash(null);
            setError(null);
            setCurrentStopIndex(0);
        } else {
            document.body.style.overflow = 'unset';
        }

        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, modeOverride]);

    // Route simulation
    const routeStops = [
        "Factory – New York, NY",
        "Regional Hub – Chicago, IL",
        "Delivery Center – Denver, CO",
        `Your Address – ${buyerInfo.city || 'City'}, ${buyerInfo.country || 'Country'}`,
    ];

    useEffect(() => {
        if (mode !== "success") return;
        setCurrentStopIndex(0);

        const interval = setInterval(() => {
            setCurrentStopIndex((prev) => {
                if (prev >= routeStops.length - 1) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 10000); // 10 seconds per hop

        return () => clearInterval(interval);
    }, [mode]);

    if (!isOpen) return null;

    const isDemo = variant === 'demo';
    const data = isDemo ? demoData : onchainData;

    if (!data) return null;

    // Normalize data for display
    const image = isDemo ? demoData?.image : onchainData?.metadata?.image;
    const name = isDemo ? demoData?.name : (onchainData?.metadata?.name || `Vehicle #${onchainData?.tokenId}`);
    const model = isDemo ? demoData?.model : onchainData?.metadata?.model;
    const year = isDemo ? demoData?.year : onchainData?.metadata?.year;
    const priceLabel = isDemo ? demoData?.priceLabel : (onchainData?.price ? `${formatEther(onchainData.price)} MON` : '---');

    // Demo specific fields
    const mileage = isDemo ? demoData?.mileage : '---';
    const software = isDemo ? demoData?.softwareVersion : '---';
    const pastSales = isDemo ? demoData?.pastSales : '---';




    // Combine demo records with real records if needed, or just use real ones for onchain
    const displayServiceRecords = isDemo
        ? demoData?.serviceRecords
        : (realServiceRecords as any[])?.map((r: any) => `${new Date(Number(r.timestamp) * 1000).toLocaleDateString()} / ${r.description}`) || [];

    // On-chain specific fields
    const owner = !isDemo ? onchainData?.currentOwner : null;
    const deliveryStage = !isDemo ? onchainData?.deliveryStage : null;

    const getDeliveryStageLabel = (stage?: number) => {
        switch (stage) {
            case 0: return 'Not Started';
            case 1: return 'In Transit';
            case 2: return 'Delivered';
            default: return 'Unknown';
        }
    };

    const handleCheckoutSubmit = () => {
        // Simple validation
        if (!buyerInfo.fullName || !buyerInfo.email || !buyerInfo.addressLine1 || !buyerInfo.city || !buyerInfo.postalCode || !buyerInfo.country) {
            alert("Please fill in all required fields.");
            return;
        }
        setMode("confirm");
    };

    const handleRentSubmit = async () => {
        if (!rentInfo.fullName || !rentInfo.email || !rentInfo.startDate || !rentInfo.duration) {
            alert("Please fill in all required fields.");
            return;
        }

        if (isWrongNetwork) {
            alert("Please switch to Monad Testnet (Chain ID 10143) to proceed.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const hash = await sendRentTx();
            setTxHash(hash);
            setMode("rent_success");

            addActivity({
                type: 'RENT',
                message: `Rental initiated for ${name} for ${rentInfo.duration} days`,
                txHash: hash
            });
        } catch (err: any) {
            console.error("Rent error:", err);
            setError(err.message || "Rent transaction failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmBuy = async () => {
        // Always use real transaction, even for demo view as requested
        let targetTokenId = onchainData?.tokenId;
        let targetPrice = onchainData?.price;

        if (!targetTokenId) {
            // Map demo vehicles to seeded token IDs
            if (demoData?.id === 'demo-4') {
                // Rivian R1T -> Dynamic Fleet Selection
                if (availableFleetToken) {
                    targetTokenId = availableFleetToken.tokenId;
                    targetPrice = availableFleetToken.price;
                    console.log(`Selected fleet vehicle: Token ID ${targetTokenId}`);
                } else {
                    alert("Sorry, all demo Rivians have been sold! Please contact the admin to restock.");
                    setIsProcessing(false);
                    return;
                }
            } else if (demoData?.id === 'model3') {
                // Model 3 -> Token 6 (Dealer Owned)
                targetTokenId = 6;
            } else {
                // Others -> Token 7 (Dealer Owned)
                targetTokenId = 7;
            }
        }

        if (!targetPrice) {
            // Fetch real price from contract
            try {
                const vehicle = await readContract(config, {
                    address: vehicleNftAddress,
                    abi: vehicleNftAbi,
                    functionName: 'getVehicle',
                    args: [BigInt(targetTokenId)],
                }) as any;
                targetPrice = vehicle.price;
            } catch (e) {
                console.error("Failed to fetch price", e);
                targetPrice = BigInt(0); // Will likely fail but better than crashing
            }
        }

        if (isWrongNetwork) {
            alert("Please switch to Monad Testnet (Chain ID 10143) to proceed.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // Use real purchase for both demo and onchain variants
            const hash = await buyVehicle(Number(targetTokenId), targetPrice);
            setTxHash(hash);

            // Wait for confirmation
            await waitForTransactionReceipt(config, { hash });

            setMode("success"); // now show success + delivery animation

            addActivity({
                type: "PURCHASE",
                message: `Purchased ${name}`,
                txHash: hash,
            });

            onPurchaseComplete?.({ demo: variant === 'demo' });
        } catch (err: any) {
            console.error("Purchase error:", err);
            setError(err.message || "Buy transaction failed or was rejected.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className="relative w-full max-w-md h-full bg-zinc-900 border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header Image */}
                {mode !== 'success' && mode !== 'rent_success' && (
                    <div className="relative h-64 bg-zinc-800 shrink-0">
                        <img
                            src={image || 'https://via.placeholder.com/600x400?text=No+Image'}
                            alt={name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-900 to-transparent h-24" />
                        <div className="absolute bottom-4 left-6">
                            <h2 className="text-2xl font-bold text-white tracking-tight">{name}</h2>
                            <p className="text-zinc-400 font-medium">{year} {model}</p>
                        </div>
                    </div>
                )}

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* MODE: DETAILS */}
                    {mode === 'details' && (
                        <>
                            <section>
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                                    Vehicle Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-800/50 p-3 rounded-xl border border-white/5">
                                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Price</p>
                                        <p className="text-lg font-bold text-white">{priceLabel}</p>
                                    </div>
                                    <div className="bg-zinc-800/50 p-3 rounded-xl border border-white/5">
                                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Mileage</p>
                                        <p className="text-lg font-bold text-white">{mileage}</p>
                                    </div>
                                    <div className="bg-zinc-800/50 p-3 rounded-xl border border-white/5">
                                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Software</p>
                                        <p className="text-sm font-bold text-white truncate">{software}</p>
                                    </div>
                                    {!isDemo && (
                                        <div className="bg-zinc-800/50 p-3 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Delivery</p>
                                            <p className="text-sm font-bold text-white">{getDeliveryStageLabel(deliveryStage || 0)}</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                                    History & Records
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                            <span className="text-emerald-500 text-xs">$$</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Past Sales</p>
                                            <p className="text-xs text-zinc-400">{pastSales}</p>
                                        </div>
                                    </div>
                                    {displayServiceRecords && displayServiceRecords.length > 0 ? (
                                        displayServiceRecords.map((record, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                                    <span className="text-blue-500 text-xs">🛠</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">Service Record</p>
                                                    <p className="text-xs text-zinc-400">{record}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-start gap-3 opacity-50">
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                                <span className="text-zinc-500 text-xs">-</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-zinc-500">No service records</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {!isDemo && (
                                <section>
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                                        On-Chain Data
                                    </h3>
                                    <div className="bg-zinc-800/30 p-4 rounded-xl border border-white/5 space-y-2">
                                        <div>
                                            <p className="text-[10px] text-zinc-500 uppercase">Owner</p>
                                            <p className="text-xs text-zinc-300 font-mono break-all">{owner}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-500 uppercase">Token ID</p>
                                            <p className="text-xs text-zinc-300 font-mono">#{onchainData?.tokenId}</p>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </>
                    )}

                    {/* MODE: CHECKOUT */}
                    {mode === 'checkout' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white">Buyer Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 uppercase mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={buyerInfo.fullName}
                                        onChange={(e) => setBuyerInfo({ ...buyerInfo, fullName: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 uppercase mb-1">Email *</label>
                                    <input
                                        type="email"
                                        className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={buyerInfo.email}
                                        onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 uppercase mb-1">Address Line 1 *</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={buyerInfo.addressLine1}
                                        onChange={(e) => setBuyerInfo({ ...buyerInfo, addressLine1: e.target.value })}
                                        placeholder="123 Main St"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 uppercase mb-1">Address Line 2</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={buyerInfo.addressLine2}
                                        onChange={(e) => setBuyerInfo({ ...buyerInfo, addressLine2: e.target.value })}
                                        placeholder="Apt 4B"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 uppercase mb-1">City *</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            value={buyerInfo.city}
                                            onChange={(e) => setBuyerInfo({ ...buyerInfo, city: e.target.value })}
                                            placeholder="New York"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 uppercase mb-1">State / Region</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            value={buyerInfo.state}
                                            onChange={(e) => setBuyerInfo({ ...buyerInfo, state: e.target.value })}
                                            placeholder="NY"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 uppercase mb-1">Postal Code *</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            value={buyerInfo.postalCode}
                                            onChange={(e) => setBuyerInfo({ ...buyerInfo, postalCode: e.target.value })}
                                            placeholder="10001"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 uppercase mb-1">Country *</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            value={buyerInfo.country}
                                            onChange={(e) => setBuyerInfo({ ...buyerInfo, country: e.target.value })}
                                            placeholder="USA"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODE: CONFIRM */}
                    {mode === 'confirm' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white">Review & Confirm</h2>

                            <div className="bg-zinc-800/50 p-4 rounded-xl border border-white/5 space-y-3">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Vehicle</h3>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-white font-bold">{name}</p>
                                        <p className="text-sm text-zinc-400">{year} {model}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-emerald-400 font-bold">{priceLabel}</p>
                                        <p className="text-[10px] text-zinc-500">{isDemo ? '(Simulation)' : '(Plus Gas)'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-800/50 p-4 rounded-xl border border-white/5 space-y-3">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Delivery Details</h3>
                                <div className="text-sm text-zinc-300 space-y-1">
                                    <p className="font-bold text-white">{buyerInfo.fullName}</p>
                                    <p>{buyerInfo.addressLine1}</p>
                                    {buyerInfo.addressLine2 && <p>{buyerInfo.addressLine2}</p>}
                                    <p>{buyerInfo.city}, {buyerInfo.state} {buyerInfo.postalCode}</p>
                                    <p>{buyerInfo.country}</p>
                                    <p className="text-zinc-500 text-xs mt-2">{buyerInfo.email}</p>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs break-all">
                                    Error: {error}
                                </div>
                            )}
                            {isWrongNetwork && !isDemo && (
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-xs">
                                    Please switch your wallet network to Monad Testnet (Chain ID 10143) to proceed.
                                </div>
                            )}
                        </div>
                    )}

                    {/* MODE: SUCCESS */}
                    {mode === 'success' && (
                        <div className="flex flex-col items-center justify-center h-full space-y-8 py-10">
                            <div className="text-6xl animate-bounce">🚚</div>
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-white">Delivery is on the way</h2>
                                <p className="text-zinc-400 text-sm max-w-xs mx-auto">
                                    Your digital twin has been purchased. We're simulating the delivery route in real time.
                                </p>
                                {txHash && (
                                    <a
                                        href={`https://testnet.monadexplorer.com/tx/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-2 text-xs text-emerald-500 hover:text-emerald-400 underline"
                                    >
                                        View Transaction: {txHash.slice(0, 6)}...{txHash.slice(-4)}
                                    </a>
                                )}
                            </div>

                            <div className="w-full max-w-xs bg-zinc-800/50 p-6 rounded-2xl border border-white/5">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 text-center">
                                    Live Route Tracking
                                </h3>
                                <DeliveryProgress currentStopIndex={currentStopIndex} stops={routeStops} />
                            </div>
                        </div>

                    )}

                    {/* MODE: RENT DETAILS */}
                    {mode === 'rent_details' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white">Rental Details</h2>
                            <div className="bg-zinc-800/50 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-zinc-400 uppercase">Daily Rate</p>
                                    <p className="text-lg font-bold text-white">$120/day</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-zinc-400 uppercase">Vehicle</p>
                                    <p className="text-sm font-bold text-white">{name}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 uppercase mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={rentInfo.fullName}
                                        onChange={(e) => setRentInfo({ ...rentInfo, fullName: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 uppercase mb-1">Email *</label>
                                    <input
                                        type="email"
                                        className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={rentInfo.email}
                                        onChange={(e) => setRentInfo({ ...rentInfo, email: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 uppercase mb-1">Start Date *</label>
                                        <input
                                            type="date"
                                            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            value={rentInfo.startDate}
                                            onChange={(e) => setRentInfo({ ...rentInfo, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 uppercase mb-1">Duration (Days) *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            value={rentInfo.duration}
                                            onChange={(e) => setRentInfo({ ...rentInfo, duration: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 uppercase mb-1">Special Notes</label>
                                    <textarea
                                        className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-20"
                                        value={rentInfo.notes}
                                        onChange={(e) => setRentInfo({ ...rentInfo, notes: e.target.value })}
                                        placeholder="Any special requests..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODE: RENT SUCCESS */}
                    {mode === 'rent_success' && (
                        <div className="flex flex-col items-center justify-center h-full space-y-6 py-10">
                            <div className="text-6xl animate-bounce">🔑</div>
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-white">Rental Confirmed</h2>
                                <p className="text-zinc-400 text-sm max-w-xs mx-auto">
                                    Your rental for <strong>{name}</strong> has been booked.
                                </p>
                            </div>
                            <div className="bg-zinc-800/50 p-6 rounded-2xl border border-white/5 w-full">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-zinc-400">Duration</span>
                                    <span className="text-white font-bold">{rentInfo.duration} Days</span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-zinc-400">Start Date</span>
                                    <span className="text-white font-bold">{rentInfo.startDate}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Total Cost</span>
                                    <span className="text-emerald-400 font-bold">${parseInt(rentInfo.duration) * 120}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/10 bg-zinc-900">
                    {mode === 'details' && (
                        <button
                            onClick={() => setMode("checkout")}
                            className="w-full py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <span>Buy Now</span>
                            <span className="text-sm font-normal opacity-60">
                                — {priceLabel}
                            </span>
                        </button>
                    )}

                    {mode === 'checkout' && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setMode("details")}
                                className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleCheckoutSubmit}
                                className="flex-[2] py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {mode === 'confirm' && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setMode("checkout")}
                                disabled={isProcessing}
                                className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleConfirmBuy}
                                disabled={isProcessing}
                                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-60 flex-[2]"
                            >
                                {isProcessing ? "Processing..." : "Confirm & Buy"}
                            </button>
                        </div>
                    )}

                    {mode === 'success' && (
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
                        >
                            Close
                        </button>
                    )}

                    {mode === 'rent_details' && (
                        <button
                            onClick={handleRentSubmit}
                            disabled={isProcessing || isWrongNetwork}
                            className="w-full py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <span>Confirm Rental</span>
                            )}
                        </button>
                    )}

                    {mode === 'rent_details' && isWrongNetwork && (
                        <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-xs text-center">
                            Please switch your wallet network to Monad Testnet (Chain ID 10143) to proceed.
                        </div>
                    )}

                    {mode === 'rent_success' && (
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
                        >
                            Close
                        </button>
                    )}

                    {isDemo && mode !== 'success' && mode !== 'rent_success' && (
                        <p className="text-center text-[10px] text-zinc-500 mt-3">
                            This is a demo vehicle. Transaction will be simulated.
                        </p>
                    )}
                </div>
            </div>
        </div >
    );
}
