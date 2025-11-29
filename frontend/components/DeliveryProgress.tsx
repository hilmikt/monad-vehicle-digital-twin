import React from 'react';
import { clsx } from 'clsx';

interface DeliveryProgressProps {
    currentStopIndex: number;
    stops: string[];
}

export default function DeliveryProgress({ currentStopIndex, stops }: DeliveryProgressProps) {
    return (
        <div className="space-y-4 relative">
            {/* Connecting Line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-zinc-700" />

            {stops.map((stop, index) => {
                const isCurrent = index === currentStopIndex;
                const isPast = index < currentStopIndex;

                return (
                    <div key={stop} className="relative flex items-center gap-4 text-sm z-10">
                        <div
                            className={clsx(
                                "h-6 w-6 flex items-center justify-center transition-all duration-500 rounded-full",
                                isPast ? "bg-emerald-500 text-black" : "bg-zinc-900",
                                isCurrent ? "opacity-100 scale-110" : isPast ? "opacity-100" : "opacity-30 grayscale"
                            )}
                        >
                            {isPast ? (
                                <span className="text-xs font-bold">✓</span>
                            ) : (
                                <span className="text-lg leading-none">🚚</span>
                            )}
                        </div>
                        <span
                            className={clsx(
                                "transition-colors duration-500",
                                isPast ? "text-emerald-500 font-medium" : isCurrent ? "text-white font-bold" : "text-zinc-500"
                            )}
                        >
                            {stop}
                        </span>
                        {isCurrent && (
                            <div className="absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-blue-500/30 animate-ping" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
