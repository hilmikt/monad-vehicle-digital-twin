'use client';

import React from 'react';
import { useActivityFeedStore, ActivityType } from '../lib/activityStore';

export default function ActivityFeed() {
    const { activities } = useActivityFeedStore();

    const getTypeStyles = (type: ActivityType) => {
        switch (type) {
            case 'MINT': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'PURCHASE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'DELIVERY': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'SERVICE': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="w-full h-full bg-white border-l border-gray-200 flex flex-col shadow-xl shadow-gray-200/50">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Live Activity
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activities.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8 italic">
                        No recent activity.
                    </div>
                ) : (
                    activities.map((item) => (
                        <div key={item.id} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTypeStyles(item.type)}`}>
                                    {item.type}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700 font-medium leading-snug">
                                {item.message}
                            </p>
                            {item.txHash && (
                                <a
                                    href={`https://testnet.monadexplorer.com/tx/${item.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 mt-1"
                                >
                                    View TX ↗
                                </a>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
