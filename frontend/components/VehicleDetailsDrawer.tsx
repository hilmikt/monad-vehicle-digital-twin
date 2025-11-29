import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatEther } from 'viem';
import { DemoVehicle } from '../lib/demoVehicles';
import { VehicleView } from '../lib/contracts';

interface VehicleDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    variant: "demo" | "onchain";
    demoData?: DemoVehicle;
    onchainData?: VehicleView;
    onBuy?: () => void;
}

export default function VehicleDetailsDrawer({
    isOpen,
    onClose,
    variant,
    demoData,
    onchainData,
    onBuy
}: VehicleDetailsDrawerProps) {
    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

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

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Section: Vehicle Details */}
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

                    {/* Section: History / Records */}
                    <section>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                            History & Records
                        </h3>

                        <div className="space-y-4">
                            {/* Past Sales */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <span className="text-emerald-500 text-xs">$$</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Past Sales</p>
                                    <p className="text-xs text-zinc-400">{pastSales}</p>
                                </div>
                            </div>

                            {/* Service Records */}
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

                    {/* On-chain Info */}
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
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/10 bg-zinc-900">
                    <button
                        onClick={onBuy}
                        className="w-full py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <span>Buy Now</span>
                        <span className="text-sm font-normal opacity-60">
                            — {priceLabel}
                        </span>
                    </button>
                    {isDemo && (
                        <p className="text-center text-[10px] text-zinc-500 mt-3">
                            This is a demo vehicle. Transaction will be simulated.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
