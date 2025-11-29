import React from 'react';
import { DeliveryStage } from '../lib/contracts';

interface DeliveryTimelineProps {
    stage: DeliveryStage; // 0, 1, 2
}

export default function DeliveryTimeline({ stage }: DeliveryTimelineProps) {
    const steps = [
        { label: 'Order Placed', value: 0, color: 'bg-gray-500' },
        { label: 'In Transit', value: 1, color: 'bg-blue-500' },
        { label: 'Delivered', value: 2, color: 'bg-emerald-500' },
    ];

    return (
        <div className="w-full py-4">
            <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute left-0 top-[15px] w-full h-0.5 bg-gray-200 -z-10" />

                {steps.map((step, idx) => {
                    const isCompleted = stage >= step.value;
                    const isCurrent = stage === step.value;

                    return (
                        <div key={step.value} className="flex flex-col items-center bg-white px-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isCompleted ? `${step.color} border-transparent text-white` : 'bg-white border-gray-300 text-gray-300'}
                  ${isCurrent ? 'ring-4 ring-gray-100 scale-110' : ''}
                `}
                            >
                                {isCompleted ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="text-xs font-medium">{idx + 1}</span>
                                )}
                            </div>
                            <span className={`mt-3 text-xs font-bold tracking-wide uppercase ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
