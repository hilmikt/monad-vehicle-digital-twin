'use client';

import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatEther } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { DemoVehicle } from '../lib/demoVehicles';
import { VehicleView, vehicleNftAbi, vehicleNftAddress } from '../lib/contracts';
import { useActivityFeedStore } from '../lib/activityStore';

type DrawerMode = "details" | "checkout" | "confirm" | "success";

interface VehicleDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    variant: "demo" | "onchain";
    demoData?: DemoVehicle;
    onchainData?: VehicleView;
    onPurchaseComplete?: (options?: { demo?: boolean }) => void;
}

export default function VehicleDetailsDrawer({
    isOpen,
    onClose,
    variant,
    demoData,
    onchainData,
    onPurchaseComplete
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
    const [isProcessing, setIsProcessing] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);

    const { addActivity } = useActivityFeedStore();
    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash
    });

    // Reset state when opening/closing
    useEffect(() => {
        if (isOpen) {
            setMode("details");
            setIsProcessing(false);
            setTxHash(null);
            setCurrentStopIndex(0);
            // Optional: reset form or keep it? Keeping it is friendlier.
        } else {
            document.body.style.overflow = 'unset';
        }

        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle on-chain success
    useEffect(() => {
        if (isConfirmed && hash && mode === 'confirm') {
            setIsProcessing(false);
            setTxHash(hash);
            setMode("success");

            const name = variant === 'demo' ? demoData?.name : (onchainData?.metadata?.name || `Vehicle #${onchainData?.tokenId}`);
            const priceLabel = variant === 'demo' ? demoData?.priceLabel : (onchainData?.price ? `${formatEther(onchainData.price)} MON` : '---');

            addActivity({
                type: 'PURCHASE',
                message: `Purchased ${name} for ${priceLabel}`,
                txHash: hash
            });

            onPurchaseComplete?.({ demo: false });
        }
    }, [isConfirmed, hash, mode, variant, demoData, onchainData, addActivity, onPurchaseComplete]);

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
        }, 1200);

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
    const serviceRecords = isDemo ? demoData?.serviceRecords : [];

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

    const handleConfirmBuy = async () => {
        setIsProcessing(true);

        if (isDemo) {
            // Simulate demo purchase
            setTimeout(() => {
                setIsProcessing(false);
                setMode("success");

                addActivity({
                    type: 'PURCHASE',
                    message: `Simulated purchase of ${name}`,
                });

                onPurchaseComplete?.({ demo: true });
            }, 1500);
        } else {
            // On-chain purchase
            if (!onchainData) return;

            try {
                writeContract({
                    address: vehicleNftAddress,
                    abi: vehicleNftAbi,
                    functionName: 'purchaseVehicle',
                    args: [BigInt(onchainData.tokenId)],
                    value: onchainData.price,
                });
                // Success handled in useEffect via isConfirmed
            } catch (err) {
                console.error("Purchase error:", err);
                setIsProcessing(false);
                alert("Transaction failed to start. See console.");
            }
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

                {/* Header Image (only show in details, checkout, confirm) */}
                {mode !== 'success' && (
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
                                    {serviceRecords && serviceRecords.length > 0 ? (
                                        serviceRecords.map((record, idx) => (
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

                            {writeError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                                    Error: {writeError.message}
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
                                <div className="space-y-4 relative">
                                    {/* Connecting Line */}
                                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-zinc-700" />

                                    {routeStops.map((stop, index) => {
                                        const isActive = index <= currentStopIndex;
                                        const isCurrent = index === currentStopIndex;

                                        return (
                                            <div key={stop} className="relative flex items-center gap-4 text-sm z-10">
                                                <div
                                                    className={clsx(
                                                        "h-6 w-6 rounded-full flex items-center justify-center border-2 transition-colors duration-500",
                                                        isActive ? "bg-emerald-500 border-emerald-500" : "bg-zinc-900 border-zinc-700"
                                                    )}
                                                >
                                                    {isActive && (
                                                        <span className="text-white text-[10px]">✓</span>
                                                    )}
                                                </div>
                                                <span
                                                    className={clsx(
                                                        "transition-colors duration-500",
                                                        isActive ? "text-white font-medium" : "text-zinc-500"
                                                    )}
                                                >
                                                    {stop}
                                                </span>
                                                {isCurrent && (
                                                    <div className="absolute left-0 top-0 h-6 w-6 rounded-full bg-emerald-500 animate-ping opacity-75" />
                                                )}
                                            </div>
                                        );
                                    })}
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
                                disabled={isProcessing || isPending || isConfirming}
                                className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleConfirmBuy}
                                disabled={isProcessing || isPending || isConfirming}
                                className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {(isProcessing || isPending || isConfirming) ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <span>Confirm & Buy</span>
                                )}
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

                    {isDemo && mode !== 'success' && (
                        <p className="text-center text-[10px] text-zinc-500 mt-3">
                            This is a demo vehicle. Transaction will be simulated.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
