interface DeliveryTimelineProps {
    deliveryStage: number; // 0, 1, 2
}

const stages = ["Not Started", "In Transit", "Delivered"];

export default function DeliveryTimeline({ deliveryStage }: DeliveryTimelineProps) {
    return (
        <div className="w-full py-4">
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                {stages.map((stage, index) => {
                    const isActive = index <= deliveryStage;
                    const isCurrent = index === deliveryStage;

                    return (
                        <div key={stage} className="flex flex-col items-center bg-white dark:bg-gray-900 px-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isActive
                                        ? "bg-blue-600 border-blue-600 text-white"
                                        : "bg-white border-gray-300 text-gray-500"
                                    }`}
                            >
                                {index + 1}
                            </div>
                            <span
                                className={`mt-2 text-xs font-medium ${isCurrent ? "text-blue-600" : "text-gray-500"
                                    }`}
                            >
                                {stage}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
