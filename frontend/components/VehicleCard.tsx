import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type VehicleCardVariant = "demo" | "onchain";

interface VehicleCardProps {
    variant: VehicleCardVariant;
    id: string;
    name: string;
    model?: string;
    year?: string;
    image?: string;
    priceLabel: string;
    listed?: boolean;
    deliveryStageLabel?: string;
    onClick?: () => void;
}

export default function VehicleCard({
    variant,
    id,
    name,
    model,
    year,
    image,
    priceLabel,
    listed,
    deliveryStageLabel,
    onClick
}: VehicleCardProps) {
    const imageUrl = image || 'https://via.placeholder.com/600x400?text=No+Image';

    return (
        <div
            onClick={onClick}
            className={twMerge(
                "group relative flex flex-col h-full cursor-pointer",
                "bg-zinc-900 rounded-3xl overflow-hidden",
                "border border-white/10 shadow-lg hover:shadow-2xl hover:shadow-black/50",
                "transition-all duration-300 hover:-translate-y-1"
            )}
        >
            {/* Image Section */}
            <div className="relative h-64 bg-zinc-800/50 overflow-hidden">
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Status Badge */}
                <div className="absolute top-4 right-4 flex gap-2">
                    {variant === 'demo' && (
                        <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 backdrop-blur-md rounded-full border border-blue-500/30">
                            Demo Vehicle
                        </span>
                    )}
                    {listed && variant === 'onchain' && (
                        <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 backdrop-blur-md rounded-full border border-emerald-500/30">
                            Listed
                        </span>
                    )}
                    {deliveryStageLabel && (
                        <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/80 backdrop-blur-md rounded-full border border-white/10">
                            {deliveryStageLabel}
                        </span>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1 bg-gradient-to-b from-zinc-900 to-black">
                <div className="mb-4">
                    <h3 className="text-xl font-semibold text-white mb-1 truncate tracking-tight">
                        {name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
                        {year && <span>{year}</span>}
                        {model && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                <span>{model}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
                            Price
                        </span>
                        <span className="text-lg font-bold text-white tracking-tight">
                            {priceLabel}
                        </span>
                    </div>

                    <button className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
}

