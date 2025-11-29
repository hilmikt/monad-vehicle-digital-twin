'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function WalletConnectButton() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />;
    }

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-4">
                <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-300 shadow-sm"
                >
                    <span className="mr-2 text-emerald-600">●</span>
                    {address.slice(0, 6)}...{address.slice(-4)}
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => {
                const connector = connectors[0];
                if (connector) connect({ connector });
            }}
            className="px-6 py-2 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-lg transition-all shadow-lg shadow-gray-200"
        >
            Connect Wallet
        </button>
    );
}
