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
        image: "https://www.carandbike.com/_next/image?url=https%3A%2F%2Fimages.carandbike.com%2Fcms%2Farticles%2F2025%2F5%2F3205535%2FP90546610_high_Res_the_new_bmw_i4_e_dri_95d352055b.jpg&w=640&q=90",
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
        image: "https://cdni.autocarindia.com/ExtraImages/20181128023148_94-rivian-r1t-reveal-static-front.jpg",
        priceLabel: "$73,000",
        mileage: "5,400 miles",
        softwareVersion: "2023.46.0",
        pastSales: "2023 - $79,000",
        serviceRecords: ["2023 / Gear tunnel latch adjustment"]
    },
    {
        id: "demo-5",
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
        id: "demo-6",
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
        id: "demo-7",
        name: "BMW i4 eDrive40",
        model: "i4",
        year: "2024",
        image: "https://www.carandbike.com/_next/image?url=https%3A%2F%2Fimages.carandbike.com%2Fcms%2Farticles%2F2025%2F5%2F3205535%2FP90546610_high_Res_the_new_bmw_i4_e_dri_95d352055b.jpg&w=640&q=90",
        priceLabel: "$62,200",
        mileage: "15 miles",
        softwareVersion: "iDrive 8.5",
        pastSales: "New Inventory",
        serviceRecords: ["2024 / Pre-delivery inspection"]
    },
    {
        id: "demo-8",
        name: "Rivian R1T",
        model: "R1T",
        year: "2023",
        image: "https://cdni.autocarindia.com/ExtraImages/20181128023148_94-rivian-r1t-reveal-static-front.jpg",
        priceLabel: "$73,000",
        mileage: "5,400 miles",
        softwareVersion: "2023.46.0",
        pastSales: "2023 - $79,000",
        serviceRecords: ["2023 / Gear tunnel latch adjustment"]
    },
    {
        id: "demo-9",
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
        id: "demo-10",
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
        id: "demo-11",
        name: "BMW i4 eDrive40",
        model: "i4",
        year: "2024",
        image: "https://www.carandbike.com/_next/image?url=https%3A%2F%2Fimages.carandbike.com%2Fcms%2Farticles%2F2025%2F5%2F3205535%2FP90546610_high_Res_the_new_bmw_i4_e_dri_95d352055b.jpg&w=640&q=90",
        priceLabel: "$62,200",
        mileage: "15 miles",
        softwareVersion: "iDrive 8.5",
        pastSales: "New Inventory",
        serviceRecords: ["2024 / Pre-delivery inspection"]
    },
    {
        id: "demo-12",
        name: "Rivian R1T",
        model: "R1T",
        year: "2023",
        image: "https://cdni.autocarindia.com/ExtraImages/20181128023148_94-rivian-r1t-reveal-static-front.jpg",
        priceLabel: "$73,000",
        mileage: "5,400 miles",
        softwareVersion: "2023.46.0",
        pastSales: "2023 - $79,000",
        serviceRecords: ["2023 / Gear tunnel latch adjustment"]
    }
];
