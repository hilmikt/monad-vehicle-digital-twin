import React from 'react';
import Link from 'next/link';
import { formatEther } from 'viem';
import { VehicleView } from '../lib/contracts';
import StatPill from './StatPill';

interface VehicleCardProps {
    vehicle: VehicleView;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
    const { tokenId, metadata, price, listed } = vehicle;

    const imageUrl = metadata?.image || 'https://via.placeholder.com/600x400?text=No+Image';
    const title = metadata?.name || `Vehicle #${tokenId}`;
    const subtitle = metadata?.model ? `${metadata.year || ''} ${metadata.model}` : `Token ID: ${tokenId}`;

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col h-full">
            {/* Image Area */}
            <div className="relative h-56 bg-gray-50 p-6 flex items-center justify-center">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                    {listed ? <StatPill label="Listed" color="green" /> : <StatPill label="Unlisted" color="gray" />}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 flex flex-col flex-1">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{title}</h3>
                    <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Price</span>
                        <span className="text-lg font-bold text-gray-900">
                            {listed ? `${formatEther(price)} MON` : '---'}
                        </span>
                    </div>

                    <Link
                        href={`/vehicle/${tokenId}`}
                        className="px-6 py-2 text-sm font-bold text-gray-900 bg-white border border-gray-200 hover:border-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
}
