export type DemoVehicle = {
    id: string;
    name: string;
    model: string;
    year: string;
    image: string;
    priceLabel: string;     // e.g. "$59,990"
    mileage?: string;       // e.g. "12,371 miles"
    softwareVersion?: string; // e.g. "2023.27.12"
    pastSales?: string;     // e.g. "2022 - $59,990"
    serviceRecords?: string[]; // e.g. ["2022 / Enhanced autopilot", "2023 / Tire rotation and alignment"]
};

export const demoVehicles: DemoVehicle[] = [
    {
        id: "demo-1",
        name: "Tesla Model 3 Long Range",
        model: "Model 3",
        year: "2023",
        image: "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-3-Main-Hero-Desktop-LHD.png",
        priceLabel: "$47,240",
        mileage: "1,200 miles",
        softwareVersion: "2023.44.30.8",
        pastSales: "2023 - $52,990",
        serviceRecords: ["2023 / Initial Delivery Inspection"]
    },
    {
        id: "demo-2",
        name: "Tesla Model Y Performance",
        model: "Model Y",
        year: "2024",
        image: "https://digitalassets.tesla.com/tesla-contents/image/upload/h_1800,w_2880,q_auto,f_auto/Model-Y-Main-Hero-Desktop-Global.jpg",
        priceLabel: "$52,490",
        mileage: "50 miles",
        softwareVersion: "2024.2.3",
        pastSales: "New Inventory",
        serviceRecords: []
    },
    {
        id: "demo-3",
        name: "BMW i4 eDrive40",
        model: "i4",
        year: "2024",
        image: "https://www.bmwusa.com/content/dam/bmwusa/common/vehicles/2023/my24/i-models/i4/gran-coupe/overview/mobile/BMW-MY24-i4-Gran-Coupe-Overview-Hero-Mobile.jpg",
        priceLabel: "$62,200",
        mileage: "15 miles",
        softwareVersion: "iDrive 8.5",
        pastSales: "New Inventory",
        serviceRecords: ["2024 / Pre-delivery inspection"]
    },
    {
        id: "demo-4",
        name: "Rivian R1T",
        model: "R1T",
        year: "2023",
        image: "https://images.rivian.com/2md5qhoeajym/530xs9l1r4SE4e9L2w6W6/5615a6064343a7b777a861621a755646/R1T-Motor-Dual-Large-2x.jpg",
        priceLabel: "$73,000",
        mileage: "5,400 miles",
        softwareVersion: "2023.46.0",
        pastSales: "2023 - $79,000",
        serviceRecords: ["2023 / Gear tunnel latch adjustment"]
    }
];
