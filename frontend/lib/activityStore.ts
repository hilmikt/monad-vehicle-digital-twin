import { create } from 'zustand';

export type ActivityType = "MINT" | "PURCHASE" | "DELIVERY" | "SERVICE";

export interface ActivityItem {
    id: string;
    type: ActivityType;
    message: string;
    timestamp: number;
    txHash?: string;
}

interface ActivityState {
    activities: ActivityItem[];
    addActivity: (item: Omit<ActivityItem, "id" | "timestamp">) => void;
}

const now = Date.now();
const seedActivities: ActivityItem[] = [
    {
        id: "seed-1",
        type: "PURCHASE",
        message: "0x91a3…4B02 purchased Tesla Model 3",
        timestamp: now - 1000 * 60 * 3, // 3 mins ago
    },
    {
        id: "seed-2",
        type: "SERVICE",
        message: "Service added to BMW i4 – Tire rotation & alignment",
        timestamp: now - 1000 * 60 * 15, // 15 mins ago
    },
    {
        id: "seed-3",
        type: "DELIVERY",
        message: "Delivery for Audi e-tron advanced to Delivered",
        timestamp: now - 1000 * 60 * 45, // 45 mins ago
    },
    {
        id: "seed-4",
        type: "MINT",
        message: "New vehicle minted: Rivian R1T",
        timestamp: now - 1000 * 60 * 120, // 2 hours ago
    }
];

export const useActivityFeedStore = create<ActivityState>((set) => ({
    activities: seedActivities,
    addActivity: (item) => set((state) => {
        const newItem: ActivityItem = {
            ...item,
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
        };
        // Keep only latest 50
        return { activities: [newItem, ...state.activities].slice(0, 50) };
    }),
}));

