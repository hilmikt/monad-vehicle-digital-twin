"use client";

import React from "react";
import { demoOrdersInTransit } from "../../lib/ordersData";
import DeliveryProgress from "../../components/DeliveryProgress";

export default function OrdersPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
                <p className="text-gray-500 mt-1">Track vehicles currently in transit.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {demoOrdersInTransit.map((order) => (
                    <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                        {/* Image Section */}
                        <div className="h-48 bg-gray-100 relative">
                            <img
                                src={order.image}
                                alt={order.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 right-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 backdrop-blur-md">
                                    In Transit
                                </span>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-gray-900">{order.name}</h3>
                                <p className="text-sm text-gray-500">
                                    {order.year} {order.model}
                                </p>
                                <p className="text-sm font-medium text-emerald-600 mt-1">
                                    Delivery expected in {order.expectedInDays} days
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-6 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                                <DeliveryProgress currentStopIndex={order.currentStopIndex} stops={order.routeStops} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
