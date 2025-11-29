export const IN_TRANSIT_COUNT = 2;

export const demoOrdersInTransit = [
    {
        id: "order-1",
        name: "Rivian R1T",
        model: "R1T",
        year: "2023",
        image: "https://cdni.autocarindia.com/ExtraImages/20181128023148_94-rivian-r1t-reveal-static-front.jpg",
        expectedInDays: 4,
        routeStops: [
            "Factory – Normal, IL",
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
