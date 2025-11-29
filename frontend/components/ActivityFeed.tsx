'use client';

import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useActivityFeedStore, ActivityType } from '../lib/activityStore';

// Force rebuild
export default function ActivityFeed() {
    const { activities } = useActivityFeedStore();

    // Hydration fix: only render relative time on client
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getTypeStyles = (type: ActivityType) => {
        switch (type) {
            case 'MINT': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'PURCHASE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'DELIVERY': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'SERVICE': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const getTypeDotColor = (type: ActivityType) => {
        switch (type) {
            case 'MINT': return 'bg-purple-500';
            case 'PURCHASE': return 'bg-emerald-500';
            case 'DELIVERY': return 'bg-blue-500';
            case 'SERVICE': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="w-full h-full bg-zinc-900 border-l border-white/10 flex flex-col shadow-xl shadow-black/20">
            <div className="p-6 border-b border-white/10">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live Activity
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {activities.length === 0 ? (
                    <div className="text-center text-zinc-500 text-sm py-8 italic">
                        No recent activity.
                    </div>
                ) : (
                    activities.map((item) => (
                        <div key={item.id} className="relative pl-4 border-l border-white/10 pb-1 last:pb-0">
                            <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-900 ${getTypeDotColor(item.type)}`} />

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTypeStyles(item.type)}`}>
                                        {item.type}
                                    </span>
                                    <span className="text-[10px] text-zinc-500">
                                        {mounted ? formatDistanceToNow(item.timestamp, { addSuffix: true }) : '...'}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-300 font-medium leading-snug">
                                    {item.message}
                                </p>
                                {item.txHash && (
                                    <a
                                        href={`https://testnet.monadexplorer.com/tx/${item.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 mt-1"
                                    >
                                        View TX ↗
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

