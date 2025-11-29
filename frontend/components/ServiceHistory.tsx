import React from 'react';
import { ServiceEventView } from '../lib/contracts';

interface ServiceHistoryProps {
    events: ServiceEventView[];
}

export default function ServiceHistory({ events }: ServiceHistoryProps) {
    if (!events || events.length === 0) {
        return (
            <div className="text-gray-400 text-sm italic py-4">
                No service history recorded.
            </div>
        );
    }

    const sortedEvents = [...events].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

    return (
        <div className="space-y-0 divide-y divide-gray-100">
            {sortedEvents.map((event, idx) => (
                <div key={idx} className="py-4 flex gap-4 items-start">
                    <div className="flex-shrink-0 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{event.description}</span>
                            <span className="text-xs text-gray-400 font-mono">
                                {new Date(Number(event.timestamp) * 1000).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">
                            Logged by: <span className="font-mono">{event.addedBy.slice(0, 6)}...{event.addedBy.slice(-4)}</span>
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
