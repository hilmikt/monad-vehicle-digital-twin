'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { readContract } from '@wagmi/core';
import { parseEther } from 'viem';
import { config } from '../../lib/wagmiConfig';
import { vehicleNftAbi, vehicleNftAddress } from '../../lib/contracts';
import { useActivityFeedStore } from '../../lib/activityStore';

export default function AdminPage() {
    const { address, isConnected } = useAccount();
    const { addActivity } = useActivityFeedStore();
    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(true);

    const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        const checkOwner = async () => {
            if (!address) return;
            try {
                const owner = await readContract(config, {
                    address: vehicleNftAddress,
                    abi: vehicleNftAbi,
                    functionName: 'owner',
                }) as string;

                setIsOwner(owner.toLowerCase() === address.toLowerCase());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        checkOwner();
    }, [address]);

    useEffect(() => {
        if (isConfirmed) {
            addActivity({ type: 'MINT', message: "Minted demo vehicles batch", txHash: hash });
        }
    }, [isConfirmed]);

    const handleMintDemo = async () => {
        if (!address) return;

        const prices = ["0.1", "0.2", "0.3"];
        const baseUri = typeof window !== 'undefined' ? window.location.origin : '';
        const randomId = Math.floor(Math.random() * 1000);
        const price = prices[Math.floor(Math.random() * prices.length)];

        writeContract({
            address: vehicleNftAddress,
            abi: vehicleNftAbi,
            functionName: 'mintVehicle',
            args: [address, parseEther(price), `${baseUri}/api/metadata/${randomId}`],
        });
    };

    if (!isConnected) return <div className="p-12 text-center text-gray-500">Please connect wallet.</div>;
    if (loading) return <div className="p-12 text-center text-gray-500">Checking permissions...</div>;

    if (!isOwner) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-2xl">⚠️</div>
                <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
                <p className="text-gray-500">You are not the contract owner.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200">
                    Contract Owner
                </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Demo Management</h2>
                <p className="text-gray-500 mb-8">
                    Mint new vehicles for testing purposes. Each mint will create a vehicle with random metadata and assign it to your wallet.
                </p>

                <button
                    onClick={handleMintDemo}
                    disabled={isPending || isConfirming}
                    className="w-full sm:w-auto px-8 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isPending || isConfirming ? 'Processing...' : 'Mint Demo Vehicle'}
                </button>

                {isConfirmed && (
                    <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-medium">
                        ✅ Vehicle minted successfully!
                    </div>
                )}
                {writeError && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-medium">
                        ❌ Error: {writeError.message.split('\n')[0]}
                    </div>
                )}
            </div>
        </div>
    );
}
