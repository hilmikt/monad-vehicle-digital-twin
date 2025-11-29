interface ServiceEvent {
    timestamp: bigint;
    description: string;
    addedBy: string;
}

interface ServiceHistoryProps {
    serviceEvents: ServiceEvent[];
}

export default function ServiceHistory({ serviceEvents }: ServiceHistoryProps) {
    if (!serviceEvents || serviceEvents.length === 0) {
        return (
            <div className="text-gray-500 italic text-center py-4">
                No service history available.
            </div>
        );
    }

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {serviceEvents.map((event, eventIdx) => (
                    <li key={eventIdx}>
                        <div className="relative pb-8">
                            {eventIdx !== serviceEvents.length - 1 ? (
                                <span
                                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                    aria-hidden="true"
                                />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-900">
                                        <svg
                                            className="h-5 w-5 text-white"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {event.description}{" "}
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                by {event.addedBy.slice(0, 6)}...{event.addedBy.slice(-4)}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                        <time dateTime={new Date(Number(event.timestamp) * 1000).toISOString()}>
                                            {new Date(Number(event.timestamp) * 1000).toLocaleDateString()}
                                        </time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
