export const IN_TRANSIT_COUNT = 2;

export const demoOrdersInTransit = [
    {
        id: "order-1",
        name: "Tesla Model 3 Long Range",
        model: "Model 3",
        year: "2023",
        image: "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-3-Main-Hero-Desktop-LHD.png",
        expectedInDays: 4,
        routeStops: [
            "Factory – Fremont, CA",
            "Regional Hub – Dallas, TX",
            "Delivery Center – Miami, FL",
        ],
        currentStopIndex: 1,
    },
    {
        id: "order-2",
        name: "BMW i4 eDrive40",
        model: "i4",
        year: "2022",
        image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2670&auto=format&fit=crop",
        expectedInDays: 2,
        routeStops: [
            "Factory – Munich, DE",
            "International Hub – New York, NY",
            "Your City – San Francisco, CA",
        ],
        currentStopIndex: 2,
    },
];
