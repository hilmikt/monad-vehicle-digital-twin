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

export const useActivityFeedStore = create<ActivityState>((set) => ({
    activities: [],
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
